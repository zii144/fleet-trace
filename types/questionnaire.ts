export type QuestionType =
  | "text"
  | "email"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea"
  | "matrix"
  | "map"
  | "time"
  | "radio-number"
  | "radio-text" 
  | "select-text"
  | "checkbox-text"
  | "region-long-answer"
  | "train-schedule-request"

export interface KMLFile {
  id: string
  name: string
  url: string
  visible?: boolean // Whether to show by default
  color?: string // Optional color for styling
}

export interface QuestionValidation {
  min?: number
  max?: number
  pattern?: string
  required?: boolean
}

export interface QuestionConditional {
  dependsOn: string // ID of the question this depends on
  showWhen: string | string[] // Value(s) that trigger showing this question
}

export interface MatrixQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "matrix"
  options: string[] // Row items
  scale: string[] // Column scale (e.g., ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"])
}

export interface MapQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "map"
  kmlFiles?: KMLFile[]
  kmlUrl?: string // Keep for backward compatibility
  kmlData?: string // Keep for backward compatibility
  allowMultipleSelection?: boolean
  defaultCenter?: [number, number] // [lat, lng]
  defaultZoom?: number
  showLayerControl?: boolean // Show/hide layer toggle controls
  options: Array<{
    value: string
    label: string
    coordinates?: [number, number] // [lat, lng]
    description?: string
  }>
}

export interface RadioNumberQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "radio-number"
  options: Array<{
    value: string
    label: string
    hasNumberInput?: boolean
    numberLabel?: string
    numberPlaceholder?: string
    numberMin?: number
    numberMax?: number
    hasTextInput?: boolean
    textLabel?: string
    textPlaceholder?: string
    textMinLength?: number
    textMaxLength?: number
  }>
}

export interface RadioTextQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "radio-text"
  options: Array<{
    value: string
    label: string
    hasTextInput?: boolean
    textLabel?: string
    textMinLength?: number
    textMaxLength?: number
    textPlaceholder?: string
  }>
}

export interface SelectTextQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "select-text"
  options: string[]
  textLabel?: string
  textMinLength?: number
  textMaxLength?: number
  textPlaceholder?: string
}

export interface CheckboxTextQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "checkbox-text"
  options: string[]
  textLabel?: string
  textMinLength?: number
  textMaxLength?: number
  textPlaceholder?: string
}

export interface TimeQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "time"
  timeFormat?: "YYYY-MM" | "YYYY-MM-DD" | "YYYY" | "MM-DD" | "HH:mm" | "YYYY-MM-DD HH:mm"
  minDate?: string
  maxDate?: string
}

export interface RegionLongAnswerQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "region-long-answer"
  regions: string[] // List of counties/cities for dropdown
  minBlocks?: number // Minimum number of blocks (default: 1)
  maxBlocks?: number // Maximum number of blocks (default: 5)
  locationPlaceholder?: string // Placeholder for location field
  locationLabel?: string // Label for location field (default: "路段(或地點)")
  reasonPlaceholder?: string // Placeholder for reason field
}

export interface TrainScheduleRequestQuestion {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional
  type: "train-schedule-request"
  options: string[] // Radio options like ["無需增加", "需要增加班次"]
  minBlocks?: number // Minimum number of schedule requests (default: 1)
  maxBlocks?: number // Maximum number of schedule requests (default: 5)
  showScheduleWhen?: string // Show schedule input when this option is selected (default: "需要增加班次")
  startStationLabel?: string // Label for start station field (default: "站別（起點）")
  endStationLabel?: string // Label for end station field (default: "站別（迄點）")
  scheduleLabel?: string // Label for schedule field (default: "日別")
  startStationPlaceholder?: string // Placeholder for start station
  endStationPlaceholder?: string // Placeholder for end station
}

export type Question = {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  validation?: QuestionValidation
  conditional?: QuestionConditional // Add conditional logic support
} & (
  | { type: "text" | "email" | "number" | "textarea"; options?: never }
  | { type: "select" | "radio" | "checkbox"; options: string[] }
  | { type: "time"; timeFormat?: string; minDate?: string; maxDate?: string; options?: never }
  | MatrixQuestion
  | MapQuestion
  | RadioNumberQuestion
  | RadioTextQuestion
  | SelectTextQuestion
  | CheckboxTextQuestion
  | RegionLongAnswerQuestion
  | TrainScheduleRequestQuestion
)

export interface QuestionnaireSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export interface Questionnaire {
  id: string
  title: string
  description: string
  banner: string, // URL to banner image or video
  version: string
  organize: string // Organization that created/manages the questionnaire
  isRepeatable?: boolean // Whether the questionnaire can be repeated by the same user
  sections: QuestionnaireSection[]
  createdAt: string
  updatedAt: string
  // Route tracking configuration
  routeTracking?: {
    enabled: boolean
    routeSelectionQuestionId: string // Which question contains route selection
    trackSubmissionsByRoute: boolean
  }
  // Validation rules for submissions
  validationRules?: QuestionnaireValidationRule[]
}

// Import from route-submission types
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

export interface QuestionnaireResponse {
  id: string
  questionnaireId: string
  userId: string
  responses: Record<string, any>
  submittedAt: string
  completedSections: string[]
  status: 'draft' | 'completed' | 'submitted'
  startedAt?: string
  updatedAt?: string
  // Enhanced tracking fields
  totalCharactersWritten?: number // Total characters in text responses
  timeSpentSeconds?: number // Time spent filling the questionnaire
  totalQuestions?: number // Total questions in the questionnaire
  answeredQuestions?: number // Number of questions answered
  averageTimePerQuestion?: number // Average time per question in seconds
  deviceType?: 'desktop' | 'mobile' | 'tablet' // Device used for filling
  completionPercentage?: number // Percentage of questionnaire completed
  textResponsesCount?: number // Number of text-based responses
  mapSelectionsCount?: number // Number of map selections made
  revisitCount?: number // Number of times user revisited questions
}

export interface User {
  id: string
  username: string
  role: "admin" | "user"
}

// Enhanced user statistics interface
export interface DetailedUserStats {
  // Basic stats
  totalSubmissions: number
  completedSubmissions: number
  draftSubmissions: number
  
  // Time-based stats
  totalTimeSpent: number // in seconds
  averageTimePerQuestionnaire: number // in seconds
  fastestCompletion: number // in seconds
  slowestCompletion: number // in seconds
  
  // Content stats
  totalCharactersWritten: number
  averageCharactersPerSubmission: number
  textResponsesCount: number
  mapSelectionsCount: number
  
  // Completion stats
  averageCompletionRate: number
  perfectCompletions: number // 100% completion rate
  
  // Engagement stats
  revisitCount: number
  averageRevisitsPerQuestionnaire: number
  mostRevisitedQuestionnaire: string
  
  // Device and behavior stats
  deviceUsage: {
    desktop: number
    mobile: number
    tablet: number
  }
  
  // Ranking and achievements
  rank: string
  cashVoucher: number
  referralCashVoucher: number
  lastSubmission: string
  
  // Progress tracking
  availableQuestionnaireRate: number
  completionStreak: number // consecutive days with submissions
  longestStreak: number
  
  // Quality metrics
  qualityScore: number // based on completion rate, time spent, etc.
  consistencyScore: number // based on regular submissions
}
