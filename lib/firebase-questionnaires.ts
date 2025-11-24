import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import type { Questionnaire, QuestionnaireResponse } from '@/types/questionnaire'

// Collections
const QUESTIONNAIRES_COLLECTION = 'questionnaires'
const RESPONSES_COLLECTION = 'questionnaire_responses'

// Questionnaire CRUD operations
export async function createQuestionnaire(questionnaire: Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, QUESTIONNAIRES_COLLECTION), {
      ...questionnaire,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating questionnaire:', error)
    throw error
  }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, QUESTIONNAIRES_COLLECTION), orderBy('createdAt', 'desc'))
    )
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Questionnaire[]
  } catch (error) {
    console.error('Error fetching questionnaires:', error)
    throw error
  }
}

export async function getQuestionnaireById(id: string): Promise<Questionnaire | null> {
  try {
    const docRef = doc(db, QUESTIONNAIRES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Questionnaire
    }
    return null
  } catch (error) {
    console.error('Error fetching questionnaire:', error)
    throw error
  }
}

export async function updateQuestionnaire(id: string, updates: Partial<Questionnaire>): Promise<void> {
  try {
    const docRef = doc(db, QUESTIONNAIRES_COLLECTION, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating questionnaire:', error)
    throw error
  }
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  try {
    const docRef = doc(db, QUESTIONNAIRES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting questionnaire:', error)
    throw error
  }
}

// Response CRUD operations
export async function saveQuestionnaireResponse(response: Omit<QuestionnaireResponse, 'id' | 'submittedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, RESPONSES_COLLECTION), {
      ...response,
      submittedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving questionnaire response:', error)
    throw error
  }
}

export async function getQuestionnaireResponses(): Promise<QuestionnaireResponse[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, RESPONSES_COLLECTION), orderBy('submittedAt', 'desc'))
    )
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as QuestionnaireResponse[]
  } catch (error) {
    console.error('Error fetching responses:', error)
    throw error
  }
}

export async function getResponsesByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
  try {
    console.log('📊 Fetching responses for questionnaire:', questionnaireId)
    
    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('questionnaireId', '==', questionnaireId)
    )
    const querySnapshot = await getDocs(q)
    
    const responses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as QuestionnaireResponse[]
    
    // Sort in memory instead of using orderBy in the query
    responses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    console.log('✅ Responses fetched:', responses.length)
    return responses
  } catch (error) {
    console.error('Error fetching responses by questionnaire ID:', error)
    throw error
  }
}

export async function getResponsesByUserId(userId: string): Promise<QuestionnaireResponse[]> {
  try {
    console.log('📊 Fetching responses for user:', userId)
    
    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    const responses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as QuestionnaireResponse[]
    
    // Sort in memory instead of using orderBy in the query
    responses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    console.log('✅ Responses fetched:', responses.length)
    return responses
  } catch (error) {
    console.error('❌ Error fetching responses by user ID:', error)
    throw error
  }
}

export async function updateQuestionnaireResponse(id: string, updates: Partial<QuestionnaireResponse>): Promise<void> {
  try {
    const docRef = doc(db, RESPONSES_COLLECTION, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating response:', error)
    throw error
  }
}

export async function deleteQuestionnaireResponse(id: string): Promise<void> {
  try {
    const docRef = doc(db, RESPONSES_COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting response:', error)
    throw error
  }
}

// Analytics functions
export async function getQuestionnaireAnalytics(questionnaireId: string) {
  try {
    const responses = await getResponsesByQuestionnaireId(questionnaireId)
    
    const totalResponses = responses.length
    const completedResponses = responses.filter(r => r.status === 'completed').length
    const averageCompletion = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0
    
    // Calculate average time to complete (if you track startedAt and submittedAt)
    const completedWithTimes = responses.filter(r => 
      r.status === 'completed' && r.submittedAt
    )
    
    return {
      totalResponses,
      completedResponses,
      averageCompletion,
      incompletedResponses: totalResponses - completedResponses,
      responses: responses.slice(0, 10) // Latest 10 responses
    }
  } catch (error) {
    console.error('Error getting questionnaire analytics:', error)
    throw error
  }
}
