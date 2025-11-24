export interface UserProfile {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
  totalSubmissions: number
  lastActiveAt: string
  emailVerified?: boolean
  role?: 'admin' | 'user'
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

export interface SubmissionWithDetails {
  id: string
  questionnaireId: string
  userId: string
  responses: Record<string, any>
  submittedAt: string
  completedSections: string[]
  status: 'draft' | 'completed' | 'submitted'
  startedAt?: string
  updatedAt?: string
  questionnaireName: string
  score: number
  
  // Enhanced tracking fields
  totalCharactersWritten?: number
  timeSpentSeconds?: number
  totalQuestions?: number
  answeredQuestions?: number
  averageTimePerQuestion?: number
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  completionPercentage?: number
  textResponsesCount?: number
  mapSelectionsCount?: number
  revisitCount?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export interface UserStatsCache {
  [userId: string]: CacheEntry<UserStats>
}
