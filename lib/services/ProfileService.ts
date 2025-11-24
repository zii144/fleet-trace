import UserService from './UserService'
import StatsService from './StatsService'
import QuestionnaireService from './QuestionnaireService'
import type { UserProfile, UserStats, SubmissionWithDetails } from '@/types/user'

export class ProfileService {
  private static instance: ProfileService
  private userService: UserService
  private statsService: StatsService
  private questionnaireService: QuestionnaireService

  private constructor() {
    this.userService = UserService.getInstance()
    this.statsService = StatsService.getInstance()
    this.questionnaireService = QuestionnaireService.getInstance()
  }

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

  /**
   * Get complete user profile data
   */
  async getCompleteProfile(userId: string): Promise<{
    profile: UserProfile | null
    stats: UserStats
    submissions: SubmissionWithDetails[]
  }> {
    try {
      console.log('🔄 Loading complete profile for user:', userId)

      // Load data in parallel for better performance
      const [profile, stats, submissions] = await Promise.all([
        this.userService.getProfile(userId),
        this.statsService.getUserStats(userId),
        this.questionnaireService.getUserSubmissions(userId)
      ])

      console.log('✅ Complete profile loaded successfully')
      return { profile, stats, submissions }
    } catch (error) {
      console.error('❌ Error loading complete profile:', error)
      throw new Error(`Failed to load complete profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user profile and refresh stats
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await this.userService.updateProfile(userId, updates)
      
      // Update last active timestamp
      await this.userService.updateLastActive(userId)
      
      console.log('✅ Profile updated successfully')
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      throw error
    }
  }

  /**
   * Submit questionnaire response and update stats
   */
  async submitQuestionnaireResponse(
    userId: string, 
    response: Omit<import('@/types/questionnaire').QuestionnaireResponse, 'id'>
  ): Promise<string> {
    try {
      console.log('📝 Starting comprehensive questionnaire submission for user:', userId)
      
      // 1. Submit the response first
      const responseId = await this.questionnaireService.submitResponse(response)
      console.log('✅ Response submitted with ID:', responseId)
      
      // 2. Update user profile with post-submission data
      await this.updateUserPostSubmission(userId, response)
      
      // 3. Invalidate stats cache and recalculate
      await this.statsService.invalidateCache(userId)
      const freshStats = await this.statsService.getUserStats(userId, false)
      console.log('📊 Fresh stats calculated:', freshStats)
      
      // 4. Update user's last active timestamp and submission count
      await this.userService.updateLastActive(userId)
      
      // 5. Perform post-calculation updates (rank, vouchers, etc.)
      await this.performPostCalculationUpdates(userId, freshStats)
      
      console.log('✅ Complete questionnaire submission and stats update completed')
      return responseId
    } catch (error) {
      console.error('❌ Error submitting response:', error)
      throw error
    }
  }

  /**
   * Update user profile fields after questionnaire submission
   */
  private async updateUserPostSubmission(
    userId: string, 
    response: Omit<import('@/types/questionnaire').QuestionnaireResponse, 'id'>
  ): Promise<void> {
    try {
      console.log('🔄 Updating user profile post-submission')
      
      // Get current profile
      const currentProfile = await this.userService.getProfile(userId)
      if (!currentProfile) {
        throw new Error('User profile not found')
      }
      
      // Calculate incremental updates
      const incrementalUpdates = {
        totalSubmissions: currentProfile.totalSubmissions + 1,
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Update user profile
      await this.userService.updateProfile(userId, incrementalUpdates)
      
      console.log('✅ User profile updated with post-submission data')
    } catch (error) {
      console.error('❌ Error updating user post-submission:', error)
      // Don't throw error to avoid breaking the submission flow
    }
  }

  /**
   * Perform post-calculation updates like rank, vouchers, etc.
   */
  private async performPostCalculationUpdates(
    userId: string, 
    stats: UserStats
  ): Promise<void> {
    try {
      console.log('🔄 Performing post-calculation updates')
      
      // Calculate rank based on updated stats
      const rankInfo = await this.getUserRankInfo(userId)
      console.log('🏆 Rank info:', rankInfo)
      
      // Calculate available questionnaire rate
      const availableQuestionnaireRate = Math.min(100, Math.round((stats.totalSubmissions / 10) * 100))
      
      // Calculate cash vouchers
      const cashVoucher = Math.floor(stats.totalSubmissions / 5) * 5
      
      // Log the updates
      console.log('📈 Post-calculation updates:', {
        rank: rankInfo.currentRank,
        availableQuestionnaireRate,
        cashVoucher,
        totalSubmissions: stats.totalSubmissions,
        completionRate: stats.completionRate,
        qualityScore: stats.qualityScore,
        consistencyScore: stats.consistencyScore
      })
      
      console.log('✅ Post-calculation updates completed')
    } catch (error) {
      console.error('❌ Error performing post-calculation updates:', error)
      // Don't throw error to avoid breaking the submission flow
    }
  }

  /**
   * Get user statistics with fresh calculation option
   */
  async getUserStats(userId: string, forceRefresh: boolean = false): Promise<UserStats> {
    try {
      return await this.statsService.getUserStats(userId, !forceRefresh)
    } catch (error) {
      console.error('❌ Error getting user stats:', error)
      throw error
    }
  }

  /**
   * Get user submissions with pagination
   */
  async getUserSubmissions(
    userId: string, 
    options: { limit?: number; offset?: number } = {}
  ): Promise<SubmissionWithDetails[]> {
    try {
      const submissions = await this.questionnaireService.getUserSubmissions(userId)
      
      const { limit = 10, offset = 0 } = options
      return submissions.slice(offset, offset + limit)
    } catch (error) {
      console.error('❌ Error getting user submissions:', error)
      throw error
    }
  }

  /**
   * Get user rank information
   */
  async getUserRankInfo(userId: string): Promise<{
    currentRank: string
    nextRank: string | null
    pointsToNext: number
    currentPoints: number
  }> {
    try {
      const stats = await this.statsService.getUserStats(userId)
      
      // Calculate current points
      const currentPoints = stats.totalSubmissions * 100 + 
                          Math.round(stats.completionRate * 10) + 
                          Math.round((stats.qualityScore || 0) * 5)
      
      // Define rank thresholds
      const ranks = [
        { name: "新手會員", threshold: 0 },
        { name: "銅牌會員", threshold: 500 },
        { name: "銀牌會員", threshold: 1000 },
        { name: "金牌會員", threshold: 2000 },
        { name: "鑽石會員", threshold: 3000 }
      ]
      
      // Find current and next rank
      const currentRankIndex = ranks.findIndex(rank => currentPoints >= rank.threshold)
      const currentRank = ranks[currentRankIndex]?.name || "新手會員"
      
      const nextRankIndex = currentRankIndex + 1
      const nextRank = nextRankIndex < ranks.length ? ranks[nextRankIndex] : null
      
      const pointsToNext = nextRank ? nextRank.threshold - currentPoints : 0
      
      return {
        currentRank,
        nextRank: nextRank?.name || null,
        pointsToNext,
        currentPoints
      }
    } catch (error) {
      console.error('❌ Error getting user rank info:', error)
      throw error
    }
  }

  /**
   * Get user achievement data
   */
  async getUserAchievements(userId: string): Promise<{
    achievements: Array<{
      id: string
      name: string
      description: string
      achieved: boolean
      achievedAt?: string
      progress?: number
    }>
  }> {
    try {
      const stats = await this.statsService.getUserStats(userId)
      
      const achievements = [
        {
          id: 'first_submission',
          name: '初次提交',
          description: '完成第一份評鑑調查',
          achieved: stats.totalSubmissions > 0,
          achievedAt: stats.totalSubmissions > 0 ? stats.lastSubmission : undefined
        },
        {
          id: 'bronze_member',
          name: '銅牌會員',
          description: '達到銅牌會員等級',
          achieved: stats.rank !== '新手會員',
          progress: Math.min(100, (stats.totalSubmissions * 100) / 500 * 100)
        },
        {
          id: 'perfect_completion',
          name: '完美完成',
          description: '完成一份100%的評鑑調查',
          achieved: (stats.perfectCompletions || 0) > 0
        },
        {
          id: 'streak_master',
          name: '連續大師',
          description: '連續完成7份評鑑調查',
          achieved: (stats.completionStreak || 0) >= 7,
          progress: Math.min(100, ((stats.completionStreak || 0) / 7) * 100)
        },
        {
          id: 'quality_writer',
          name: '優質作者',
          description: '質量分數達到80分',
          achieved: (stats.qualityScore || 0) >= 80,
          progress: Math.min(100, (stats.qualityScore || 0))
        }
      ]
      
      return { achievements }
    } catch (error) {
      console.error('❌ Error getting user achievements:', error)
      throw error
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId: string, 
    options: { limit?: number; dateFrom?: string; dateTo?: string } = {}
  ): Promise<Array<{
    id: string
    type: 'submission' | 'achievement' | 'rank_change'
    timestamp: string
    data: Record<string, any>
  }>> {
    try {
      const { limit = 20, dateFrom, dateTo } = options
      
      // Get user submissions
      const submissions = await this.questionnaireService.searchResponses({
        userId,
        dateFrom,
        dateTo
      })
      
      // Convert to activity timeline
      const activities = submissions.slice(0, limit).map(submission => ({
        id: submission.id,
        type: 'submission' as const,
        timestamp: submission.submittedAt,
        data: {
          questionnaireId: submission.questionnaireId,
          completionPercentage: submission.completionPercentage,
          timeSpent: submission.timeSpentSeconds,
          score: submission.completionPercentage || 0
        }
      }))
      
      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      return activities
    } catch (error) {
      console.error('❌ Error getting user activity timeline:', error)
      throw error
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<{
    profile: UserProfile | null
    stats: UserStats
    submissions: SubmissionWithDetails[]
    achievements: any
    timeline: any[]
  }> {
    try {
      const [profileData, achievements, timeline] = await Promise.all([
        this.getCompleteProfile(userId),
        this.getUserAchievements(userId),
        this.getUserActivityTimeline(userId, { limit: 100 })
      ])
      
      return {
        ...profileData,
        achievements,
        timeline
      }
    } catch (error) {
      console.error('❌ Error exporting user data:', error)
      throw error
    }
  }

  /**
   * Clear user cache
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      await this.statsService.invalidateCache(userId)
      console.log('✅ User cache cleared')
    } catch (error) {
      console.error('❌ Error clearing user cache:', error)
      throw error
    }
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    userService: boolean
    statsService: boolean
    questionnaireService: boolean
  } {
    return {
      userService: !!this.userService,
      statsService: !!this.statsService,
      questionnaireService: !!this.questionnaireService
    }
  }
}

export default ProfileService
