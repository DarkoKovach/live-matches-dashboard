/**
 * Environment-based Configuration
 * All values can be overridden via .env file
 */

/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.235.235.11'
export const API_ENDPOINTS = {
  MATCHES: import.meta.env.VITE_API_MATCHES_ENDPOINT || '/api/matches',
} as const

/**
 * API Username (required header)
 */
export const API_USERNAME = import.meta.env.VITE_API_USERNAME || ''

/**
 * Use the built-in simulated feed instead of the real API.
 * Enabled with VITE_USE_MOCK_DATA=true (used by the public GitHub Pages demo,
 * where the HTTP-only assignment API can't be called from an HTTPS page).
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

/**
 * Polling Configuration
 */
export const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 10000
export const MAX_RETRY_ATTEMPTS = Number(import.meta.env.VITE_POLLING_MAX_RETRIES) || 5
export const INITIAL_RETRY_DELAY = Number(import.meta.env.VITE_POLLING_RETRY_BASE_DELAY) || 1000
export const MAX_RETRY_DELAY = Number(import.meta.env.VITE_POLLING_RETRY_MAX_DELAY) || 16000

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_PANEL: import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true' || import.meta.env.DEV,
  ENABLE_VIRTUAL_SCROLL: import.meta.env.VITE_ENABLE_VIRTUAL_SCROLL !== 'false',
} as const

/**
 * Performance Monitoring
 */
export const MONITORING = {
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  SENTRY_TRACES_SAMPLE_RATE: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0.1,
} as const

/**
 * Session Management
 */
export const SESSION = {
  TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 1 hour
  MEMORY_CLEANUP_INTERVAL: Number(import.meta.env.VITE_MEMORY_CLEANUP_INTERVAL) || 300000, // 5 minutes
} as const

/**
 * Animation duration for new/removed matches in milliseconds
 */
export const MATCH_ANIMATION_DURATION = 1000

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  FAVORITES: 'lmd_favorite_matches',
  THEME: 'lmd_theme',
  SESSION_START: 'lmd_session_start',
} as const
