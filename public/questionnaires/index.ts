import type { Questionnaire } from '@/types/questionnaire'
import type { QuestionnaireTemplate } from './types'
import { selfInfoSurvey } from './self-info-survey'
import { cyclingSurvey2025 } from './cycling-survey-2025'
import { diverseCyclingSurvey2025 } from './diverse-cycling-survey-2025'
import { getKMLFilesByCategory } from '@/lib/kml-config'

/**
 * Registry of all available questionnaires
 */
const questionnaireRegistry: QuestionnaireTemplate[] = [
    selfInfoSurvey,
    cyclingSurvey2025,
    diverseCyclingSurvey2025,
]

/**
 * Injects KML files into questionnaire based on the kmlCategory
 */
function injectKMLFiles(questionnaire: QuestionnaireTemplate): Questionnaire {
  const processedQuestionnaire = { ...questionnaire }
  
  // Find map questions and inject appropriate KML files
  processedQuestionnaire.sections = questionnaire.sections.map(section => ({
    ...section,
    questions: section.questions.map(question => {
      if (question.type === 'map' && questionnaire.kmlCategory) {
        let kmlFiles: any[] = []
        
        if (Array.isArray(questionnaire.kmlCategory)) {
          // Handle multiple categories
          questionnaire.kmlCategory.forEach(category => {
            const categoryFiles = getKMLFilesByCategory(category)
            kmlFiles = [...kmlFiles, ...categoryFiles]
          })
        } else {
          // Handle single category
          kmlFiles = getKMLFilesByCategory(questionnaire.kmlCategory)
        }
        
        return {
          ...question,
          kmlFiles
        }
      }
      return question
    })
  }))
  
  // Remove the kmlCategory property from the final questionnaire
  const { kmlCategory, ...finalQuestionnaire } = processedQuestionnaire
  return finalQuestionnaire as Questionnaire
}

/**
 * Get all available questionnaires with KML files injected
 */
export function getAllQuestionnaires(): Questionnaire[] {
  return questionnaireRegistry.map(injectKMLFiles)
}

/**
 * Get a specific questionnaire by ID with KML files injected
 */
export function getQuestionnaireById(id: string): Questionnaire | undefined {
  const template = questionnaireRegistry.find(q => q.id === id)
  return template ? injectKMLFiles(template) : undefined
}

/**
 * Get questionnaires by category
 */
export function getQuestionnairesByCategory(category: string): Questionnaire[] {
  return questionnaireRegistry
    .filter(q => {
      if (!q.kmlCategory) return false
      if (Array.isArray(q.kmlCategory)) {
        return q.kmlCategory.includes(category)
      }
      return q.kmlCategory === category
    })
    .map(injectKMLFiles)
}

/**
 * Export individual questionnaires for direct access
 */
export { selfInfoSurvey, cyclingSurvey2025, diverseCyclingSurvey2025 }
