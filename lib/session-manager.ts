import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { auth } from './firebase'

export interface SessionConfig {
  rememberMe: boolean
  sessionDuration: number // in days
}

export class SessionManager {
  private static readonly SESSION_KEY = 'fleet_trace_session_config'
  private static readonly DEFAULT_SESSION_DURATION = 14 // 14 days

  /**
   * Configure session persistence based on user preference
   */
  static async configureSession(rememberMe: boolean = false): Promise<void> {
    try {
      console.log('🔐 Configuring session persistence...')
      console.log('💾 Remember Me:', rememberMe)
      
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistence)
      
      // Store session configuration
      this.storeSessionConfig({ rememberMe, sessionDuration: this.DEFAULT_SESSION_DURATION })
      
      console.log('✅ Session persistence configured:', rememberMe ? 'LOCAL (persistent)' : 'SESSION (browser session only)')
    } catch (error) {
      console.error('❌ Error configuring session persistence:', error)
      throw error
    }
  }

  /**
   * Store session configuration in localStorage
   */
  private static storeSessionConfig(config: SessionConfig): void {
    try {
      const sessionData = {
        ...config,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + config.sessionDuration * 24 * 60 * 60 * 1000).toISOString()
      }
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
      console.log('💾 Session config stored:', sessionData)
    } catch (error) {
      console.error('❌ Error storing session config:', error)
    }
  }

  /**
   * Get stored session configuration
   */
  static getSessionConfig(): SessionConfig | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY)
      if (!stored) return null
      
      const config = JSON.parse(stored) as SessionConfig & { expiresAt: string }
      
      // Check if session has expired
      if (new Date(config.expiresAt) < new Date()) {
        console.log('⏰ Session expired, clearing config')
        this.clearSessionConfig()
        return null
      }
      
      return config
    } catch (error) {
      console.error('❌ Error reading session config:', error)
      return null
    }
  }

  /**
   * Clear session configuration
   */
  static clearSessionConfig(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
      console.log('🗑️ Session config cleared')
    } catch (error) {
      console.error('❌ Error clearing session config:', error)
    }
  }

  /**
   * Clear all authentication-related data and sessions
   */
  static clearAllAuthData(): void {
    try {
      console.log('🧹 Clearing all authentication data...')
      
      // Clear session configuration
      this.clearSessionConfig()
      
      // Clear any other auth-related localStorage items
      const authKeys = [
        'fleet_trace_pending_verification',
        'fleet_trace_session_config',
        'fleet_trace_auth_state',
        'fleet_trace_user_data'
      ]
      
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🗑️ Cleared localStorage key: ${key}`)
        }
      })
      
      // Clear any sessionStorage items
      try {
        sessionStorage.clear()
        console.log('🗑️ Session storage cleared')
      } catch (error) {
        console.warn('⚠️ Could not clear session storage:', error)
      }
      
      console.log('✅ All authentication data cleared')
    } catch (error) {
      console.error('❌ Error clearing authentication data:', error)
    }
  }

  /**
   * Check if user has a valid remember me session
   */
  static hasValidRememberMeSession(): boolean {
    const config = this.getSessionConfig()
    return config?.rememberMe === true
  }

  /**
   * Get session expiration date
   */
  static getSessionExpirationDate(): Date | null {
    const config = this.getSessionConfig()
    return config ? new Date(Date.now() + config.sessionDuration * 24 * 60 * 60 * 1000) : null
  }

  /**
   * Get remaining session time in days
   */
  static getRemainingSessionDays(): number {
    const config = this.getSessionConfig()
    if (!config) return 0
    
    const expiresAt = new Date(Date.now() + config.sessionDuration * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }
}
