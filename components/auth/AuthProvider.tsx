"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChange,
  signIn,
  logOut,
  type User,
} from "@/lib/firebase-auth";
import { SessionManager } from "@/lib/session-manager";
import { markAsReturningUser } from "@/lib/version-check";

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasRememberMeSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRememberMeSession, setHasRememberMeSession] = useState(false);

  useEffect(() => {
    console.log("🚀 AuthProvider: Setting up auth state listener...");

    // Check for existing remember me session
    const hasSession = SessionManager.hasValidRememberMeSession();
    setHasRememberMeSession(hasSession);
    console.log("💾 Remember me session found:", hasSession);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log(
          "⏰ AuthProvider: Loading timeout reached, setting loading to false"
        );
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthStateChange((user) => {
      console.log("🔄 AuthProvider: Auth state changed");
      console.log("👤 User:", user);
      console.log("🔍 User details:", {
        id: user?.id,
        email: user?.email,
        displayName: user?.displayName,
        role: user?.role,
      });

      // Mark user as returning if they have an existing session
      if (user) {
        markAsReturningUser();
      }

      setUser(user);
      setIsLoading(false);
      clearTimeout(timeoutId); // Clear timeout when auth state is resolved
      console.log("✅ AuthProvider: Auth state updated, loading set to false");
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [isLoading]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    console.log("🔐 AuthProvider: Starting login process...");
    console.log("💾 Remember Me:", rememberMe);
    setIsLoading(true);

    try {
      console.log("📞 AuthProvider: Calling signIn function...");
      const authenticatedUser = await signIn(email, password, rememberMe);

      if (authenticatedUser) {
        console.log("✅ AuthProvider: Login successful, setting user state");
        console.log("👤 AuthProvider: User object:", authenticatedUser);
        // Mark user as returning after successful login
        markAsReturningUser();
        setUser(authenticatedUser);
        setHasRememberMeSession(rememberMe);
        return true;
      } else {
        console.log("❌ AuthProvider: Login failed - no user returned");
        return false;
      }
    } catch (error: any) {
      console.error("❌ AuthProvider: Login failed with error:");
      console.error("🔍 Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      // Re-throw the error so the login page can handle it
      throw error;
    } finally {
      console.log("🏁 AuthProvider: Setting loading to false");
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logOut();
      setUser(null);
      setHasRememberMeSession(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, hasRememberMeSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
