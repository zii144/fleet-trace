import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    // Check if we have service account credentials
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "fleet-trace",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else {
      // Fallback to default credentials
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "fleet-trace",
      })
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    // Try fallback initialization
    try {
      initializeApp({
        projectId: "fleet-trace",
      })
    } catch (fallbackError) {
      console.error('Firebase Admin fallback initialization failed:', fallbackError)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token)
    
    if (decodedToken) {
      return NextResponse.json({ 
        authenticated: true, 
        uid: decodedToken.uid 
      }, { status: 200 })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
} 