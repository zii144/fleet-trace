"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth state is determined
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        // Check if user just completed registration and needs email verification
        const pendingVerification = localStorage.getItem(
          "fleet_trace_pending_verification"
        );
        if (pendingVerification) {
          // User just registered, redirect to login page where they'll see verification message
          router.replace("/login");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while determining auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // This should never be reached, but just in case
  return null;
}
