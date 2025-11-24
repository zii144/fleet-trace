import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { getResponsesByUserId } from './firebase-questionnaires'
import type { QuestionnaireResponse } from '@/types/questionnaire'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  totalSubmissions: number
  lastActiveAt: string
  emailVerified?: boolean
  role?: 'admin' | 'user'  // Add role field
  preferences?: {
    notifications: boolean
    emailUpdates: boolean
  }
}

export interface UserStats {
  // Basic stats
  cashVoucher: number
  referralCashVoucher: number
  totalSubmissions: number  
  completionRate: number
  lastSubmission: string
  rank: string
  availableQuestionnaireRate: number 
  totalCharactersWritten: number
  
  // Enhanced stats
  totalTimeSpent?: number // in seconds
  averageTimePerQuestionnaire?: number // in seconds
  textResponsesCount?: number
  mapSelectionsCount?: number
  averageCompletionRate?: number
  perfectCompletions?: number
  deviceUsage?: {
    desktop: number
    mobile: number
    tablet: number
  }
  qualityScore?: number
  consistencyScore?: number
  completionStreak?: number
  longestStreak?: number
}

export interface SubmissionWithDetails extends QuestionnaireResponse {
  questionnaireName: string
  score: number
}

// Collections
const USERS_COLLECTION = 'users'
const USER_STATS_COLLECTION = 'user_stats'

// User Profile CRUD operations
export async function createUserProfile(userId: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    console.log('📝 Creating user profile for user ID:', userId)
    console.log('👤 Profile data:', profile)
    
    const docRef = doc(db, USERS_COLLECTION, userId)
    await setDoc(docRef, {
      ...profile,
      role: profile.role || 'user', // Default to user role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    })
    
    console.log('✅ User profile created successfully')
  } catch (error) {
    console.error('❌ Error creating user profile:', error)
    console.error('🔍 User ID:', userId)
    console.error('🔍 Profile:', profile)
    throw error
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastActiveAt: data.lastActiveAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    console.log('📝 Updating user profile for:', userId)
    console.log('🔄 Updates:', updates)
    
    const docRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    })
    
    console.log('✅ User profile updated successfully')
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    console.error('🔍 User ID:', userId)
    console.error('🔍 Updates:', updates)
    throw error
  }
}

// Function to update user role (admin only)
export async function updateUserRole(userId: string, newRole: 'admin' | 'user'): Promise<void> {
  try {
    console.log(`🔧 Updating user role for ${userId} to ${newRole}`)
    
    const docRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ User role updated successfully')
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    throw error
  }
}

// Function to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(userId)
    return userProfile?.role === 'admin'
  } catch (error) {
    console.error('❌ Error checking user admin status:', error)
    return false
  }
}

// User Statistics functions
export async function calculateUserStats(userId: string): Promise<UserStats> {
  try {
    // Get user's questionnaire responses
    const responses = await getResponsesByUserId(userId)
    
    if (responses.length === 0) {
      return {
        cashVoucher: 0,
        referralCashVoucher: 0,
        totalSubmissions: 0,
        completionRate: 0,
        lastSubmission: new Date().toISOString(),
        rank: "新手會員",
        availableQuestionnaireRate: 0,
        totalCharactersWritten: 0
      }
    }

    const completedResponses = responses.filter(r => r.status === 'completed')
    const totalSubmissions = completedResponses.length
    
    // Calculate average score (you might need to implement scoring logic)
    const totalPossibleSections = responses.reduce((sum, response) => {
      // Assuming each questionnaire has around 5-8 sections on average
      return sum + 6; // This should be calculated based on actual questionnaire structure
    }, 0)
    
    const totalCompletedSections = responses.reduce((sum, response) => 
      sum + response.completedSections.length, 0
    )
    
    const completionRate = totalPossibleSections > 0 
      ? Math.round((totalCompletedSections / totalPossibleSections) * 100) 
      : 0

    // Sort by submission date to get the latest
    const sortedResponses = responses.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    const lastSubmission = sortedResponses[0]?.submittedAt || new Date().toISOString()

    // Calculate points based on submissions and completion
    const basePoints = totalSubmissions * 100 // 100 points per submission
    const completionBonus = Math.round(completionRate * 10) // Bonus based on completion rate
    const totalPoints = basePoints + completionBonus

    // Determine rank based on total points
    let rank = "新手會員"
    if (totalPoints >= 3000) rank = "鑽石會員"
    else if (totalPoints >= 2000) rank = "金牌會員"
    else if (totalPoints >= 1000) rank = "銀牌會員"
    else if (totalPoints >= 500) rank = "銅牌會員"

    // Calculate cash vouchers based on submissions and rank
    const cashVoucher = Math.floor(totalSubmissions / 5) * 5 // 5 voucher per 5 submissions
    const referralCashVoucher = 0 // Implement referral logic as needed

    // Calculate total characters written (sum all text responses)
    const totalCharactersWritten = responses.reduce((total, response) => {
      return total + Object.values(response.responses).reduce((sum, value) => {
        if (typeof value === 'string') {
          return sum + value.length
        }
        return sum
      }, 0)
    }, 0)

    // Calculate available questionnaire rate (this would need actual questionnaire count)
    const availableQuestionnaireRate = Math.min(100, Math.round((totalSubmissions / 10) * 100))

    return {
      cashVoucher,
      referralCashVoucher,
      totalSubmissions,
      completionRate,
      lastSubmission,
      rank,
      availableQuestionnaireRate,
      totalCharactersWritten
    }
  } catch (error) {
    console.error('Error calculating user stats:', error)
    throw error
  }
}

export async function getUserSubmissions(userId: string): Promise<SubmissionWithDetails[]> {
  try {
    const responses = await getResponsesByUserId(userId)
    
    // For each response, we need to get the questionnaire name and calculate score
    const submissionsWithDetails: SubmissionWithDetails[] = []
    
    for (const response of responses) {
      // You'll need to implement scoring logic based on your questionnaire structure
      const score = calculateResponseScore(response)
      
      // Get questionnaire name (you might want to cache this or join the data)
      const questionnaireName = await getQuestionnaireName(response.questionnaireId)
      
      submissionsWithDetails.push({
        ...response,
        questionnaireName,
        score
      })
    }
    
    return submissionsWithDetails.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  } catch (error) {
    console.error('Error getting user submissions:', error)
    throw error
  }
}

// Helper function to calculate response score
function calculateResponseScore(response: QuestionnaireResponse): number {
  // Implement your scoring logic here
  // This is a simple example - you'll want to customize based on your needs
  const completedSectionsCount = response.completedSections.length
  const totalResponsesCount = Object.keys(response.responses).length
  
  // Basic scoring: completion rate * base score
  const completionScore = completedSectionsCount * 15 // 15 points per completed section
  const responseScore = totalResponsesCount * 2 // 2 points per response
  
  return Math.min(100, completionScore + responseScore)
}

// Helper function to get questionnaire name
async function getQuestionnaireName(questionnaireId: string): Promise<string> {
  try {
    const { getQuestionnaireById } = await import('./questionnaire')
    const questionnaire = getQuestionnaireById(questionnaireId)
    return questionnaire?.title || 'Unknown Questionnaire'
  } catch (error) {
    console.error('Error getting questionnaire name:', error)
    return 'Unknown Questionnaire'
  }
}

// Function to get score color class
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
  if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200"
  if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
  return "text-red-600 bg-red-50 border-red-200"
}

// Function to get rank color class
export function getRankColor(rank: string): string {
  switch (rank) {
    case "鑽石會員": return "bg-purple-500 text-white"
    case "金牌會員": return "bg-yellow-500 text-white"
    case "銀牌會員": return "bg-gray-400 text-white"
    case "銅牌會員": return "bg-amber-600 text-white"
    default: return "bg-gray-200 text-gray-800"
  }
}

// Function to get membership tier based on total submissions
export function getUserMembershipTier(totalSubmissions: number): string {
  if (totalSubmissions >= 30) return "鑽石會員";
  if (totalSubmissions >= 20) return "金牌會員";
  if (totalSubmissions >= 15) return "銀牌會員";
  if (totalSubmissions >= 10) return "銅牌會員";
  return "新手會員";
}

// Save user stats to Firebase (for caching/performance)
export async function saveUserStats(userId: string, stats: UserStats): Promise<void> {
  try {
    const docRef = doc(db, USER_STATS_COLLECTION, userId)
    await updateDoc(docRef, {
      ...stats,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, USER_STATS_COLLECTION), {
        userId,
        ...stats,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })
  } catch (error) {
    console.error('Error saving user stats:', error)
    throw error
  }
}

// Get cached user stats from Firebase
export async function getCachedUserStats(userId: string): Promise<UserStats | null> {
  try {
    const docRef = doc(db, USER_STATS_COLLECTION, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        cashVoucher: data.cashVoucher || 0,
        referralCashVoucher: data.referralCashVoucher || 0,
        totalSubmissions: data.totalSubmissions || 0,
        completionRate: data.completionRate || 0,
        lastSubmission: data.lastSubmission || new Date().toISOString(),
        rank: data.rank || "新手會員",
        availableQuestionnaireRate: data.availableQuestionnaireRate || 0,
        totalCharactersWritten: data.totalCharactersWritten || 0
      }
    }
    return null
  } catch (error) {
    console.error('Error getting cached user stats:', error)
    throw error
  }
}

// Enhanced User Statistics functions with detailed metrics
export async function calculateEnhancedUserStats(userId: string): Promise<UserStats> {
  try {
    // Get user's questionnaire responses
    const responses = await getResponsesByUserId(userId)
    
    if (responses.length === 0) {
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

    const completedResponses = responses.filter(r => r.status === 'completed')
    const totalSubmissions = completedResponses.length
    
    // Calculate time-based statistics
    const totalTimeSpent = responses.reduce((sum, response) => {
      return sum + (response.timeSpentSeconds || 0)
    }, 0)
    
    const averageTimePerQuestionnaire = totalSubmissions > 0 ? 
      Math.round(totalTimeSpent / totalSubmissions) : 0
    
    // Calculate content statistics
    const totalCharactersWritten = responses.reduce((total, response) => {
      if (response.totalCharactersWritten) {
        return total + response.totalCharactersWritten
      }
      // Fallback to manual calculation if not tracked
      return total + Object.values(response.responses).reduce((sum, value) => {
        if (typeof value === 'string') {
          return sum + value.length
        }
        return sum
      }, 0)
    }, 0)
    
    const textResponsesCount = responses.reduce((total, response) => {
      return total + (response.textResponsesCount || 0)
    }, 0)
    
    const mapSelectionsCount = responses.reduce((total, response) => {
      return total + (response.mapSelectionsCount || 0)
    }, 0)
    
    // Calculate completion statistics
    const totalPossibleSections = responses.reduce((sum, response) => {
      return sum + (response.totalQuestions || 6); // Default to 6 if not tracked
    }, 0)
    
    const totalCompletedSections = responses.reduce((sum, response) => 
      sum + response.completedSections.length, 0
    )
    
    const completionRate = totalPossibleSections > 0 ? 
      Math.round((totalCompletedSections / totalPossibleSections) * 100) : 0
    
    const averageCompletionRate = responses.length > 0 ? 
      responses.reduce((sum, response) => sum + (response.completionPercentage || 0), 0) / responses.length : 0
    
    const perfectCompletions = responses.filter(r => (r.completionPercentage || 0) === 100).length
    
    // Calculate device usage
    const deviceUsage = responses.reduce((usage, response) => {
      const device = response.deviceType || 'desktop'
      usage[device] = (usage[device] || 0) + 1
      return usage
    }, { desktop: 0, mobile: 0, tablet: 0 })
    
    // Calculate quality score (0-100)
    const qualityScore = Math.round(
      (averageCompletionRate * 0.4) + 
      (Math.min(100, (averageTimePerQuestionnaire / 300) * 100) * 0.3) + // 300s as ideal time
      (Math.min(100, (totalCharactersWritten / 1000) * 100) * 0.3) // 1000 chars as good engagement
    )
    
    // Calculate consistency score based on submission frequency
    const sortedResponses = responses.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    
    let completionStreak = 0
    let longestStreak = 0
    let currentStreak = 0
    
    // Simple streak calculation - could be enhanced with daily tracking
    for (let i = 0; i < sortedResponses.length; i++) {
      const currentDate = new Date(sortedResponses[i].submittedAt)
      const daysDiff = i === 0 ? 0 : Math.floor((new Date(sortedResponses[i-1].submittedAt).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 7) { // Within a week
        currentStreak++
      } else {
        if (currentStreak > longestStreak) longestStreak = currentStreak
        currentStreak = 1
      }
    }
    
    completionStreak = currentStreak
    if (currentStreak > longestStreak) longestStreak = currentStreak
    
    const consistencyScore = Math.min(100, (completionStreak / 10) * 100)
    
    const lastSubmission = sortedResponses[0]?.submittedAt || new Date().toISOString()

    // Calculate points based on submissions and completion
    const basePoints = totalSubmissions * 100 // 100 points per submission
    const completionBonus = Math.round(completionRate * 10) // Bonus based on completion rate
    const qualityBonus = Math.round(qualityScore * 5) // Quality bonus
    const totalPoints = basePoints + completionBonus + qualityBonus

    // Determine rank based on total points
    let rank = "新手會員"
    if (totalPoints >= 3000) rank = "鑽石會員"
    else if (totalPoints >= 2000) rank = "金牌會員"
    else if (totalPoints >= 1000) rank = "銀牌會員"
    else if (totalPoints >= 500) rank = "銅牌會員"

    // Calculate cash vouchers based on submissions and rank
    const cashVoucher = Math.floor(totalSubmissions / 5) * 5 // 5 voucher per 5 submissions
    const referralCashVoucher = 0 // Implement referral logic as needed

    // Calculate available questionnaire rate (this would need actual questionnaire count)
    const availableQuestionnaireRate = Math.min(100, Math.round((totalSubmissions / 10) * 100))

    const result = {
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

    console.log('📊 Enhanced user stats calculated:', {
      userId,
      totalSubmissions,
      totalTimeSpent,
      totalCharactersWritten,
      textResponsesCount,
      mapSelectionsCount,
      deviceUsage,
      qualityScore,
      completionStreak
    })

    return result
  } catch (error) {
    console.error('Error calculating enhanced user stats:', error)
    throw error
  }
}
