import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import QuestionnaireService from './QuestionnaireService'
import type { UserStats, UserStatsCache, CacheEntry } from '@/types/user'
import type { QuestionnaireResponse } from '@/types/questionnaire'

export class StatsService {
  private static instance: StatsService
  private readonly COLLECTION = 'user_stats'
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  private cache: UserStatsCache = {}
  private questionnaireService: QuestionnaireService

  constructor() {
    this.questionnaireService = QuestionnaireService.getInstance()
  }

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService()
    }
    return StatsService.instance
  }

  /**
   * Get user statistics with intelligent caching
   */
  async getUserStats(userId: string, useCache: boolean = true): Promise<UserStats> {
    try {
      // Check cache first
      if (useCache && this.isCacheValid(userId)) {
        console.log('📊 Using cached stats for user:', userId)
        return this.cache[userId].data
      }

      // Try to get from database cache
      const cachedStats = await this.getCachedStatsFromDB(userId)
      if (cachedStats && useCache) {
        console.log('📊 Using database cached stats for user:', userId)
        this.updateLocalCache(userId, cachedStats)
        return cachedStats
      }

      // Calculate fresh stats
      console.log('📊 Calculating fresh stats for user:', userId)
      const stats = await this.calculateStats(userId)
      
      // Cache the results
      await this.saveStatsToCache(userId, stats)
      this.updateLocalCache(userId, stats)
      
      return stats
    } catch (error) {
      console.error('❌ Error getting user stats:', error)
      return this.getDefaultStats()
    }
  }

  /**
   * Calculate user statistics from questionnaire responses
   */
  private async calculateStats(userId: string): Promise<UserStats> {
    try {
      const responses = await this.questionnaireService.getResponsesByUserId(userId)
      
      if (responses.length === 0) {
        return this.getDefaultStats()
      }

      return this.processResponses(responses)
    } catch (error) {
      console.error('❌ Error calculating stats:', error)
      return this.getDefaultStats()
    }
  }

  /**
   * Process questionnaire responses to calculate statistics
   */
  private processResponses(responses: QuestionnaireResponse[]): UserStats {
    const completedResponses = responses.filter(r => r.status === 'completed')
    const totalSubmissions = completedResponses.length
    
    console.log('📊 Processing responses for stats calculation:', {
      totalResponses: responses.length,
      completedResponses: completedResponses.length
    })
    
    // Time-based calculations
    const totalTimeSpent = responses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0)
    const averageTimePerQuestionnaire = totalSubmissions > 0 ? 
      Math.round(totalTimeSpent / totalSubmissions) : 0
    
    // Content calculations with better handling
    const totalCharactersWritten = responses.reduce((sum, r) => {
      if (r.totalCharactersWritten) {
        return sum + r.totalCharactersWritten
      }
      // Enhanced fallback calculation
      return sum + Object.values(r.responses).reduce((charSum, value) => {
        if (typeof value === 'string') {
          return charSum + value.length
        } else if (Array.isArray(value)) {
          return charSum + value.reduce((arrSum, item) => {
            if (typeof item === 'string') return arrSum + item.length
            if (typeof item === 'object' && item.answer) return arrSum + item.answer.length
            return arrSum
          }, 0)
        } else if (typeof value === 'object' && value !== null) {
          return charSum + Object.values(value).reduce((objSum: number, objValue) => {
            if (typeof objValue === 'string') return objSum + objValue.length
            return objSum
          }, 0)
        }
        return charSum
      }, 0)
    }, 0)
    
    const textResponsesCount = responses.reduce((sum, r) => sum + (r.textResponsesCount || 0), 0)
    const mapSelectionsCount = responses.reduce((sum, r) => sum + (r.mapSelectionsCount || 0), 0)
    
    // Enhanced completion calculations
    const totalPossibleQuestions = responses.reduce((sum, r) => sum + (r.totalQuestions || 6), 0)
    const totalAnsweredQuestions = responses.reduce((sum, r) => sum + (r.answeredQuestions || 0), 0)
    const completionRate = totalPossibleQuestions > 0 ? 
      Math.round((totalAnsweredQuestions / totalPossibleQuestions) * 100) : 0
    
    const averageCompletionRate = responses.length > 0 ? 
      responses.reduce((sum, r) => sum + (r.completionPercentage || 0), 0) / responses.length : 0
    
    const perfectCompletions = responses.filter(r => (r.completionPercentage || 0) === 100).length
    
    // Device usage tracking
    const deviceUsage = responses.reduce((usage, r) => {
      const device = r.deviceType || 'desktop'
      usage[device] = (usage[device] || 0) + 1
      return usage
    }, { desktop: 0, mobile: 0, tablet: 0 })
    
    // Enhanced quality score calculation
    const qualityScore = Math.round(
      (averageCompletionRate * 0.4) + 
      (Math.min(100, (averageTimePerQuestionnaire / 300) * 100) * 0.3) + 
      (Math.min(100, (totalCharactersWritten / 1000) * 100) * 0.3)
    )
    
    // Consistency and streaks calculation
    const sortedResponses = responses.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    
    const { completionStreak, longestStreak } = this.calculateStreaks(sortedResponses)
    const consistencyScore = Math.min(100, (completionStreak / 10) * 100)
    
    // Enhanced rank calculation
    const basePoints = totalSubmissions * 100
    const completionBonus = Math.round(completionRate * 10)
    const qualityBonus = Math.round(qualityScore * 5)
    const timeBonus = Math.round((averageTimePerQuestionnaire / 600) * 50) // Bonus for spending time
    const contentBonus = Math.round((totalCharactersWritten / 5000) * 25) // Bonus for detailed responses
    const totalPoints = basePoints + completionBonus + qualityBonus + timeBonus + contentBonus
    
    const rank = this.calculateRank(totalPoints)
    
    // Cash vouchers calculation
    const cashVoucher = Math.floor(totalSubmissions / 5) * 5
    const referralCashVoucher = 0 // Implement referral logic as needed
    
    // Available questionnaire rate calculation
    const availableQuestionnaireRate = Math.min(100, Math.round((totalSubmissions / 10) * 100))
    
    const lastSubmission = sortedResponses[0]?.submittedAt || new Date().toISOString()
    
    const calculatedStats: UserStats = {
      cashVoucher,
      referralCashVoucher,
      totalSubmissions,
      completionRate,
      lastSubmission,
      rank,
      availableQuestionnaireRate,
      totalCharactersWritten,
      totalTimeSpent,
      averageTimePerQuestionnaire,
      textResponsesCount,
      mapSelectionsCount,
      averageCompletionRate: Math.round(averageCompletionRate),
      perfectCompletions,
      deviceUsage,
      qualityScore,
      consistencyScore: Math.round(consistencyScore),
      completionStreak,
      longestStreak
    }
    
    console.log('📈 Stats calculated:', {
      totalSubmissions,
      completionRate,
      qualityScore,
      rank,
      totalCharactersWritten,
      totalTimeSpent: totalTimeSpent,
      averageTimePerQuestionnaire
    })
    
    return calculatedStats
  }

  /**
   * Calculate completion streaks
   */
  private calculateStreaks(sortedResponses: QuestionnaireResponse[]): { completionStreak: number, longestStreak: number } {
    let completionStreak = 0
    let longestStreak = 0
    let currentStreak = 0
    
    for (let i = 0; i < sortedResponses.length; i++) {
      const currentDate = new Date(sortedResponses[i].submittedAt)
      const daysDiff = i === 0 ? 0 : Math.floor(
        (new Date(sortedResponses[i-1].submittedAt).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysDiff <= 7) { // Within a week
        currentStreak++
      } else {
        if (currentStreak > longestStreak) longestStreak = currentStreak
        currentStreak = 1
      }
    }
    
    completionStreak = currentStreak
    if (currentStreak > longestStreak) longestStreak = currentStreak
    
    return { completionStreak, longestStreak }
  }

  /**
   * Calculate user rank based on points
   */
  private calculateRank(totalPoints: number): string {
    if (totalPoints >= 3000) return "鑽石會員"
    if (totalPoints >= 2000) return "金牌會員"
    if (totalPoints >= 1000) return "銀牌會員"
    if (totalPoints >= 500) return "銅牌會員"
    return "新手會員"
  }

  /**
   * Get default statistics
   */
  private getDefaultStats(): UserStats {
    return {
      cashVoucher: 0,
      referralCashVoucher: 0,
      totalSubmissions: 0,
      completionRate: 0,
      lastSubmission: new Date().toISOString(),
      rank: "新手會員",
      availableQuestionnaireRate: 0,
      totalCharactersWritten: 0,
      totalTimeSpent: 0,
      averageTimePerQuestionnaire: 0,
      textResponsesCount: 0,
      mapSelectionsCount: 0,
      averageCompletionRate: 0,
      perfectCompletions: 0,
      deviceUsage: { desktop: 0, mobile: 0, tablet: 0 },
      qualityScore: 0,
      consistencyScore: 0,
      completionStreak: 0,
      longestStreak: 0
    }
  }

  /**
   * Save statistics to database cache
   */
  private async saveStatsToCache(userId: string, stats: UserStats): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId)
      await setDoc(docRef, {
        ...stats,
        userId,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('❌ Error saving stats to cache:', error)
    }
  }

  /**
   * Get cached statistics from database
   */
  private async getCachedStatsFromDB(userId: string): Promise<UserStats | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Check if cache is still valid (within 1 hour)
        const updatedAt = data.updatedAt?.toDate?.()
        if (updatedAt && (Date.now() - updatedAt.getTime()) < 3600000) {
          return data as UserStats
        }
      }
      return null
    } catch (error) {
      console.error('❌ Error getting cached stats from DB:', error)
      return null
    }
  }

  /**
   * Update local cache
   */
  private updateLocalCache(userId: string, stats: UserStats): void {
    this.cache[userId] = {
      data: stats,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    }
  }

  /**
   * Check if local cache is valid
   */
  private isCacheValid(userId: string): boolean {
    const cacheEntry = this.cache[userId]
    if (!cacheEntry) return false
    
    return (Date.now() - cacheEntry.timestamp) < cacheEntry.ttl
  }

  /**
   * Invalidate cache for user
   */
  async invalidateCache(userId: string): Promise<void> {
    delete this.cache[userId]
    
    // Also update database cache timestamp to force refresh
    try {
      const docRef = doc(db, this.COLLECTION, userId)
      await updateDoc(docRef, {
        updatedAt: new Date(0) // Force refresh by setting old timestamp
      })
    } catch (error) {
      console.error('❌ Error invalidating cache:', error)
    }
  }

  /**
   * Clear all local cache
   */
  clearAllCache(): void {
    this.cache = {}
  }

  /**
   * Get statistics for multiple users (batch operation)
   */
  async getBatchStats(userIds: string[]): Promise<Record<string, UserStats>> {
    const results: Record<string, UserStats> = {}
    
    const promises = userIds.map(async (userId) => {
      try {
        const stats = await this.getUserStats(userId)
        results[userId] = stats
      } catch (error) {
        console.error(`❌ Error getting stats for user ${userId}:`, error)
        results[userId] = this.getDefaultStats()
      }
    })
    
    await Promise.all(promises)
    return results
  }
}

export default StatsService
