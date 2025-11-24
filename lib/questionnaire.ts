import type { Questionnaire, QuestionnaireResponse } from "@/types/questionnaire"
import { 
  saveQuestionnaireResponse as saveQuestionnaireResponseToFirebase,
  getResponsesByQuestionnaireId as getResponsesByQuestionnaireIdFromFirebase,
  getQuestionnaireResponses as getQuestionnaireResponsesFromFirebase,
} from "./firebase-questionnaires"
import { getAllQuestionnaires, getQuestionnaireById as getQuestionnaireFromRegistry } from "@/public/questionnaires"

// Generate questionnaires dynamically with current KML data
function generateDefaultQuestionnaires(): Questionnaire[] {
  return getAllQuestionnaires()
}

// Dynamic questionnaire getter
export function getDefaultQuestionnaires(): Questionnaire[] {
  return generateDefaultQuestionnaires()
}

// Export the constant for backward compatibility  
export const DEFAULT_QUESTIONNAIRES = generateDefaultQuestionnaires()

// Simple local questionnaire functions - no Firebase dependency
export function getQuestionnaires(): Questionnaire[] {
  return DEFAULT_QUESTIONNAIRES
}

export function getQuestionnaireById(id: string): Questionnaire | null {
  const questionnaire = getQuestionnaireFromRegistry(id)
  return questionnaire ?? null
}

export async function saveQuestionnaireResponse(response: Omit<QuestionnaireResponse, 'id' | 'submittedAt'>): Promise<string> {
  try {
    return await saveQuestionnaireResponseToFirebase(response)
  } catch (error) {
    console.error('Error saving questionnaire response to Firebase:', error)
    throw error
  }
}

export async function getQuestionnaireResponses(): Promise<QuestionnaireResponse[]> {
  try {
    return await getQuestionnaireResponsesFromFirebase()
  } catch (error) {
    console.error('Error fetching questionnaire responses from Firebase:', error)
    return []
  }
}

export async function getResponsesByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
  try {
    return await getResponsesByQuestionnaireIdFromFirebase(questionnaireId)
  } catch (error) {
    console.error('Error fetching responses by questionnaire ID from Firebase:', error)
    return []
  }
}

export function validateQuestionnaireJSON(json: string): {
  valid: boolean
  error?: string
  questionnaire?: Questionnaire
} {
  try {
    const parsed = JSON.parse(json)

    if (!parsed.id || !parsed.title || !Array.isArray(parsed.sections)) {
      return { valid: false, error: "缺少必要欄位：id / title / sections" }
    }

    for (const section of parsed.sections) {
      if (!section.id || !section.title || !Array.isArray(section.questions)) {
        return { valid: false, error: "Section 結構不正確" }
      }
      for (const q of section.questions) {
        if (!q.id || !q.type || !q.label) {
          return { valid: false, error: "Question 結構不正確" }
        }
      }
    }

    return { valid: true, questionnaire: parsed }
  } catch {
    return { valid: false, error: "JSON 格式錯誤" }
  }
}
