import { ref, onUnmounted } from 'vue'
import { SESSION, STORAGE_KEYS, FEATURE_FLAGS } from '@/utils/constants'
import { analytics, AnalyticsEvent } from '@/utils/analytics'

/**
 * Session and Memory Management Composable
 * Handles long-running session cleanup and memory management
 */
export function useSessionManagement() {
  const sessionStartTime = ref<number>(Date.now())
  const lastActivityTime = ref<number>(Date.now())
  const isSessionActive = ref(true)
  
  const cleanupIntervals: number[] = []
  const cleanupTimeouts: number[] = []
  
  // Enable debug logging when debug panel is enabled
  const DEBUG = FEATURE_FLAGS.ENABLE_DEBUG_PANEL

  /**
   * Initialize session
   */
  function initializeSession() {
    const storedSessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START)
    
    if (storedSessionStart) {
      const elapsed = Date.now() - Number(storedSessionStart)
      
      // Check if session has timed out
      if (elapsed > SESSION.TIMEOUT) {
        if (DEBUG) console.log('⏱️ Session timeout detected, starting new session')
        analytics.trackEvent(AnalyticsEvent.SESSION_TIMEOUT, { elapsed })
        resetSession()
      } else {
        sessionStartTime.value = Number(storedSessionStart)
        if (DEBUG) console.log(`🔄 Resuming session (${Math.floor(elapsed / 1000)}s elapsed)`)
      }
    } else {
      resetSession()
    }

    // Set up activity tracking
    trackUserActivity()
    
    // Set up periodic memory cleanup
    startMemoryCleanup()
    
    // Set up session timeout check
    startSessionTimeoutCheck()
  }

  /**
   * Reset session
   */
  function resetSession() {
    const now = Date.now()
    sessionStartTime.value = now
    lastActivityTime.value = now
    isSessionActive.value = true
    localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString())
    if (DEBUG) console.log('🆕 New session started')
  }

  /**
   * Track user activity to prevent premature timeouts
   */
  function trackUserActivity() {
    const updateActivity = () => {
      lastActivityTime.value = Date.now()
    }

    // Track various user interactions
    window.addEventListener('mousemove', updateActivity, { passive: true })
    window.addEventListener('keydown', updateActivity, { passive: true })
    window.addEventListener('scroll', updateActivity, { passive: true })
    window.addEventListener('click', updateActivity, { passive: true })
    window.addEventListener('touchstart', updateActivity, { passive: true })
  }

  /**
   * Start periodic memory cleanup
   */
  function startMemoryCleanup() {
    const cleanupInterval = window.setInterval(() => {
      performMemoryCleanup()
    }, SESSION.MEMORY_CLEANUP_INTERVAL)

    cleanupIntervals.push(cleanupInterval)
  }

  /**
   * Perform memory cleanup tasks
   */
  function performMemoryCleanup() {
    if (DEBUG) console.log('🧹 Performing memory cleanup...')

    // 1. Clear old analytics events (keep last 100)
    const queue = analytics.getEventQueue()
    if (queue.length > 100) {
      analytics.clearEventQueue()
      if (DEBUG) console.log(`  ✓ Cleared ${queue.length - 100} old analytics events`)
    }

    // 2. Clear expired localStorage items
    cleanExpiredLocalStorage()

    // 3. Force garbage collection hint (browsers may ignore this)
    if (window.gc) {
      window.gc()
      if (DEBUG) console.log('  ✓ Suggested garbage collection')
    }

    // 4. Log memory usage if available
    if (performance.memory) {
      const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      const limitMB = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      if (DEBUG) console.log(`  ℹ️ Memory usage: ${memoryMB}MB / ${limitMB}MB`)

      analytics.trackEvent(AnalyticsEvent.MEMORY_CLEANUP, {
        usedMB: memoryMB,
        limitMB,
        percentage: Math.round((memoryMB / limitMB) * 100),
      })
    }
  }

  /**
   * Clean expired localStorage items
   */
  function cleanExpiredLocalStorage() {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    let removedCount = 0

    keys.forEach((key) => {
      // Check for keys with expiry (format: key_expiry_timestamp)
      if (key.includes('_expiry_')) {
        const [, expiryStr] = key.split('_expiry_')
        const expiry = Number(expiryStr)
        
        if (!isNaN(expiry) && now > expiry) {
          localStorage.removeItem(key)
          removedCount++
        }
      }
    })

    if (removedCount > 0) {
      if (DEBUG) console.log(`  ✓ Removed ${removedCount} expired localStorage items`)
    }
  }

  /**
   * Check for session timeout
   */
  function startSessionTimeoutCheck() {
    const checkInterval = window.setInterval(() => {
      const inactiveDuration = Date.now() - lastActivityTime.value
      const sessionDuration = Date.now() - sessionStartTime.value

      // Check for inactivity timeout
      if (inactiveDuration > SESSION.TIMEOUT) {
        handleSessionTimeout()
      }

      // Warn if session is getting long (> 4 hours)
      if (sessionDuration > 14400000 && isSessionActive.value) {
        if (DEBUG) {
          console.warn(
            `⚠️ Long-running session detected (${Math.floor(sessionDuration / 3600000)}h). Consider refreshing the page.`,
          )
        }
      }
    }, 60000) // Check every minute

    cleanupIntervals.push(checkInterval)
  }

  /**
   * Handle session timeout
   */
  function handleSessionTimeout() {
    if (!isSessionActive.value) return

    isSessionActive.value = false
    if (DEBUG) console.log('⏱️ Session timed out due to inactivity')
    analytics.trackEvent(AnalyticsEvent.SESSION_TIMEOUT, {
      duration: Date.now() - sessionStartTime.value,
      inactiveDuration: Date.now() - lastActivityTime.value,
    })

    // Optional: Show a notification to user
    // Or automatically refresh the page
    // window.location.reload()
  }

  /**
   * Get session info
   */
  function getSessionInfo() {
    return {
      startTime: sessionStartTime.value,
      duration: Date.now() - sessionStartTime.value,
      lastActivity: lastActivityTime.value,
      inactiveDuration: Date.now() - lastActivityTime.value,
      isActive: isSessionActive.value,
    }
  }

  /**
   * Cleanup on component unmount
   */
  onUnmounted(() => {
    // Clear all intervals
    cleanupIntervals.forEach((interval) => window.clearInterval(interval))
    cleanupTimeouts.forEach((timeout) => window.clearTimeout(timeout))
    
    // Remove event listeners
    window.removeEventListener('mousemove', () => {})
    window.removeEventListener('keydown', () => {})
    window.removeEventListener('scroll', () => {})
    window.removeEventListener('click', () => {})
    window.removeEventListener('touchstart', () => {})

    if (DEBUG) console.log('🧹 Session management cleanup completed')
  })

  // Initialize on creation
  initializeSession()

  return {
    sessionStartTime,
    lastActivityTime,
    isSessionActive,
    getSessionInfo,
    performMemoryCleanup,
    resetSession,
  }
}

/**
 * Extend Window interface for memory APIs
 */
declare global {
  interface Window {
    gc?: () => void
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}
