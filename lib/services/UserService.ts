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
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '@/types/user'

export class UserService {
  private static instance: UserService
  private readonly COLLECTION = 'users'

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  /**
   * Create a new user profile
   */
  async createProfile(userId: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      console.log('📝 Creating user profile for user ID:', userId)
      
      const docRef = doc(db, this.COLLECTION, userId)
      await setDoc(docRef, {
        ...profile,
        role: profile.role || 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      })
      
      console.log('✅ User profile created successfully')
    } catch (error) {
      console.error('❌ Error creating user profile:', error)
      throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as UserProfile
      }
      return null
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      console.log('📝 Updating user profile for:', userId)
      
      const docRef = doc(db, this.COLLECTION, userId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      })
      
      console.log('✅ User profile updated successfully')
    } catch (error) {
      console.error('❌ Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting user profile for:', userId)
      
      const docRef = doc(db, this.COLLECTION, userId)
      await deleteDoc(docRef)
      
      console.log('✅ User profile deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting user profile:', error)
      throw new Error(`Failed to delete user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as UserProfile
      })
    } catch (error) {
      console.error('❌ Error fetching all users:', error)
      throw new Error(`Failed to fetch all users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    try {
      console.log('👑 Updating user role for:', userId, 'to:', role)
      
      const docRef = doc(db, this.COLLECTION, userId)
      await updateDoc(docRef, {
        role,
        updatedAt: serverTimestamp()
      })
      
      console.log('✅ User role updated successfully')
    } catch (error) {
      console.error('❌ Error updating user role:', error)
      throw new Error(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId)
      return profile?.role === 'admin'
    } catch (error) {
      console.error('❌ Error checking admin status:', error)
      return false
    }
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId)
      await updateDoc(docRef, {
        lastActiveAt: serverTimestamp()
      })
    } catch (error) {
      console.error('❌ Error updating last active:', error)
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Search users by email or display name
   */
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const users = await this.getAllUsers()
      const searchLower = searchTerm.toLowerCase()
      
      return users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower)
      )
    } catch (error) {
      console.error('❌ Error searching users:', error)
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default UserService
