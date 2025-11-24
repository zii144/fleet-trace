export interface QuestionnaireSubmission {
  id: string
  userId: string
  questionnaireId: string
  routeId?: string // KML route ID (e.g., "route-1", "route-sunmoonlake")
  routeName?: string // Human-readable route name
  submittedAt: string
  responseId: string // Reference to questionnaire_responses
  metadata: {
    deviceType?: string
    userAgent?: string
    ipAddress?: string // For fraud detection
    submissionSource?: 'web' | 'mobile' | 'admin'
  }
  validationFlags: {
    isDuplicate?: boolean
    isTestSubmission?: boolean
    requiresReview?: boolean
  }
}

// New interface for route completion tracking
export interface RouteCompletionTracking {
  id: string
  routeId: string
  routeName: string
  category: 'round-island-main' | 'round-island' | 'round-island-alternative' | 'diverse' | 'scenic' | 'custom'
  questionnaireId: string
  completionLimit: number // Maximum completions allowed (e.g., 35, 40, 70)
  currentCompletions: number // Current number of completions
  lastUpdated: string
  isActive: boolean
  metadata: {
    totalSubmissions: number // Total submissions (may include duplicates/invalid)
    uniqueUsers: number // Unique users who completed this route
    averageCompletionTime?: number // Average time to complete in seconds
  }
}

// Route quota information for UI display
export interface RouteQuotaInfo {
  id?: string // Document ID for admin operations
  routeId: string
  routeName: string
  category: string
  questionnaireId?: string // For admin management
  completionLimit: number
  currentCompletions: number
  remainingQuota: number
  isFull: boolean
  completionPercentage: number
  isActive?: boolean // For admin management
  lastUpdated?: string // For admin management
  metadata?: any // For admin management
}

// Category quota summary
export interface CategoryQuotaSummary {
  category: string
  categoryName: string
  totalRoutes: number
  totalLimit: number
  totalCompletions: number
  totalRemaining: number
  routes: RouteQuotaInfo[]
}

export interface QuestionnaireValidationRule {
  type: 'route_submission_limit' | 'time_cooldown' | 'user_role_restriction' | 'route_completion_limit'
  config: {
    // Route submission limits
    maxSubmissionsPerRoute?: number
    allowedRoutes?: string[]
    routeSelectionQuestionId?: string // e.g., "recent-route"
    
    // Route completion limits (new)
    routeCompletionLimit?: number // Maximum completions per route
    categoryCompletionLimit?: number // Maximum completions per category
    enforceCompletionLimit?: boolean // Whether to enforce completion limits
    
    // Time-based limits
    cooldownPeriod?: number // milliseconds
    maxSubmissionsPerDay?: number
    
    // User restrictions
    requiredUserRole?: string[]
  }
  enforcement: 'block' | 'warn' | 'hide'
  errorMessage: string
  warningMessage?: string
  isActive: boolean
}

export interface RouteSubmissionStats {
  routeId: string
  submissionCount: number
  lastSubmittedAt: string
}

export interface RouteAvailability {
  available: any[] // KMLFile[]
  restricted: Array<any & {reason: string, submissionCount: number}>
  warnings: Array<any & {warning: string}>
  hidden: Array<any & {reason: string, type: 'user_submitted' | 'quota_full'}>
}

export interface ValidationResult {
  canSubmit: boolean
  isValid: boolean
  errors: string[]
  warnings: string[]
}
