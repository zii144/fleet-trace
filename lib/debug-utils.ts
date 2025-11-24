/**
 * Debug utility for version and cache management
 */

import { checkAppVersion, clearAppCache, APP_VERSION } from './version-check'

declare global {
  interface Window {
    fleetTraceDebug: {
      version: string
      checkVersion: () => void
      clearCache: () => void
      showCacheInfo: () => void
    }
  }
}

/**
 * Initialize debug utilities in development
 */
export function initDebugUtils() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.fleetTraceDebug = {
      version: APP_VERSION,
      checkVersion: () => {
        const result = checkAppVersion()
        console.log('🔍 Version Check Result:', result)
        return result
      },
      clearCache: () => {
        clearAppCache()
        console.log('🧹 Cache cleared manually')
      },
      showCacheInfo: () => {
        const cacheInfo = {
          localStorage: Object.keys(localStorage).filter(key => 
            key.startsWith('fleet-trace') || key.includes('firebase')
          ),
          sessionStorage: Object.keys(sessionStorage),
          version: localStorage.getItem('fleet-trace-app-version'),
          dismissedUpdates: localStorage.getItem('dismissed-updates')
        }
        console.log('📋 Cache Info:', cacheInfo)
        return cacheInfo
      }
    }
    
    console.log('🛠️ Debug utilities available at window.fleetTraceDebug')
    console.log('   - version: Current app version')
    console.log('   - checkVersion(): Check version status')
    console.log('   - clearCache(): Clear all app cache')
    console.log('   - showCacheInfo(): Show cache information')
  }
}
