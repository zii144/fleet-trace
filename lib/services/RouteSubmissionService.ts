import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  getFirestore 
} from 'firebase/firestore'
import type { 
  QuestionnaireSubmission, 
  RouteSubmissionStats, 
  RouteAvailability, 
  ValidationResult 
} from '@/types/route-submission'
import type { Questionnaire } from '@/types/questionnaire'
import { getQuestionnaireById } from '@/lib/questionnaire'
import { routeCompletionService } from './RouteCompletionService'

export class RouteSubmissionService {
  private db

  constructor() {
    this.db = getFirestore()
  }

  /**
   * Get user's route submission history for a specific questionnaire
   */
  async getUserRouteSubmissions(
    userId: string, 
    questionnaireId: string
  ): Promise<RouteSubmissionStats[]> {
    try {
      const q = query(
        collection(this.db, 'questionnaire_submissions'),
        where('userId', '==', userId),
        where('questionnaireId', '==', questionnaireId),
        orderBy('submittedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionnaireSubmission[]
      
      // Group by route and count submissions
      const routeMap = new Map<string, {count: number, lastSubmittedAt: string}>()
      
      submissions.forEach(submission => {
        if (submission.routeId) {
          const existing = routeMap.get(submission.routeId)
          if (existing) {
            existing.count++
            if (submission.submittedAt > existing.lastSubmittedAt) {
              existing.lastSubmittedAt = submission.submittedAt
            }
          } else {
            routeMap.set(submission.routeId, {
              count: 1,
              lastSubmittedAt: submission.submittedAt
            })
          }
        }
      })
      
      return Array.from(routeMap.entries()).map(([routeId, data]) => ({
        routeId,
        submissionCount: data.count,
        lastSubmittedAt: data.lastSubmittedAt
      }))
    } catch (error) {
      console.error('Error fetching user route submissions:', error)
      return []
    }
  }

  /**
   * Get available routes based on user's submission history and validation rules
   */
  async getAvailableRoutes(
    userId: string,
    questionnaireId: string,
    allRoutes: any[] // KMLFile[]
  ): Promise<RouteAvailability> {
    try {
      const questionnaire = getQuestionnaireById(questionnaireId)
      if (!questionnaire?.routeTracking?.enabled) {
        return { available: allRoutes, restricted: [], warnings: [], hidden: [] }
      }

      const userSubmissions = await this.getUserRouteSubmissions(userId, questionnaireId)
      const submissionMap = new Map(userSubmissions.map(s => [s.routeId, s]))

      const available: any[] = []
      const restricted: Array<any & {reason: string, submissionCount: number}> = []
      const warnings: Array<any & {warning: string}> = []
      const hidden: Array<any & {reason: string, type: 'user_submitted' | 'quota_full'}> = []

      for (const route of allRoutes) {
        const submission = submissionMap.get(route.id)
        const submissionCount = submission?.submissionCount || 0

        // Apply validation rules
        let isRestricted = false
        let restrictionReason = ''
        let warningMessage = ''
        let shouldHide = false
        let hideReason = ''
        let hideType: 'user_submitted' | 'quota_full' = 'user_submitted'

        // Check user submission limits
        for (const rule of questionnaire.validationRules || []) {
          if (!rule.isActive || rule.type !== 'route_submission_limit') continue

          const maxSubmissions = rule.config.maxSubmissionsPerRoute || 1

          if (submissionCount >= maxSubmissions) {
            if (rule.enforcement === 'block') {
              isRestricted = true
              restrictionReason = rule.errorMessage
              break
            } else if (rule.enforcement === 'warn') {
              warningMessage = rule.warningMessage || '您已經提交過此路線'
            } else if (rule.enforcement === 'hide') {
              shouldHide = true
              hideReason = rule.errorMessage
              hideType = 'user_submitted'
              break
            }
          }
        }

        // Check route completion limits (new)
        if (!isRestricted && !shouldHide) {
          const isRouteFull = await routeCompletionService.isRouteFull(route.id, questionnaireId)
          
          if (isRouteFull) {
            // Check if we should block, warn, or hide based on completion limit rules
            const completionRule = questionnaire.validationRules?.find(
              rule => rule.isActive && rule.type === 'route_completion_limit'
            )
            
            if (completionRule) {
              if (completionRule.enforcement === 'block') {
                isRestricted = true
                restrictionReason = completionRule.errorMessage || '此路線已達到收集上限'
              } else if (completionRule.enforcement === 'warn') {
                warningMessage = completionRule.warningMessage || '此路線即將達到收集上限'
              } else if (completionRule.enforcement === 'hide') {
                shouldHide = true
                hideReason = completionRule.errorMessage || '此路線已達到收集上限，無法再填寫'
                hideType = 'quota_full'
              }
            }
          }
        }

        // Add route to hidden array if it should be hidden
        if (shouldHide) {
          hidden.push({
            ...route,
            reason: hideReason,
            type: hideType
          })
          continue
        }

        if (isRestricted) {
          restricted.push({
            ...route,
            reason: restrictionReason,
            submissionCount
          })
        } else if (warningMessage) {
          warnings.push({
            ...route,
            warning: warningMessage
          })
        } else {
          available.push(route)
        }
      }

      return { available, restricted, warnings, hidden }
    } catch (error) {
      console.error('Error getting available routes:', error)
      return { available: allRoutes, restricted: [], warnings: [], hidden: [] }
    }
  }

  /**
   * Validate if a user can submit for a specific route
   */
  async validateRouteSubmission(
    userId: string,
    questionnaireId: string,
    routeId?: string
  ): Promise<ValidationResult> {
    try {
      const questionnaire = getQuestionnaireById(questionnaireId)
      if (!questionnaire?.routeTracking?.enabled || !routeId) {
        return { canSubmit: true, isValid: true, errors: [], warnings: [] }
      }

      const userSubmissions = await this.getUserRouteSubmissions(userId, questionnaireId)
      const routeSubmission = userSubmissions.find(s => s.routeId === routeId)
      const submissionCount = routeSubmission?.submissionCount || 0

      const errors: string[] = []
      const warnings: string[] = []

      // Apply validation rules
      for (const rule of questionnaire.validationRules || []) {
        if (!rule.isActive || rule.type !== 'route_submission_limit') continue

        const maxSubmissions = rule.config.maxSubmissionsPerRoute || 1

        if (submissionCount >= maxSubmissions) {
          if (rule.enforcement === 'block') {
            errors.push(rule.errorMessage)
          } else if (rule.enforcement === 'warn') {
            warnings.push(rule.warningMessage || '您已經提交過此路線')
          }
        }
      }

      return {
        canSubmit: errors.length === 0,
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      console.error('Error validating route submission:', error)
      return {
        canSubmit: false,
        isValid: false,
        errors: ['驗證過程發生錯誤，請稍後再試'],
        warnings: []
      }
    }
  }

  /**
   * Record a new submission with route tracking
   */
  async recordSubmission(
    userId: string,
    questionnaireId: string,
    responseId: string,
    routeId?: string,
    routeName?: string
  ): Promise<string> {
    try {
      const submission: Omit<QuestionnaireSubmission, 'id'> = {
        userId,
        questionnaireId,
        routeId,
        routeName,
        responseId,
        submittedAt: new Date().toISOString(),
        metadata: {
          deviceType: this.detectDeviceType(),
          submissionSource: 'web',
          userAgent: navigator.userAgent
        },
        validationFlags: {}
      }

      const docRef = await addDoc(
        collection(this.db, 'questionnaire_submissions'),
        submission
      )

      // Increment route completion count if route is specified
      if (routeId) {
        try {
          await routeCompletionService.incrementRouteCompletion(routeId, questionnaireId, userId)
          console.log(`✅ Route completion incremented for ${routeId}`)
        } catch (completionError) {
          console.error('Error incrementing route completion:', completionError)
          // Don't fail the submission if completion tracking fails
        }
      }
      
      return docRef.id
    } catch (error) {
      console.error('Error recording submission:', error)
      throw error
    }
  }

  /**
   * Get submission statistics for admin dashboard
   */
  async getSubmissionStatistics(questionnaireId?: string) {
    try {
      const q = questionnaireId 
        ? query(
            collection(this.db, 'questionnaire_submissions'),
            where('questionnaireId', '==', questionnaireId),
            orderBy('submittedAt', 'desc')
          )
        : query(
            collection(this.db, 'questionnaire_submissions'),
            orderBy('submittedAt', 'desc')
          )
      
      const snapshot = await getDocs(q)
      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionnaireSubmission[]

      // Group by questionnaire and route
      const stats = new Map<string, {
        questionnaireId: string
        routeId: string
        routeName: string
        totalSubmissions: number
        uniqueUsers: Set<string>
        lastSubmission: string
      }>()

      submissions.forEach(submission => {
        if (submission.routeId) {
          const key = `${submission.questionnaireId}-${submission.routeId}`
          const existing = stats.get(key)
          
          if (existing) {
            existing.totalSubmissions++
            existing.uniqueUsers.add(submission.userId)
            if (submission.submittedAt > existing.lastSubmission) {
              existing.lastSubmission = submission.submittedAt
            }
          } else {
            stats.set(key, {
              questionnaireId: submission.questionnaireId,
              routeId: submission.routeId,
              routeName: submission.routeName || submission.routeId,
              totalSubmissions: 1,
              uniqueUsers: new Set([submission.userId]),
              lastSubmission: submission.submittedAt
            })
          }
        }
      })

      return Array.from(stats.values()).map(stat => ({
        questionnaireId: stat.questionnaireId,
        routeId: stat.routeId,
        routeName: stat.routeName,
        totalSubmissions: stat.totalSubmissions,
        uniqueUsers: stat.uniqueUsers.size,
        lastSubmission: stat.lastSubmission
      }))
    } catch (error) {
      console.error('Error getting submission statistics:', error)
      return []
    }
  }

  /**
   * Detect device type for metadata
   */
  private detectDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)) {
      return /ipad/.test(userAgent) ? 'tablet' : 'mobile'
    }
    
    return 'desktop'
  }
}

// Export singleton instance
export const routeSubmissionService = new RouteSubmissionService()
export default routeSubmissionService
