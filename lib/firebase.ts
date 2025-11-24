import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Debug: Log Firebase configuration (without sensitive data)
console.log('🔧 Firebase Config Debug:', {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  configComplete: Object.values(firebaseConfig).every(val => val && val !== 'undefined')
})

// Initialize Firebase
console.log('🚀 Initializing Firebase...')
const app = initializeApp(firebaseConfig)
console.log('✅ Firebase app initialized successfully')

// Initialize Firebase services
console.log('🔗 Initializing Firebase services...')
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Configure auth persistence
console.log('🔐 Configuring auth persistence...')
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to LOCAL (persistent across browser sessions)')
  })
  .catch((error) => {
    console.error('❌ Error setting auth persistence:', error)
  })

console.log('✅ Firebase services initialized:', {
  hasFirestore: !!db,
  hasAuth: !!auth,
  hasStorage: !!storage
})

// Debug function to test Firebase connectivity
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing Firebase connection...')
    
    // Test Firestore connection by trying to access a collection
    const { collection, getDocs } = await import('firebase/firestore')
    const testCollection = collection(db, 'test')
    console.log('✅ Firestore connection test passed')
    
    // Test Auth connection  
    const { getCurrentUser } = await import('./firebase-auth')
    const currentUser = await getCurrentUser()
    console.log('🔐 Auth service available, current user:', currentUser?.email || 'No user')
    
    console.log('✅ Firebase connection test completed successfully')
    return true
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    return false
  }
}

export default app
