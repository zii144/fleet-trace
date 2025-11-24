import ProfileService from './services/ProfileService'
import type { UserStats, SubmissionWithDetails } from '@/types/user'

// Export types for backward compatibility
export type { UserStats, SubmissionWithDetails }

// Get the ProfileService instance
const profileService = ProfileService.getInstance()

// Main function to get user statistics (with caching) - Enhanced version
export async function calculateUserStats(userId: string, useCache: boolean = true): Promise<UserStats> {
  try {
    console.log('📊 Getting user stats for:', userId)
    return await profileService.getUserStats(userId, !useCache)
  } catch (error) {
    console.error('Error calculating user stats:', error)
    // Return default enhanced stats on error
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
}

// Function to get user submissions
export async function getUserSubmissions(userId: string): Promise<SubmissionWithDetails[]> {
  try {
    return await profileService.getUserSubmissions(userId)
  } catch (error) {
    console.error('Error getting user submissions:', error)
    return []
  }
}

// Function to get complete user profile
export async function getCompleteProfile(userId: string) {
  try {
    return await profileService.getCompleteProfile(userId)
  } catch (error) {
    console.error('Error getting complete profile:', error)
    throw error
  }
}

// Function to update user profile
export async function updateUserProfile(userId: string, updates: any) {
  try {
    return await profileService.updateProfile(userId, updates)
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Function to submit questionnaire response
export async function submitQuestionnaireResponse(userId: string, response: any) {
  try {
    return await profileService.submitQuestionnaireResponse(userId, response)
  } catch (error) {
    console.error('Error submitting questionnaire response:', error)
    throw error
  }
}

// Function to get user rank information
export async function getUserRankInfo(userId: string) {
  try {
    return await profileService.getUserRankInfo(userId)
  } catch (error) {
    console.error('Error getting user rank info:', error)
    throw error
  }
}

// Function to get user achievements
export async function getUserAchievements(userId: string) {
  try {
    return await profileService.getUserAchievements(userId)
  } catch (error) {
    console.error('Error getting user achievements:', error)
    throw error
  }
}

// Function to get user activity timeline
export async function getUserActivityTimeline(userId: string, options: any = {}) {
  try {
    return await profileService.getUserActivityTimeline(userId, options)
  } catch (error) {
    console.error('Error getting user activity timeline:', error)
    throw error
  }
}

// Function to export user data
export async function exportUserData(userId: string) {
  try {
    return await profileService.exportUserData(userId)
  } catch (error) {
    console.error('Error exporting user data:', error)
    throw error
  }
}

// Function to clear user cache
export async function clearUserCache(userId: string) {
  try {
    return await profileService.clearUserCache(userId)
  } catch (error) {
    console.error('Error clearing user cache:', error)
    throw error
  }
}

// Utility functions for scoring and rankings
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  if (score >= 40) return "text-orange-600"
  return "text-red-600"
}

export function getRankColor(rank: string): string {
  switch (rank) {
    case "鑽石會員":
      return "text-purple-600"
    case "金牌會員":
      return "text-yellow-600"
    case "銀牌會員":
      return "text-gray-600"
    case "銅牌會員":
      return "text-orange-600"
    default:
      return "text-blue-600"
  }
}

export function getUserMembershipTier(totalSubmissions: number): string {
  if (totalSubmissions >= 30) return "鑽石會員"
  if (totalSubmissions >= 20) return "金牌會員"
  if (totalSubmissions >= 10) return "銀牌會員"
  if (totalSubmissions >= 5) return "銅牌會員"
  return "新手會員"
}

// Mock function for testing - keep this for backward compatibility
export function getMockUserStats(): UserStats {
  return {
    cashVoucher: 25, 
    referralCashVoucher: 10, 
    totalSubmissions: 15, 
    completionRate: 87, 
    lastSubmission: "2025-01-12T15:30:00Z", 
    rank: "金牌會員", 
    availableQuestionnaireRate: 75, 
    totalCharactersWritten: 5000 
  }
}
