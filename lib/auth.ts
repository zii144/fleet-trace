import type { AuthUser } from "@/types/auth"

// Demo users - in production, this would be a database
const DEMO_USERS: AuthUser[] = [
  {
    id: "1",
    username: "admin",
    role: "admin",
  },
]

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  // Demo authentication - in production, this would validate against a database
  if (username === "admin" && password === "admin") {
    return DEMO_USERS[0]
  }
  return null
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("auth_user")
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

export function setCurrentUser(user: AuthUser): void {
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export function clearCurrentUser(): void {
  localStorage.removeItem("auth_user")
}
