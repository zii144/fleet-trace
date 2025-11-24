import type { Questionnaire } from "@/types/questionnaire"

export interface QuestionnaireTemplate extends Omit<Questionnaire, 'sections'> {
  kmlCategory?: string | string[] // Specifies which KML category to use for dynamic injection
  sections: Array<{
    id: string
    title: string
    description?: string
    questions: Array<any> // Will be processed into proper Question types
  }>
}
