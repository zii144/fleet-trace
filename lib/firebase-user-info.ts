import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore'
import { db } from './firebase'
import type { UserInfo, VoucherClaim } from '@/types/userInfo'
import UserInfoService from './services/UserInfoService'

// Collections
const USER_INFO_COLLECTION = 'user_info'
const VOUCHER_CLAIMS_COLLECTION = 'voucher_claims'

/**
 * Get user info by user ID
 */
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  const userInfoService = UserInfoService.getInstance()
  return await userInfoService.getUserInfo(userId)
}

/**
 * Check if user has submitted their personal information
 */
export async function hasUserInfo(userId: string): Promise<boolean> {
  const userInfoService = UserInfoService.getInstance()
  return await userInfoService.hasValidUserInfo(userId)
}

/**
 * Check if user is eligible for voucher
 */
export async function isVoucherEligible(userId: string): Promise<boolean> {
  const userInfoService = UserInfoService.getInstance()
  return await userInfoService.isVoucherEligible(userId)
}

/**
 * Claim voucher for user
 */
export async function claimVoucher(userInfoId: string): Promise<VoucherClaim> {
  const userInfoService = UserInfoService.getInstance()
  return await userInfoService.updateVoucherClaimed(userInfoId)
}

/**
 * Get voucher claims for user
 */
export async function getUserVoucherClaims(userId: string): Promise<VoucherClaim[]> {
  const userInfoService = UserInfoService.getInstance()
  return await userInfoService.getUserVoucherClaims(userId)
}

/**
 * Get all user info entries (for admin)
 */
export async function getAllUserInfo(): Promise<UserInfo[]> {
  try {
    console.log('📊 Getting all user info for admin...')
    
    // Try the optimized query first (requires index)
    try {
      const q = query(
        collection(db, USER_INFO_COLLECTION),
        where('isValid', '==', true),
        orderBy('submittedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      
      const userInfos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt,
        lastUpdatedAt: doc.data().lastUpdatedAt?.toDate?.()?.toISOString() || doc.data().lastUpdatedAt,
        voucherClaimedAt: doc.data().voucherClaimedAt?.toDate?.()?.toISOString() || doc.data().voucherClaimedAt
      })) as UserInfo[]
      
      console.log('✅ Retrieved user info with optimized query:', userInfos.length)
      return userInfos
    } catch (indexError) {
      console.log('⚠️ Optimized query failed, falling back to simple query:', indexError)
      
      // Fallback: Use simple query and sort in memory
      const simpleQuery = query(
        collection(db, USER_INFO_COLLECTION),
        where('isValid', '==', true)
      )
      
      const querySnapshot = await getDocs(simpleQuery)
      
      const userInfos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt,
        lastUpdatedAt: doc.data().lastUpdatedAt?.toDate?.()?.toISOString() || doc.data().lastUpdatedAt,
        voucherClaimedAt: doc.data().voucherClaimedAt?.toDate?.()?.toISOString() || doc.data().voucherClaimedAt
      })) as UserInfo[]
      
      // Sort by submittedAt in memory
      userInfos.sort((a, b) => {
        const dateA = new Date(a.submittedAt || 0).getTime()
        const dateB = new Date(b.submittedAt || 0).getTime()
        return dateB - dateA // Descending order
      })
      
      console.log('✅ Retrieved user info with fallback query:', userInfos.length)
      return userInfos
    }
  } catch (error) {
    console.error('❌ Error getting all user info:', error)
    throw error
  }
}

/**
 * Get all voucher claims (for admin)
 */
export async function getAllVoucherClaims(): Promise<VoucherClaim[]> {
  try {
    console.log('🎟️ Getting all voucher claims for admin...')
    
    // Add timeout protection
    const queryPromise = new Promise<VoucherClaim[]>(async (resolve, reject) => {
      try {
        const q = query(
          collection(db, VOUCHER_CLAIMS_COLLECTION),
          orderBy('claimedAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        
        const claims = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          claimedAt: doc.data().claimedAt?.toDate?.()?.toISOString() || doc.data().claimedAt
        })) as VoucherClaim[]
        
        console.log('✅ Retrieved voucher claims:', claims.length)
        resolve(claims)
      } catch (error) {
        reject(error)
      }
    })
    
    // Add timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('getAllVoucherClaims query timed out after 15 seconds'))
      }, 15000)
    })
    
    return await Promise.race([queryPromise, timeoutPromise])
  } catch (error) {
    console.error('❌ Error getting all voucher claims:', error)
    throw error
  }
}

/**
 * Get user info statistics
 */
export async function getUserInfoStats(): Promise<{
  totalUsers: number
  totalVouchersEligible: number
  totalVouchersClaimed: number
  totalVoucherAmount: number
}> {
  try {
    console.log('📈 Getting user info statistics...')
    
    // Add timeout protection
    const statsPromise = new Promise<{
      totalUsers: number
      totalVouchersEligible: number
      totalVouchersClaimed: number
      totalVoucherAmount: number
    }>(async (resolve, reject) => {
      try {
        const [userInfoSnapshot, voucherClaimsSnapshot] = await Promise.all([
          getDocs(query(collection(db, USER_INFO_COLLECTION), where('isValid', '==', true))),
          getDocs(collection(db, VOUCHER_CLAIMS_COLLECTION))
        ])
        
        const totalUsers = userInfoSnapshot.size
        const totalVouchersEligible = userInfoSnapshot.docs.filter(doc => 
          doc.data().voucherEligible && !doc.data().voucherClaimedAt
        ).length
        const totalVouchersClaimed = voucherClaimsSnapshot.size
        const totalVoucherAmount = voucherClaimsSnapshot.docs.reduce((sum, doc) => 
          sum + (doc.data().amount || 0), 0
        )
        
        const stats = {
          totalUsers,
          totalVouchersEligible,
          totalVouchersClaimed,
          totalVoucherAmount
        }
        
        console.log('✅ Retrieved statistics:', stats)
        resolve(stats)
      } catch (error) {
        reject(error)
      }
    })
    
    // Add timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('getUserInfoStats query timed out after 15 seconds'))
      }, 15000)
    })
    
    return await Promise.race([statsPromise, timeoutPromise])
  } catch (error) {
    console.error('❌ Error getting user info stats:', error)
    throw error
  }
}
