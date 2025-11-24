"use client";

import type React from "react";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🛡️ ProtectedRoute: Checking access...");
    console.log("👤 User:", user);
    console.log("⏳ Loading:", isLoading);
    console.log("🔒 Require Admin:", requireAdmin);
    console.log("👑 User Role:", user?.role);

    if (!isLoading && !user) {
      console.log("🚫 No user found, redirecting to login");
      router.push("/login");
    } else if (!isLoading && user && requireAdmin && user.role !== "admin") {
      console.log("🚫 User is not admin, redirecting to dashboard");
      router.push("/dashboard");
    } else if (!isLoading && user) {
      console.log("✅ User authenticated, allowing access");
    }
  }, [user, isLoading, router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在驗證登入狀態...</p>
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
