"use client";

import { useEffect } from "react";
import { initDebugUtils } from "@/lib/debug-utils";

/**
 * Client component to initialize debug utilities in development mode
 * This replaces the problematic dynamic import in the layout script tag
 */
export function DebugUtilsInitializer() {
  useEffect(() => {
    // Only initialize in development mode
    if (process.env.NODE_ENV === "development") {
      try {
        initDebugUtils();
      } catch (error) {
        console.warn("⚠️ Failed to initialize debug utilities:", error);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}

