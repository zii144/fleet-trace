// Service Layer Exports
export { default as UserService } from './UserService'
export { default as StatsService } from './StatsService'
export { default as QuestionnaireService } from './QuestionnaireService'
export { default as ProfileService } from './ProfileService'
export { default as QuestionnaireQualificationService } from './QuestionnaireQualificationService'

// Types
export type { UserProfile, UserStats, SubmissionWithDetails, CacheEntry, UserStatsCache } from '@/types/user'
export type { QuestionnaireResponse, Questionnaire } from '@/types/questionnaire'
export type { QualificationStatus, QuestionnaireQualification } from './QuestionnaireQualificationService'

// Main Profile Service instance - ready to use
import ProfileService from './ProfileService'
export const profileService = ProfileService.getInstance()

// Individual service instances
import UserService from './UserService'
import StatsService from './StatsService'
import QuestionnaireService from './QuestionnaireService'
import QuestionnaireQualificationService, { QuestionnaireQualification } from './QuestionnaireQualificationService'

export const userService = UserService.getInstance()
export const statsService = StatsService.getInstance()
export const questionnaireService = QuestionnaireService.getInstance()
export const qualificationService = QuestionnaireQualificationService.getInstance()

// Helper functions
export {
  getScoreColor,
  getRankColor,
  getUserMembershipTier,
} from '../user-profile'

// Utility functions for questionnaire qualification management
export const questionnaireQualificationUtils = {
  /**
   * Configure a questionnaire to be disabled when completed
   * @param questionnaireId - The ID of the questionnaire
   * @param title - Human-readable title (optional, will use existing if not provided)
   * @param prerequisites - Array of prerequisite questionnaire IDs (optional)
   */
  setDisableWhenCompleted: (questionnaireId: string, title?: string, prerequisites: string[] = []) => {
    const rule: QuestionnaireQualification = {
      id: questionnaireId,
      title: title || qualificationService.getQuestionnaireName(questionnaireId),
      prerequisites,
      disableWhenCompleted: true
    }
    qualificationService.addQualificationRule(rule)
  },

  /**
   * Remove the disable-when-completed setting for a questionnaire
   * @param questionnaireId - The ID of the questionnaire
   */
  removeDisableWhenCompleted: (questionnaireId: string) => {
    qualificationService.removeQualificationRule(questionnaireId)
  },

  /**
   * Check if a questionnaire is configured to be disabled when completed
   * @param questionnaireId - The ID of the questionnaire
   */
  isDisableWhenCompleted: (questionnaireId: string): boolean => {
    return qualificationService.shouldDisableWhenCompleted(questionnaireId)
  },

  /**
   * Get all questionnaires that are configured to be disabled when completed
   */
  getDisableWhenCompletedQuestionnaires: (): string[] => {
    return qualificationService.getQualificationRules()
      .filter(rule => rule.disableWhenCompleted)
      .map(rule => rule.id)
  }
}
