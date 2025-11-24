import type { Questionnaire } from '@/types/questionnaire'
import type { QuestionnaireTemplate } from './types'
import { selfInfoSurvey } from './self-info-survey'
import { cyclingSurvey2025 } from './cycling-survey-2025'
import { diverseCyclingSurvey2025 } from './diverse-cycling-survey-2025'

/**
 * Registry of all available questionnaires
 */
const questionnaireRegistry: QuestionnaireTemplate[] = [
    selfInfoSurvey,
    cyclingSurvey2025,
    diverseCyclingSurvey2025,
]

/**
 * Convert template to questionnaire (KML injection removed)
 */
function processQuestionnaire(questionnaire: QuestionnaireTemplate): Questionnaire {
  // Remove the kmlCategory property from the final questionnaire
  const { kmlCategory, ...finalQuestionnaire } = questionnaire
  return finalQuestionnaire as Questionnaire
}

/**
 * Get all available questionnaires
 */
export function getAllQuestionnaires(): Questionnaire[] {
  return questionnaireRegistry.map(processQuestionnaire)
}

/**
 * Get a specific questionnaire by ID
 */
export function getQuestionnaireById(id: string): Questionnaire | undefined {
  const template = questionnaireRegistry.find(q => q.id === id)
  return template ? processQuestionnaire(template) : undefined
}

/**
 * Get questionnaires by category (KML category removed, returns all if category matches)
 */
export function getQuestionnairesByCategory(category: string): Questionnaire[] {
  // Since KML categories are removed, this function is kept for compatibility
  // but returns all questionnaires
  return questionnaireRegistry.map(processQuestionnaire)
}

/**
 * Export individual questionnaires for direct access
 */
export { selfInfoSurvey, cyclingSurvey2025, diverseCyclingSurvey2025 }
