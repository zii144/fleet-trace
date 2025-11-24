import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  addDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import type { UserInfo, VoucherClaim } from '@/types/userInfo'
import { checkAppVersion } from '../version-check'

export class UserInfoService {
  private static instance: UserInfoService
  private readonly USER_INFO_COLLECTION = 'user_info'
  private readonly VOUCHER_CLAIMS_COLLECTION = 'voucher_claims'
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): UserInfoService {
    if (!UserInfoService.instance) {
      UserInfoService.instance = new UserInfoService()
    }
    return UserInfoService.instance
  }

  /**
   * Submit user info from self-info-survey questionnaire
   */
  async submitUserInfo(
    userId: string, 
    questionnaireData: any, 
    responseId: string
  ): Promise<string> {
    try {
      console.log('👤 UserInfoService: Starting submission for user:', userId)
      console.log('� UserInfoService: Raw questionnaire data:', questionnaireData)
      
      const now = new Date().toISOString()
      
      // Check if user already has existing data
      const existingUserInfo = await this.getUserInfo(userId)
      let userInfoId: string
      let isUpdate = false
      
      if (existingUserInfo) {
        // Use existing document ID for update
        userInfoId = existingUserInfo.id
        isUpdate = true
        console.log('🔄 UserInfoService: Found existing data, will update:', userInfoId)
      } else {
        // Create new document ID
        userInfoId = `${userId}-${Date.now()}`
        console.log('➕ UserInfoService: Creating new document:', userInfoId)
      }
      
      // Process questionnaire data to extract user info fields
      const userInfo: UserInfo = {
        id: userInfoId,
        userId,
        name: this.extractTextValue(questionnaireData.name || questionnaireData['name']),
        gender: this.extractGenderValue(questionnaireData.gender || questionnaireData['gender']),
        genderDescription: this.extractGenderDescription(questionnaireData.gender || questionnaireData['gender']),
        birthDate: this.extractDateValue(questionnaireData.age || questionnaireData['age']),
        city: this.extractTextValue(questionnaireData.city || questionnaireData['city']),
        submittedAt: isUpdate && existingUserInfo ? existingUserInfo.submittedAt : now, // Keep original submission time for updates
        questionnaireId: 'self-info-survey',
        responseId,
        isValid: true,
        lastUpdatedAt: now,
        voucherEligible: isUpdate && existingUserInfo ? existingUserInfo.voucherEligible : true, // Preserve voucher status if updating
        voucherClaimedAt: isUpdate && existingUserInfo ? existingUserInfo.voucherClaimedAt : undefined, // Preserve claimed status
        voucherAmount: existingUserInfo?.voucherAmount || 50 // Keep existing amount or default
      }

      console.log('🔄 UserInfoService: Processed user info data:', userInfo)
      console.log(`📝 UserInfoService: Operation type: ${isUpdate ? 'UPDATE' : 'CREATE'}`)

      // Filter out undefined values to prevent Firestore errors
      const cleanUserInfo = Object.fromEntries(
        Object.entries(userInfo).filter(([_, value]) => value !== undefined)
      )

      console.log('🧹 UserInfoService: Clean user info (undefined values filtered):', cleanUserInfo)

      // Save to Firestore
      const docRef = doc(db, this.USER_INFO_COLLECTION, userInfoId)
      console.log('💾 UserInfoService: Attempting to save to Firestore path:', `${this.USER_INFO_COLLECTION}/${userInfoId}`)
      
      await setDoc(docRef, {
        ...cleanUserInfo,
        submittedAt: isUpdate && existingUserInfo ? existingUserInfo.submittedAt : serverTimestamp(),
        lastUpdatedAt: serverTimestamp()
      })
      
      console.log(`✅ UserInfoService: User info ${isUpdate ? 'updated' : 'created'} successfully:`, userInfoId)
      console.log('📊 UserInfoService: User info summary:', {
        name: userInfo.name,
        gender: userInfo.gender,
        city: userInfo.city,
        voucherEligible: userInfo.voucherEligible,
        operationType: isUpdate ? 'UPDATE' : 'CREATE'
      })
      
      return userInfoId
    } catch (error) {
      console.error('❌ UserInfoService: Error submitting user info:', error)
      console.error('❌ UserInfoService: Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        userId,
        userInfoCollection: this.USER_INFO_COLLECTION
      })
      throw new Error(`Failed to submit user info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get user info for a specific user
   */
  async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      console.log('📖 UserInfoService: Getting user info for user:', userId)
      
      // Check app version before using cached data
      const { needsUpdate } = checkAppVersion()
      if (needsUpdate) {
        console.log('⚠️ UserInfoService: App version outdated, skipping cache')
      }
      
      // Create query with timeout protection
      const queryPromise = new Promise<UserInfo | null>(async (resolve, reject) => {
        try {
          // Use a simpler query approach to avoid index issues
          // First get all documents for the user, then filter and sort in memory
          const q = query(
            collection(db, this.USER_INFO_COLLECTION),
            where('userId', '==', userId),
            where('isValid', '==', true)
          )
          
          console.log('🔍 UserInfoService: Executing Firestore query...')
          const querySnapshot = await getDocs(q)
          
          if (querySnapshot.empty) {
            console.log('📭 UserInfoService: No user info found for user:', userId)
            resolve(null)
            return
          }
          
          // Sort documents by submittedAt in memory and get the latest
          const docs = querySnapshot.docs.map(doc => ({
            doc,
            data: doc.data(),
            submittedAt: doc.data().submittedAt?.toDate?.() || new Date(doc.data().submittedAt || 0)
          }))
          
          // Sort by submittedAt descending and get the first (latest)
          docs.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
          const latestDoc = docs[0]
          
          if (!latestDoc) {
            console.log('📭 UserInfoService: No valid documents found after sorting')
            resolve(null)
            return
          }
          
          const data = latestDoc.data
          
          const userInfo: UserInfo = {
            id: latestDoc.doc.id,
            userId: data.userId,
            name: data.name,
            gender: data.gender,
            genderDescription: data.genderDescription,
            birthDate: data.birthDate,
            city: data.city,
            submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt,
            questionnaireId: data.questionnaireId,
            responseId: data.responseId,
            isValid: data.isValid,
            lastUpdatedAt: data.lastUpdatedAt?.toDate?.()?.toISOString() || data.lastUpdatedAt,
            voucherEligible: data.voucherEligible,
            voucherClaimedAt: data.voucherClaimedAt?.toDate?.()?.toISOString() || data.voucherClaimedAt,
            voucherAmount: data.voucherAmount || 50
          }
          
          console.log('✅ UserInfoService: User info retrieved:', userInfo.id)
          resolve(userInfo)
        } catch (error) {
          reject(error)
        }
      })
      
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('getUserInfo query timed out after 10 seconds'))
        }, 10000)
      })
      
      return await Promise.race([queryPromise, timeoutPromise])
    } catch (error) {
      console.error('❌ UserInfoService: Error getting user info:', error)
      // Return null instead of throwing to prevent infinite loading
      return null
    }
  }

  /**
   * Update voucher claimed status
   */
  async updateVoucherClaimed(userInfoId: string): Promise<VoucherClaim> {
    try {
      console.log('🎟️ Updating voucher claimed for user info:', userInfoId)
      
      const userInfoRef = doc(db, this.USER_INFO_COLLECTION, userInfoId)
      const userInfoDoc = await getDoc(userInfoRef)
      
      if (!userInfoDoc.exists()) {
        throw new Error('User info not found')
      }
      
      const userInfo = userInfoDoc.data() as UserInfo
      
      if (!userInfo.voucherEligible) {
        throw new Error('User is not eligible for voucher')
      }
      
      if (userInfo.voucherClaimedAt) {
        throw new Error('Voucher has already been claimed')
      }
      
      const claimId = `${userInfo.userId}-claim-${Date.now()}`
      const now = new Date()
      const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
      
      // Create voucher claim record
      const voucherClaim: VoucherClaim = {
        id: claimId,
        userId: userInfo.userId,
        userInfoId: userInfoId,
        amount: userInfo.voucherAmount || 50,
        claimedAt: now.toISOString(),
        status: 'approved',
        expiresAt: expiresAt.toISOString()
      }
      
      await addDoc(collection(db, this.VOUCHER_CLAIMS_COLLECTION), {
        ...voucherClaim,
        claimedAt: serverTimestamp()
      })
      
      // Update user info to mark voucher as claimed
      await updateDoc(userInfoRef, {
        voucherEligible: false,
        voucherClaimedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp()
      })
      
      console.log('✅ Voucher claim created:', claimId)
      return voucherClaim
    } catch (error) {
      console.error('❌ Error updating voucher claimed:', error)
      throw error
    }
  }

  /**
   * Check if user has valid user info
   */
  async hasValidUserInfo(userId: string): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(userId)
      return userInfo !== null && userInfo.isValid
    } catch (error) {
      console.error('❌ Error checking valid user info:', error)
      return false
    }
  }

  /**
   * Check if user is eligible for voucher
   */
  async isVoucherEligible(userId: string): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(userId)
      return userInfo !== null && userInfo.voucherEligible && !userInfo.voucherClaimedAt
    } catch (error) {
      console.error('❌ Error checking voucher eligibility:', error)
      return false
    }
  }

  /**
   * Get voucher claims for a user
   */
  async getUserVoucherClaims(userId: string): Promise<VoucherClaim[]> {
    try {
      console.log('🎟️ UserInfoService: Getting voucher claims for user:', userId)
      
      // Create query with timeout protection
      const queryPromise = new Promise<VoucherClaim[]>(async (resolve, reject) => {
        try {
          const q = query(
            collection(db, this.VOUCHER_CLAIMS_COLLECTION),
            where('userId', '==', userId),
            orderBy('claimedAt', 'desc')
          )
          
          console.log('🔍 UserInfoService: Executing voucher claims query...')
          const querySnapshot = await getDocs(q)
          
          const claims = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            claimedAt: doc.data().claimedAt?.toDate?.()?.toISOString() || doc.data().claimedAt,
            expiresAt: doc.data().expiresAt
          })) as VoucherClaim[]
          
          console.log('✅ UserInfoService: Voucher claims retrieved:', claims.length)
          resolve(claims)
        } catch (error) {
          reject(error)
        }
      })
      
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('getUserVoucherClaims query timed out after 10 seconds'))
        }, 10000)
      })
      
      return await Promise.race([queryPromise, timeoutPromise])
    } catch (error) {
      console.error('❌ UserInfoService: Error getting voucher claims:', error)
      // Return empty array instead of throwing to prevent infinite loading
      return []
    }
  }

  /**
   * Extract text value from questionnaire response
   */
  private extractTextValue(value: any): string {
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'object' && value?.value) return String(value.value).trim()
    return ''
  }

  /**
   * Extract gender value from questionnaire response
   */
  private extractGenderValue(value: any): string {
    if (typeof value === 'string') return value
    if (typeof value === 'object' && value?.value) return value.value
    if (typeof value === 'object' && value?.selectedOption) return value.selectedOption
    return '未指定'
  }

  /**
   * Extract gender description for "其他" option
   */
  private extractGenderDescription(value: any): string {
    if (typeof value === 'object' && value?.textInput) {
      return value.textInput.trim()
    }
    return '' // Return empty string instead of undefined
  }

  /**
   * Extract date value from questionnaire response
   */
  private extractDateValue(value: any): string {
    if (typeof value === 'string') {
      // Validate and format date
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0] // YYYY-MM-DD format
      }
    }
    return ''
  }
}

export default UserInfoService
