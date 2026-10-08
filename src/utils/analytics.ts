import { MONITORING, FEATURE_FLAGS } from './constants'

/**
 * Analytics Event Types
 */
export const AnalyticsEvent = {
  // User Actions
  FILTER_APPLIED: 'filter_applied',
  FAVORITE_TOGGLED: 'favorite_toggled',
  SORT_CHANGED: 'sort_changed',
  SEARCH_PERFORMED: 'search_performed',
  LANGUAGE_CHANGED: 'language_changed',

  // System Events
  APP_MOUNTED: 'app_mounted',
  API_FETCH_SUCCESS: 'api_fetch_success',
  API_FETCH_ERROR: 'api_fetch_error',
  API_RETRY_ATTEMPTED: 'api_retry_attempted',
  VIRTUAL_SCROLL_ACTIVATED: 'virtual_scroll_activated',

  // Performance
  MEMORY_CLEANUP: 'memory_cleanup',
  SESSION_TIMEOUT: 'session_timeout',
  RACE_CONDITION_PREVENTED: 'race_condition_prevented',
} as const

export type AnalyticsEventType = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

/**
 * Analytics Event Data
 */
export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined
}

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
} as const

export type ErrorSeverityType = (typeof ErrorSeverity)[keyof typeof ErrorSeverity]

/**
 * Analytics Service
 * Handles event tracking and error monitoring
 */
class AnalyticsService {
  private isEnabled: boolean
  private sessionId: string
  private eventQueue: Array<{ event: string; data: AnalyticsEventData; timestamp: number }> = []

  constructor() {
    this.isEnabled = FEATURE_FLAGS.ENABLE_ANALYTICS
    this.sessionId = this.generateSessionId()

    if (this.isEnabled) {
      this.initializeSentry()
      this.startSession()
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Initialize Sentry for error monitoring
   */
  private async initializeSentry(): Promise<void> {
    if (!MONITORING.SENTRY_DSN) {
      console.warn('Sentry DSN not configured. Error monitoring disabled.')
      return
    }

    try {
      // Note: Sentry is optional. Install with: npm install @sentry/vue
      // For this demo, we'll just log that it's configured
      console.log('📊 Analytics monitoring configured (Sentry DSN present)')
      
      // In production, you would initialize Sentry here:
      // const Sentry = await import('@sentry/vue')
      // Sentry.init({ ... })
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }

  /**
   * Start analytics session
   */
  private startSession(): void {
    this.trackEvent(AnalyticsEvent.APP_MOUNTED, {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    })
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEventType | string, data?: AnalyticsEventData): void {
    if (!this.isEnabled) return

    const eventData = {
      event,
      data: {
        ...data,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
    }

    this.eventQueue.push(eventData)

    // Log to console when debug panel is enabled
    if (FEATURE_FLAGS.ENABLE_DEBUG_PANEL) {
      console.log(`📊 Analytics:`, event, data)
    }

    // In production, you would send this to your analytics backend
    // Example: this.sendToAnalytics(eventData)
  }

  /**
   * Track an error
   */
  trackError(
    error: Error | string,
    severity: ErrorSeverityType = ErrorSeverity.ERROR,
    context?: Record<string, unknown>,
  ): void {
    if (!this.isEnabled) return

    const errorData = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      severity,
      context,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
    }

    // Log to console
    console.error(`🔴 Error [${severity}]:`, errorData)

    // In production, send to Sentry or your error monitoring service
    // Example with Sentry:
    // if (error instanceof Error && window.Sentry) {
    //   window.Sentry.captureException(error, { level: severity })
    // }

    // Track as analytics event
    this.trackEvent(AnalyticsEvent.API_FETCH_ERROR, {
      error: errorData.message,
      severity,
    })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit = 'ms'): void {
    if (!this.isEnabled) return

    this.trackEvent(`performance_${metric}`, {
      value,
      unit,
    })

    if (FEATURE_FLAGS.ENABLE_DEBUG_PANEL) {
      console.log(`⚡ Performance: ${metric} = ${value}${unit}`)
    }
  }

  /**
   * Get queued events (for debugging)
   */
  getEventQueue(): typeof this.eventQueue {
    return this.eventQueue
  }

  /**
   * Clear event queue
   */
  clearEventQueue(): void {
    this.eventQueue = []
  }

  /**
   * Set user properties (for analytics)
   */
  setUserProperties(properties: Record<string, string | number | boolean>): void {
    if (!this.isEnabled) return

    // In production, send to your analytics service
    // Example with Sentry:
    // if (window.Sentry) {
    //   window.Sentry.setUser({ id: this.sessionId, ...properties })
    // }

    if (FEATURE_FLAGS.ENABLE_DEBUG_PANEL) {
      console.log('👤 User properties set:', properties)
    }
  }
}

/**
 * Singleton instance
 */
export const analytics = new AnalyticsService()
