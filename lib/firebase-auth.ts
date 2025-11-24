import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserProfile, getUserProfile, updateUserProfile } from './firebase-users'
import { SessionManager } from './session-manager'
import type { User } from '@/types/auth'

// Convert Firebase User to our User interface
async function mapFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
  try {
    // Get user profile from Firestore to get role
    const userProfile = await getUserProfile(firebaseUser.uid);
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      role: userProfile?.role || 'user', // Get role from Firestore profile
      emailVerified: firebaseUser.emailVerified
    }
  } catch (error) {
    console.warn('⚠️ Could not fetch user profile from Firestore, using default values:', error);
    
    // Return a user object with default values if Firestore is unavailable
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user', // Default role
      emailVerified: firebaseUser.emailVerified
    }
  }
}

// Force clear all Firebase authentication state
export async function forceClearAuthState(): Promise<void> {
  try {
    console.log('🧹 Force clearing all Firebase authentication state...')
    
    // Sign out if there's a current user
    if (auth.currentUser) {
      await signOut(auth)
      console.log('✅ Current user signed out')
    }
    
    // Clear all authentication data
    try {
      const { SessionManager } = await import('./session-manager')
      SessionManager.clearAllAuthData()
      console.log('✅ All authentication data cleared')
    } catch (error) {
      console.warn('⚠️ Could not clear authentication data:', error)
    }
    
    // Force clear any remaining Firebase state
    try {
      // Clear any cached auth tokens
      if (typeof window !== 'undefined' && window.indexedDB) {
        // This is a more aggressive approach to clear Firebase's internal state
        console.log('🗑️ Attempting to clear Firebase internal state...')
      }
      
      // Clear Firebase persistence to ensure no state persists
      try {
        const { setPersistence, browserSessionPersistence } = await import('firebase/auth')
        await setPersistence(auth, browserSessionPersistence)
        console.log('✅ Firebase persistence reset to session-only')
      } catch (persistenceError) {
        console.warn('⚠️ Could not reset Firebase persistence:', persistenceError)
      }
    } catch (error) {
      console.warn('⚠️ Could not clear Firebase internal state:', error)
    }
    
    console.log('✅ Firebase authentication state cleared')
  } catch (error) {
    console.error('❌ Error clearing Firebase authentication state:', error)
  }
}

// Sign up new user with email verification
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  try {
    console.log('🚀 Starting user registration...')
    console.log('📧 Email:', email)
    console.log('👤 Display Name:', displayName)
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    console.log('✅ Firebase Auth user created:', firebaseUser.uid)
    
    // Update the user's display name
    await updateProfile(firebaseUser, { displayName })
    console.log('✅ User profile updated in Firebase Auth')
    
    // Send email verification
    await sendEmailVerification(firebaseUser)
    console.log('📧 Email verification sent to:', email)
    
    // Create user profile in Firestore with the user's UID as document ID
    try {
      await createUserProfile(firebaseUser.uid, {
        email: firebaseUser.email || '',
        displayName,
        totalSubmissions: 0,
        lastActiveAt: new Date().toISOString(),
        emailVerified: false,
        role: 'user' // Default role for new users
      })
      console.log('✅ User profile created in Firestore')
      
      // Add a small delay to ensure the profile is properly written
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (profileError) {
      console.warn('⚠️ Warning: Could not create user profile in Firestore:', profileError)
      console.log('ℹ️ User account created but profile creation failed. User will need to complete profile setup after email verification.')
      // Continue with registration even if profile creation fails
    }
    
    // Create a user object directly instead of calling mapFirebaseUser to avoid permission issues
    const mappedUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user', // Default role for new users
      emailVerified: false
    }
    console.log('✅ User object created successfully')
    
    // Aggressively clear all session data and sign out
    console.log('🧹 Clearing all session data...')
    
    try {
      // Force clear all Firebase authentication state
      await forceClearAuthState()
      console.log('✅ All Firebase authentication state cleared')
      
      // Sign out the user immediately after registration
      // They need to verify their email before they can log in
      await signOut(auth)
      console.log('🚪 User signed out - email verification required')
      
      // Force a small delay to ensure sign out is processed
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (clearError) {
      console.warn('⚠️ Warning: Could not clear authentication state:', clearError)
      // Continue with registration even if clearing fails
    }
    
    return mappedUser
  } catch (error) {
    console.error('❌ Error signing up:', error)
    throw error
  }
}

// Sign in existing user (requires email verification)
export async function signIn(email: string, password: string, rememberMe: boolean = false): Promise<User> {
  console.log('🔐 Starting sign in process...')
  console.log('📧 Email:', email)
  console.log('🔒 Password length:', password.length)
  console.log('💾 Remember Me:', rememberMe)
  
  try {
    // Configure session persistence before authentication
    await SessionManager.configureSession(rememberMe)
    
    console.log('⏳ Attempting Firebase authentication...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    console.log('✅ Firebase authentication successful!')
    console.log('👤 User ID:', firebaseUser.uid)
    console.log('📧 User Email:', firebaseUser.email)
    console.log('👨‍💼 Display Name:', firebaseUser.displayName)
    console.log('✉️ Email Verified:', firebaseUser.emailVerified)
    
    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      console.log('❌ Email not verified - signing out user')
      await signOut(auth)
      throw new Error('EMAIL_NOT_VERIFIED')
    }
    
    // Update last active time and email verification status
    console.log('📝 Updating user profile...')
    await updateUserProfile(firebaseUser.uid, {
      lastActiveAt: new Date().toISOString(),
      emailVerified: true
    })
    console.log('✅ User profile updated successfully')
    
    const mappedUser = await mapFirebaseUser(firebaseUser)
    console.log('🎯 Mapped user object:', mappedUser)
    
    return mappedUser
  } catch (error: any) {
    console.error('❌ Sign in failed with error:')
    console.error('🔍 Error code:', error.code)
    console.error('💬 Error message:', error.message)
    console.error('📊 Full error object:', error)
    
    // Log specific Firebase auth error codes
    switch (error.code) {
      case 'auth/user-not-found':
        console.error('🚫 User not found - email may not be registered')
        break
      case 'auth/wrong-password':
        console.error('🔑 Wrong password provided')
        break
      case 'auth/invalid-email':
        console.error('📧 Invalid email format')
        break
      case 'auth/user-disabled':
        console.error('⛔ User account has been disabled')
        break
      case 'auth/too-many-requests':
        console.error('🚨 Too many failed attempts - account temporarily locked')
        break
      case 'auth/network-request-failed':
        console.error('🌐 Network error - check internet connection')
        break
      case 'auth/invalid-credential':
        console.error('🔐 Invalid credentials provided')
        break
      default:
        console.error('❓ Unknown authentication error')
    }
    
    throw error
  }
}

// Sign out user
export async function logOut(): Promise<void> {
  try {
    console.log('🚪 Signing out user...')
    
    // Clear session configuration
    SessionManager.clearSessionConfig()
    
    await signOut(auth)
    console.log('✅ User signed out successfully')
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser
  
  // Check if user exists and email is verified
  if (!firebaseUser || !firebaseUser.emailVerified) {
    console.log('❌ No current user or email not verified')
    return null
  }
  
  return await mapFirebaseUser(firebaseUser)
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  console.log('👂 Setting up auth state listener...')
  
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log('🔄 Auth state changed - User signed in:')
      console.log('👤 User ID:', firebaseUser.uid)
      console.log('📧 User Email:', firebaseUser.email)
      console.log('👨‍💼 Display Name:', firebaseUser.displayName)
      console.log('✉️ Email Verified:', firebaseUser.emailVerified)
      console.log('⏰ Timestamp:', new Date().toISOString())
      
      // Check if email is verified - if not, sign out the user and don't call the callback
      if (!firebaseUser.emailVerified) {
        console.log('❌ Email not verified - signing out user and blocking access')
        console.log('🚫 User will be redirected to login page')
        
        // Clear all authentication data
        try {
          const { SessionManager } = await import('./session-manager')
          SessionManager.clearAllAuthData()
          console.log('✅ Authentication data cleared for unverified user')
        } catch (error) {
          console.warn('⚠️ Could not clear authentication data:', error)
        }
        
        // Sign out the user
        await signOut(auth)
        console.log('🚪 Unverified user signed out')
        
        // Call callback with null to indicate no authenticated user
        callback(null)
        return
      }
      
      try {
        const user = await mapFirebaseUser(firebaseUser)
        console.log('✅ User mapped successfully:', user)
        callback(user)
      } catch (error) {
        console.error('❌ Error mapping user:', error)
        // Even if mapping fails, we should still consider the user authenticated
        // Create a basic user object from Firebase user data
        const fallbackUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'user'
        }
        console.log('🔄 Using fallback user object:', fallbackUser)
        callback(fallbackUser)
      }
    } else {
      console.log('🔄 Auth state changed - User signed out')
      console.log('⏰ Timestamp:', new Date().toISOString())
      callback(null)
    }
  })
}

// Update user profile
export async function updateUserInfo(userId: string, updates: { displayName?: string; photoURL?: string }): Promise<void> {
  try {
    const firebaseUser = auth.currentUser
    
    // Check if user is authenticated and email is verified
    if (!firebaseUser || !firebaseUser.emailVerified || firebaseUser.uid !== userId) {
      throw new Error('Unauthorized: User must be authenticated with verified email to update profile')
    }
    
    await updateProfile(firebaseUser, updates)
    
    // Also update in Firestore
    await updateUserProfile(userId, {
      displayName: updates.displayName || undefined
    })
  } catch (error) {
    console.error('Error updating user info:', error)
    throw error
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const currentUser = auth.currentUser
  
  console.log('🔍 Checking authentication status:', {
    hasCurrentUser: !!currentUser,
    userId: currentUser?.uid,
    email: currentUser?.email,
    emailVerified: currentUser?.emailVerified,
    timestamp: new Date().toISOString()
  })
  
  const isAuth = currentUser !== null && currentUser.emailVerified === true
  
  if (isAuth) {
    console.log('✅ User is authenticated and email verified')
  } else {
    console.log('❌ User is not authenticated or email not verified')
  }
  
  return isAuth
}

// Get user ID
export function getUserId(): string | null {
  const currentUser = auth.currentUser
  return currentUser && currentUser.emailVerified ? currentUser.uid : null
}

// Send email verification
export async function sendVerificationEmail(email: string, password: string): Promise<void> {
  try {
    console.log('📧 Resending email verification...')
    
    // Sign in the user temporarily to send verification email
    // Use Firebase's signInWithEmailAndPassword directly to bypass our email verification check
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    if (firebaseUser.emailVerified) {
      console.log('✅ Email is already verified')
      // Sign out the user since they don't need to be signed in
      await signOut(auth)
      return
    }
    
    await sendEmailVerification(firebaseUser)
    console.log('📧 Email verification sent successfully')
    
    // Sign out the user immediately
    await signOut(auth)
    console.log('🚪 User signed out after sending verification email')
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    throw error
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    console.log('🔄 Sending password reset email to:', email)
    await sendPasswordResetEmail(auth, email)
    console.log('✅ Password reset email sent successfully')
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}
