// Basic auth-related type definitions for the questionnaire platform.

export type Role = "admin" | "user"

export interface User {
  id: string
  email: string
  name?: string
  role: Role
  emailVerified?: boolean
  displayName?: string
  photoURL?: string
}

// Legacy AuthUser interface for backward compatibility
export interface AuthUser {
  id: string
  username: string
  role: Role
  email?: string
  displayName?: string
}

export interface Session {
  user: User | null
  /**
   * JWT or other auth token returned by your auth provider.
   */
  token: string | null
  /**
   * Expiry time as a Unix timestamp (milliseconds).
   */
  expiresAt: number | null
}

// Legacy AuthContextType for backward compatibility
export interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}
