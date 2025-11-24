/**
 * Version Check Service
 * Handles app version checking and cache invalidation
 */

export const APP_VERSION = "0.1.0-alpha"; // Current version - Alpha release
export const VERSION_STORAGE_KEY = "fleet-trace-app-version";
export const RETURNING_USER_KEY = "fleet-trace-returning-user";
export const CACHE_KEYS = [
  "fleet-trace-user-info",
  "fleet-trace-questionnaires",
  "fleet-trace-user-preferences",
  "firebase-auth-user",
  "fleet_trace_session_config",
  "fleet_trace_pending_verification",
  "fleet_trace_auth_state",
  "fleet_trace_user_data",
  "fleet-trace-route-completion",
  "fleet-trace-route-submission",
  "fleet-trace-user-stats",
  "fleet-trace-qualification-status",
  "auth_user",
  "admin-active-tab",
  "promo-modal-dismissed",
  "promotion-cover-dismissed",
  "dismissed-updates",
];

/**
 * Check if the user is a returning user (has visited before)
 */
export function isReturningUser(): boolean {
  try {
    const isReturning = localStorage.getItem(RETURNING_USER_KEY) === "true";
    return isReturning;
  } catch (error) {
    console.warn("⚠️ Returning user check failed:", error);
    return false;
  }
}

/**
 * Mark the user as a returning user
 */
export function markAsReturningUser(): void {
  try {
    localStorage.setItem(RETURNING_USER_KEY, "true");
    console.log("✅ User marked as returning user");
  } catch (error) {
    console.warn("⚠️ Failed to mark user as returning:", error);
  }
}

/**
 * Check if the app version has changed and cache needs to be cleared
 */
export function checkAppVersion(): {
  needsUpdate: boolean;
  currentVersion: string;
  cachedVersion: string | null;
} {
  try {
    const cachedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    const currentVersion = APP_VERSION;

    console.log("🔍 Version Check:", {
      current: currentVersion,
      cached: cachedVersion,
      needsUpdate: cachedVersion !== currentVersion && cachedVersion !== null,
    });

    // Only needs update if there's a cached version that differs from current
    // New users (cachedVersion === null) don't need updates
    return {
      needsUpdate: cachedVersion !== null && cachedVersion !== currentVersion,
      currentVersion,
      cachedVersion,
    };
  } catch (error) {
    console.warn("⚠️ Version check failed:", error);
    return {
      needsUpdate: false,
      currentVersion: APP_VERSION,
      cachedVersion: null,
    };
  }
}

/**
 * Clear all app caches and update version
 */
export function clearAppCache(): void {
  try {
    console.log(
      "🧹 Starting comprehensive app cache clearing for version upgrade..."
    );

    // Clear localStorage cache keys
    CACHE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared localStorage: ${key}`);
    });

    // Clear sessionStorage completely
    sessionStorage.clear();
    console.log("🗑️ Cleared sessionStorage completely");

    // Clear any IndexedDB cache (Firebase might use this)
    if ("indexedDB" in window) {
      // Clear IndexedDB databases that might contain cached data
      const clearIndexedDB = async () => {
        try {
          const databases = await window.indexedDB.databases();
          for (const db of databases) {
            if (
              db.name &&
              (db.name.includes("firebase") ||
                db.name.includes("fleet") ||
                db.name.includes("cache"))
            ) {
              console.log(`🗑️ Clearing IndexedDB: ${db.name}`);
              const deleteRequest = window.indexedDB.deleteDatabase(db.name);
              deleteRequest.onsuccess = () =>
                console.log(`✅ IndexedDB cleared: ${db.name}`);
              deleteRequest.onerror = () =>
                console.warn(`⚠️ Failed to clear IndexedDB: ${db.name}`);
            }
          }
        } catch (error) {
          console.warn("⚠️ IndexedDB cleanup failed:", error);
        }
      };
      clearIndexedDB();
    }

    // Clear cookies (if any are set)
    if (document.cookie) {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (
          name &&
          (name.includes("fleet") ||
            name.includes("firebase") ||
            name.includes("auth"))
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          console.log(`🗑️ Cleared cookie: ${name}`);
        }
      });
    }

    // Clear any service worker caches
    if ("serviceWorker" in navigator && "caches" in window) {
      caches
        .keys()
        .then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (
              cacheName.includes("fleet") ||
              cacheName.includes("firebase") ||
              cacheName.includes("cache")
            ) {
              caches
                .delete(cacheName)
                .then(() => {
                  console.log(`🗑️ Cleared service worker cache: ${cacheName}`);
                })
                .catch((error) => {
                  console.warn(`⚠️ Failed to clear cache: ${cacheName}`, error);
                });
            }
          });
        })
        .catch((error) => {
          console.warn("⚠️ Service worker cache cleanup failed:", error);
        });
    }

    // Force logout from Firebase Auth if available
    if (typeof window !== "undefined" && (window as any).firebase) {
      try {
        const auth = (window as any).firebase.auth();
        if (auth && auth.currentUser) {
          auth
            .signOut()
            .then(() => {
              console.log("🔐 Firebase user signed out during upgrade");
            })
            .catch((error: unknown) => {
              console.warn("⚠️ Firebase signout failed:", error);
            });
        }
      } catch (error: unknown) {
        console.warn("⚠️ Firebase auth cleanup failed:", error);
      }
    }

    // Update version in storage
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

    // Mark user as returning after successful upgrade
    markAsReturningUser();

    console.log(
      "✅ Comprehensive app cache cleared successfully for version upgrade"
    );
    console.log(
      "🔄 All session tokens, storage, and cached data have been cleared"
    );
  } catch (error) {
    console.error("❌ Failed to clear app cache:", error);
  }
}

/**
 * Mark current version as acknowledged (user chose not to update)
 */
export function acknowledgeCurrentVersion(): void {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    console.log("✅ Current version acknowledged");
  } catch (error) {
    console.error("❌ Failed to acknowledge version:", error);
  }
}

/**
 * Check if user has dismissed update for current version
 */
export function hasUserDismissedUpdate(): boolean {
  try {
    const dismissedVersions = JSON.parse(
      localStorage.getItem("dismissed-updates") || "[]"
    );
    return dismissedVersions.includes(APP_VERSION);
  } catch {
    return false;
  }
}

/**
 * Mark current version as dismissed
 */
export function dismissUpdate(): void {
  try {
    const dismissedVersions = JSON.parse(
      localStorage.getItem("dismissed-updates") || "[]"
    );
    if (!dismissedVersions.includes(APP_VERSION)) {
      dismissedVersions.push(APP_VERSION);
      localStorage.setItem(
        "dismissed-updates",
        JSON.stringify(dismissedVersions)
      );
    }
    console.log("✅ Update dismissed for version:", APP_VERSION);
  } catch (error) {
    console.error("❌ Failed to dismiss update:", error);
  }
}

/**
 * Comprehensive upgrade utility that clears all possible storage mechanisms
 * Use this function when performing version upgrades to ensure clean state
 */
export async function performComprehensiveUpgrade(): Promise<void> {
  try {
    console.log("🚀 Starting comprehensive app upgrade process...");

    // Clear all app caches
    clearAppCache();

    // Additional Firebase-specific cleanup
    await clearFirebaseCaches();

    // Clear any remaining localStorage items that might contain app data
    clearRemainingAppData();

    console.log("✅ Comprehensive upgrade completed successfully");
    console.log(
      "🔄 All session tokens, storage, and cached data have been cleared"
    );

    // Update version in storage
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
  } catch (error) {
    console.error("❌ Comprehensive upgrade failed:", error);
    throw error;
  }
}

/**
 * Clear Firebase-specific caches and storage
 */
async function clearFirebaseCaches(): Promise<void> {
  try {
    console.log("🔥 Clearing Firebase-specific caches...");

    // Clear Firebase Auth persistence
    if (typeof window !== "undefined" && (window as any).firebase) {
      try {
        const auth = (window as any).firebase.auth();
        if (auth) {
          // Set persistence to none temporarily to clear any cached auth state
          await auth.setPersistence("none");
          console.log("🔐 Firebase Auth persistence cleared");
        }
      } catch (error: unknown) {
        console.warn("⚠️ Firebase Auth persistence cleanup failed:", error);
      }
    }

    // Clear any Firebase Storage cache
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      const firebaseCaches = cacheNames.filter(
        (name) =>
          name.includes("firebase") ||
          name.includes("firestore") ||
          name.includes("storage")
      );

      for (const cacheName of firebaseCaches) {
        await caches.delete(cacheName);
        console.log(`🗑️ Cleared Firebase cache: ${cacheName}`);
      }
    }

    console.log("✅ Firebase caches cleared");
  } catch (error: unknown) {
    console.warn("⚠️ Firebase cache cleanup failed:", error);
  }
}

/**
 * Clear any remaining app data that might not be in the standard cache keys
 */
function clearRemainingAppData(): void {
  try {
    console.log("🧹 Clearing remaining app data...");

    // Get all localStorage keys and clear any that might contain app data
    const allKeys = Object.keys(localStorage);
    const appKeys = allKeys.filter(
      (key) =>
        key.includes("fleet") ||
        key.includes("trace") ||
        key.includes("auth") ||
        key.includes("user") ||
        key.includes("session") ||
        key.includes("cache") ||
        key.includes("firebase") ||
        key.includes("firestore")
    );

    appKeys.forEach((key) => {
      if (!CACHE_KEYS.includes(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared additional app data: ${key}`);
      }
    });

    console.log("✅ Remaining app data cleared");
  } catch (error: unknown) {
    console.warn("⚠️ Remaining app data cleanup failed:", error);
  }
}
