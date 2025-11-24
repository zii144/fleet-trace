"use client";

import { useEffect, useState } from "react";
import {
  checkAppVersion,
  clearAppCache,
  APP_VERSION,
} from "@/lib/version-check";

interface VersionCheckResult {
  needsUpdate: boolean;
  currentVersion: string;
  cachedVersion: string | null;
  isChecking: boolean;
  forceUpdate: () => Promise<void>;
}

/**
 * Hook for checking app version and managing cache updates
 */
export function useVersionCheck(): VersionCheckResult {
  const [versionState, setVersionState] = useState({
    needsUpdate: false,
    currentVersion: APP_VERSION,
    cachedVersion: null as string | null,
    isChecking: true,
  });

  useEffect(() => {
    const performVersionCheck = () => {
      try {
        const result = checkAppVersion();
        setVersionState({
          needsUpdate: result.needsUpdate,
          currentVersion: result.currentVersion,
          cachedVersion: result.cachedVersion,
          isChecking: false,
        });
      } catch (error) {
        console.error("❌ Version check failed:", error);
        setVersionState((prev) => ({ ...prev, isChecking: false }));
      }
    };

    performVersionCheck();
  }, []);

  const forceUpdate = async (): Promise<void> => {
    try {
      console.log("🚀 Force updating app...");
      clearAppCache();

      // Small delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("❌ Force update failed:", error);
      throw error;
    }
  };

  return {
    needsUpdate: versionState.needsUpdate,
    currentVersion: versionState.currentVersion,
    cachedVersion: versionState.cachedVersion,
    isChecking: versionState.isChecking,
    forceUpdate,
  };
}
