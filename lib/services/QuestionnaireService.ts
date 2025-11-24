import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import type { QuestionnaireResponse, Questionnaire } from '@/types/questionnaire'
import type { SubmissionWithDetails } from '@/types/user'
import UserInfoService from './UserInfoService'

export class QuestionnaireService {
  private static instance: QuestionnaireService
  private readonly RESPONSES_COLLECTION = 'questionnaire_responses'
  private readonly QUESTIONNAIRES_COLLECTION = 'questionnaires'

  static getInstance(): QuestionnaireService {
    if (!QuestionnaireService.instance) {
      QuestionnaireService.instance = new QuestionnaireService()
    }
    return QuestionnaireService.instance
  }

  /**
   * Submit a questionnaire response
   */
  async submitResponse(response: Omit<QuestionnaireResponse, 'id'>): Promise<string> {
    try {
      console.log('📝 Submitting questionnaire response for user:', response.userId)
      
      // Enhanced tracking: calculate additional metrics and validate data
      const enhancedResponse = this.enhanceResponse(response)
      
      // Validate critical fields
      this.validateResponseData(enhancedResponse)
      
      const docRef = await addDoc(collection(db, this.RESPONSES_COLLECTION), {
        ...enhancedResponse,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ Response submitted successfully with ID:', docRef.id)
      console.log('📊 Enhanced response data:', {
        timeSpentSeconds: enhancedResponse.timeSpentSeconds,
        totalCharactersWritten: enhancedResponse.totalCharactersWritten,
        completionPercentage: enhancedResponse.completionPercentage,
        deviceType: enhancedResponse.deviceType,
        textResponsesCount: enhancedResponse.textResponsesCount,
        mapSelectionsCount: enhancedResponse.mapSelectionsCount
      })
      
      // Special handling for self-info-survey
      if (response.questionnaireId === 'self-info-survey') {
        try {
          console.log('👤 Processing self-info-survey submission')
          console.log('🔐 Checking auth state before UserInfo submission...')
          
          // Import Firebase auth to check current state
          const { getCurrentUser } = await import('../firebase-auth')
          const currentUser = await getCurrentUser()
          
          console.log('🔐 Auth state for UserInfo submission:', currentUser ? {
            uid: currentUser.id,
            email: currentUser.email,
            emailVerified: true // If getCurrentUser returns a user, email is verified
          } : 'No authenticated user')
          
          if (!currentUser) {
            console.warn('⚠️ No authenticated user found during self-info-survey submission')
            console.warn('⚠️ UserInfo submission may fail due to permissions')
          } else if (currentUser.id !== response.userId) {
            console.warn(`⚠️ User ID mismatch: auth(${currentUser.id}) vs response(${response.userId})`)
          } else {
            console.log('✅ Authentication state looks good for UserInfo submission')
          }
          
          const userInfoService = UserInfoService.getInstance()
          await userInfoService.submitUserInfo(response.userId, response.responses, docRef.id)
          console.log('✅ User info submitted successfully')
        } catch (userInfoError) {
          console.error('❌ Error submitting user info:', userInfoError)
          // Don't fail the main submission if user info submission fails
          // But log the error for monitoring
        }
      }
      
      return docRef.id
    } catch (error) {
      console.error('❌ Error submitting response:', error)
      throw new Error(`Failed to submit response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate response data before submission
   */
  private validateResponseData(response: QuestionnaireResponse): void {
    const errors: string[] = []
    
    if (!response.userId) errors.push('User ID is required')
    if (!response.questionnaireId) errors.push('Questionnaire ID is required')
    if (!response.responses || Object.keys(response.responses).length === 0) {
      errors.push('Responses cannot be empty')
    }
    
    // Validate enhanced tracking fields
    if (typeof response.timeSpentSeconds !== 'number' || response.timeSpentSeconds < 0) {
      console.warn('⚠️ Invalid timeSpentSeconds, setting to 0')
      response.timeSpentSeconds = 0
    }
    
    if (typeof response.totalCharactersWritten !== 'number' || response.totalCharactersWritten < 0) {
      console.warn('⚠️ Invalid totalCharactersWritten, setting to 0')
      response.totalCharactersWritten = 0
    }
    
    if (typeof response.completionPercentage !== 'number' || response.completionPercentage < 0 || response.completionPercentage > 100) {
      console.warn('⚠️ Invalid completionPercentage, calculating from sections')
      response.completionPercentage = response.completedSections ? 
        Math.round((response.completedSections.length / 6) * 100) : 0
    }
    
    if (errors.length > 0) {
      throw new Error(`Invalid response data: ${errors.join(', ')}`)
    }
  }

  /**
   * Get questionnaire responses by user ID
   */
  async getResponsesByUserId(userId: string): Promise<QuestionnaireResponse[]> {
    try {
      // First try the optimized query with composite index
      try {
        const q = query(
          collection(db, this.RESPONSES_COLLECTION),
          where('userId', '==', userId),
          orderBy('submittedAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          startedAt: doc.data().startedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })) as QuestionnaireResponse[]
      } catch (indexError) {
        // Fallback to simpler query without orderBy (requires manual sorting)
        console.warn('⚠️ Composite index not available, using fallback query')
        
        const q = query(
          collection(db, this.RESPONSES_COLLECTION),
          where('userId', '==', userId)
        )
        
        const querySnapshot = await getDocs(q)
        const responses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          startedAt: doc.data().startedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })) as QuestionnaireResponse[]
        
        // Manual sorting by submittedAt (descending)
        return responses.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
      }
    } catch (error) {
      console.error('❌ Error fetching responses:', error)
      throw new Error(`Failed to fetch responses: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get user submissions with questionnaire details
   */
  async getUserSubmissions(userId: string): Promise<SubmissionWithDetails[]> {
    try {
      const responses = await this.getResponsesByUserId(userId)
      
      const submissions: SubmissionWithDetails[] = []
      
      for (const response of responses) {
        const questionnaireName = await this.getQuestionnaireName(response.questionnaireId)
        const score = this.calculateResponseScore(response)
        
        submissions.push({
          ...response,
          questionnaireName,
          score
        })
      }
      
      return submissions
    } catch (error) {
      console.error('❌ Error fetching user submissions:', error)
      throw new Error(`Failed to fetch user submissions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get questionnaire by ID
   */
  async getQuestionnaire(questionnaireId: string): Promise<Questionnaire | null> {
    try {
      const docRef = doc(db, this.QUESTIONNAIRES_COLLECTION, questionnaireId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Questionnaire
      }
      return null
    } catch (error) {
      console.error('❌ Error fetching questionnaire:', error)
      return null
    }
  }

  /**
   * Get all questionnaires
   */
  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    try {
      const q = query(
        collection(db, this.QUESTIONNAIRES_COLLECTION),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Questionnaire[]
    } catch (error) {
      console.error('❌ Error fetching questionnaires:', error)
      throw new Error(`Failed to fetch questionnaires: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update questionnaire response
   */
  async updateResponse(responseId: string, updates: Partial<QuestionnaireResponse>): Promise<void> {
    try {
      const docRef = doc(db, this.RESPONSES_COLLECTION, responseId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('❌ Error updating response:', error)
      throw new Error(`Failed to update response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete questionnaire response
   */
  async deleteResponse(responseId: string): Promise<void> {
    try {
      const docRef = doc(db, this.RESPONSES_COLLECTION, responseId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('❌ Error deleting response:', error)
      throw new Error(`Failed to delete response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get questionnaire analytics
   */
  async getQuestionnaireAnalytics(questionnaireId: string): Promise<{
    totalResponses: number
    completedResponses: number
    averageCompletionRate: number
    averageTimeSpent: number
    deviceBreakdown: Record<string, number>
  }> {
    try {
      const q = query(
        collection(db, this.RESPONSES_COLLECTION),
        where('questionnaireId', '==', questionnaireId)
      )
      
      const querySnapshot = await getDocs(q)
      const responses = querySnapshot.docs.map(doc => doc.data()) as QuestionnaireResponse[]
      
      const totalResponses = responses.length
      const completedResponses = responses.filter(r => r.status === 'completed').length
      
      const averageCompletionRate = responses.length > 0 ? 
        responses.reduce((sum, r) => sum + (r.completionPercentage || 0), 0) / responses.length : 0
      
      const averageTimeSpent = responses.length > 0 ? 
        responses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0) / responses.length : 0
      
      const deviceBreakdown = responses.reduce((breakdown, r) => {
        const device = r.deviceType || 'desktop'
        breakdown[device] = (breakdown[device] || 0) + 1
        return breakdown
      }, {} as Record<string, number>)
      
      return {
        totalResponses,
        completedResponses,
        averageCompletionRate,
        averageTimeSpent,
        deviceBreakdown
      }
    } catch (error) {
      console.error('❌ Error fetching questionnaire analytics:', error)
      throw new Error(`Failed to fetch questionnaire analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Enhance response with additional calculated metrics
   */
  private enhanceResponse(response: Omit<QuestionnaireResponse, 'id'>): QuestionnaireResponse {
    const enhanced = { ...response } as QuestionnaireResponse
    
    // Ensure all required fields are present
    enhanced.id = enhanced.id || `${response.questionnaireId}-${response.userId}-${Date.now()}`
    enhanced.status = enhanced.status || 'completed'
    enhanced.completedSections = enhanced.completedSections || []
    
    // Calculate total characters written if not provided
    if (!enhanced.totalCharactersWritten) {
      enhanced.totalCharactersWritten = Object.values(response.responses).reduce((sum, value) => {
        if (typeof value === 'string') {
          return sum + value.length
        } else if (Array.isArray(value)) {
          // Handle array responses (like region-long-answer)
          return sum + value.reduce((arrSum, item) => {
            if (typeof item === 'string') return arrSum + item.length
            if (typeof item === 'object' && item.answer) return arrSum + item.answer.length
            return arrSum
          }, 0)
        } else if (typeof value === 'object' && value !== null) {
          // Handle object responses (like matrix questions)
          return sum + Object.values(value).reduce((objSum: number, objValue) => {
            if (typeof objValue === 'string') return objSum + objValue.length
            return objSum
          }, 0)
        }
        return sum
      }, 0)
    }
    
    // Calculate total and answered questions
    if (!enhanced.totalQuestions) {
      enhanced.totalQuestions = Object.keys(response.responses).length || 1
    }
    
    if (!enhanced.answeredQuestions) {
      enhanced.answeredQuestions = Object.values(response.responses).filter(value => {
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
        return value !== null && value !== undefined
      }).length
    }
    
    // Calculate completion percentage if not provided
    if (!enhanced.completionPercentage) {
      enhanced.completionPercentage = enhanced.totalQuestions > 0 ? 
        Math.round((enhanced.answeredQuestions / enhanced.totalQuestions) * 100) : 0
    }
    
    // Calculate time per question if not provided
    if (!enhanced.averageTimePerQuestion && enhanced.timeSpentSeconds && enhanced.totalQuestions) {
      enhanced.averageTimePerQuestion = Math.round(enhanced.timeSpentSeconds / enhanced.totalQuestions)
    }
    
    // Count response types if not provided
    if (!enhanced.textResponsesCount || !enhanced.mapSelectionsCount) {
      let textCount = 0
      let mapCount = 0
      
      Object.entries(response.responses).forEach(([key, value]) => {
        // Text responses
        if (typeof value === 'string' && value.trim().length > 0) {
          textCount++
        } 
        // Array responses (like region-long-answer)
        else if (Array.isArray(value) && value.length > 0) {
          textCount += value.filter(item => 
            typeof item === 'string' || (typeof item === 'object' && item.answer)
          ).length
        }
        // Map/location responses
        else if (key.includes('map') || key.includes('location') || key.includes('region')) {
          mapCount++
        }
        // Matrix responses
        else if (typeof value === 'object' && value !== null) {
          const objValues = Object.values(value).filter(v => 
            typeof v === 'string' && v.trim().length > 0
          )
          if (objValues.length > 0) textCount += objValues.length
        }
      })
      
      enhanced.textResponsesCount = textCount
      enhanced.mapSelectionsCount = mapCount
    }
    
    // Set default device type if not provided
    if (!enhanced.deviceType) {
      enhanced.deviceType = 'desktop'
    }
    
    // Set default time spent if not provided
    if (!enhanced.timeSpentSeconds) {
      enhanced.timeSpentSeconds = 300 // Default 5 minutes
    }
    
    // Set default revisit count if not provided
    if (!enhanced.revisitCount) {
      enhanced.revisitCount = 0
    }
    
    // Set start and update times if not provided
    if (!enhanced.startedAt) {
      enhanced.startedAt = new Date(Date.now() - (enhanced.timeSpentSeconds * 1000)).toISOString()
    }
    
    if (!enhanced.updatedAt) {
      enhanced.updatedAt = new Date().toISOString()
    }
    
    console.log('📊 Response enhanced with metrics:', {
      totalCharactersWritten: enhanced.totalCharactersWritten,
      timeSpentSeconds: enhanced.timeSpentSeconds,
      completionPercentage: enhanced.completionPercentage,
      textResponsesCount: enhanced.textResponsesCount,
      mapSelectionsCount: enhanced.mapSelectionsCount,
      deviceType: enhanced.deviceType
    })
    
    return enhanced
  }

  /**
   * Calculate response score
   */
  private calculateResponseScore(response: QuestionnaireResponse): number {
    const completionScore = (response.completionPercentage || 0) * 0.4
    const timeScore = response.timeSpentSeconds ? Math.min(100, (response.timeSpentSeconds / 300) * 100) * 0.3 : 0
    const contentScore = response.totalCharactersWritten ? Math.min(100, (response.totalCharactersWritten / 100) * 100) * 0.3 : 0
    
    return Math.round(completionScore + timeScore + contentScore)
  }

  /**
   * Get questionnaire name by ID
   */
  private async getQuestionnaireName(questionnaireId: string): Promise<string> {
    try {
      const questionnaire = await this.getQuestionnaire(questionnaireId)
      return questionnaire?.title || `評鑑調查 ${questionnaireId}`
    } catch (error) {
      console.error('❌ Error fetching questionnaire name:', error)
      return `評鑑調查 ${questionnaireId}`
    }
  }

  /**
   * Search responses by criteria
   */
  async searchResponses(criteria: {
    userId?: string
    questionnaireId?: string
    status?: 'draft' | 'completed' | 'submitted'
    dateFrom?: string
    dateTo?: string
  }): Promise<QuestionnaireResponse[]> {
    try {
      let q = query(collection(db, this.RESPONSES_COLLECTION))
      
      if (criteria.userId) {
        q = query(q, where('userId', '==', criteria.userId))
      }
      
      if (criteria.questionnaireId) {
        q = query(q, where('questionnaireId', '==', criteria.questionnaireId))
      }
      
      if (criteria.status) {
        q = query(q, where('status', '==', criteria.status))
      }
      
      // Try with orderBy first, fallback to manual sorting
      let querySnapshot
      try {
        q = query(q, orderBy('submittedAt', 'desc'))
        querySnapshot = await getDocs(q)
      } catch (indexError) {
        console.warn('⚠️ Composite index not available, using manual sorting')
        // Remove orderBy and fetch without it
        q = query(collection(db, this.RESPONSES_COLLECTION))
        if (criteria.userId) {
          q = query(q, where('userId', '==', criteria.userId))
        }
        if (criteria.questionnaireId) {
          q = query(q, where('questionnaireId', '==', criteria.questionnaireId))
        }
        if (criteria.status) {
          q = query(q, where('status', '==', criteria.status))
        }
        querySnapshot = await getDocs(q)
      }
      
      const responses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        startedAt: doc.data().startedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as QuestionnaireResponse[]
      
      // Manual sorting by submittedAt (descending)
      const sortedResponses = responses.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      
      // Filter by date range if specified
      if (criteria.dateFrom || criteria.dateTo) {
        return sortedResponses.filter(response => {
          const submittedDate = new Date(response.submittedAt)
          const fromDate = criteria.dateFrom ? new Date(criteria.dateFrom) : new Date(0)
          const toDate = criteria.dateTo ? new Date(criteria.dateTo) : new Date()
          
          return submittedDate >= fromDate && submittedDate <= toDate
        })
      }
      
      return sortedResponses
    } catch (error) {
      console.error('❌ Error searching responses:', error)
      throw new Error(`Failed to search responses: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default QuestionnaireService
