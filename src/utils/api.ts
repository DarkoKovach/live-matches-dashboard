import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_USERNAME,
  MAX_RETRY_ATTEMPTS,
  INITIAL_RETRY_DELAY,
  MAX_RETRY_DELAY,
} from './constants'
import type { Match, MatchesApiResponse } from '@/types/match'

/**
 * Request ID counter for race condition prevention
 * Ensures we only process the most recent API response
 */
let requestIdCounter = 0

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode?: number
  endpoint?: string

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.endpoint = endpoint
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch with retry logic and exponential backoff
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryCount - Current retry attempt number
 * @returns Promise with the response
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'username': API_USERNAME,
        ...options.headers,
      },
    })

    // Handle HTTP errors
    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        url,
      )
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    // If we've exhausted retries, throw the error
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.error(`Failed to fetch after ${MAX_RETRY_ATTEMPTS} attempts:`, error)
      throw error
    }

    // Calculate exponential backoff delay with max cap
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY)
    console.warn(`Fetch failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`)
    
    await sleep(delay)
    return fetchWithRetry<T>(url, options, retryCount + 1)
  }
}

/**
 * Fetch all matches from the API with race condition protection
 * 
 * @returns Promise with array of matches and request ID
 */
export async function fetchMatches(): Promise<{ matches: Match[]; requestId: number }> {
  // Generate unique request ID to prevent race conditions
  const currentRequestId = ++requestIdCounter

  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MATCHES}`
    const response = await fetchWithRetry<MatchesApiResponse | Match[]>(url)

    // Handle both response formats: {matches: [...]} or [...]
    let matches: Match[] = []

    if (Array.isArray(response)) {
      matches = response
    } else if ('matches' in response && Array.isArray(response.matches)) {
      matches = response.matches
    } else {
      console.error('Unexpected API response format:', response)
      return { matches: [], requestId: currentRequestId }
    }

    // Transform API response to match our interface
    const transformedMatches = matches.map((match) => ({
      ...match,
      // Map matchTime to startTime for consistency
      startTime: match.matchTime || match.startTime || '',
      // Create score object from individual fields for backward compatibility
      score:
        match.homeScore !== undefined && match.awayScore !== undefined
          ? { home: match.homeScore, away: match.awayScore }
          : match.score,
    }))

    return { matches: transformedMatches, requestId: currentRequestId }
  } catch (error) {
    console.error('Error fetching matches:', error)

    // Return empty array instead of throwing to allow graceful degradation
    // The UI will show an error state
    return { matches: [], requestId: currentRequestId }
  }
}

/**
 * Validate if a match object has required fields
 * 
 * @param match - Match object to validate
 * @returns true if valid, false otherwise
 */
export function isValidMatch(match: unknown): match is Match {
  if (!match || typeof match !== 'object') return false
  
  const m = match as Partial<Match>
  return Boolean(
    (m.id !== undefined && m.id !== null) &&
    m.homeTeam &&
    m.awayTeam &&
    m.league &&
    m.startTime
  )
}

/**
 * Filter out invalid matches from API response
 * 
 * @param matches - Array of matches from API
 * @returns Array of valid matches
 */
export function sanitizeMatches(matches: unknown[]): Match[] {
  return matches.filter(isValidMatch)
}
