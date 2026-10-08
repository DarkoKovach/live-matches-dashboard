/**
 * Match status enum
 */
export type MatchStatus = 'live' | 'upcoming' | 'finished'

/**
 * Score interface for a match
 */
export interface Score {
  home: number
  away: number
}

/**
 * Main Match interface
 * Represents a single sports match from the API
 */
export interface Match {
  id: string | number
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  score?: Score // Keep for backward compatibility
  league: string
  startTime: string
  matchTime?: string // API field name
  time?: string // Current match minute for live matches (e.g., "45'", "90+2'")
  status: MatchStatus
  sport?: string
  venue?: string
  // Additional fields that might come from the API
  [key: string]: unknown
}

/**
 * API Response wrapper
 */
export interface MatchesApiResponse {
  matches: Match[]
  timestamp?: string
  // Add other response fields as discovered from API
}

/**
 * Match with animation state
 * Used internally to track new/removed matches for animations
 */
export interface MatchWithAnimationState extends Match {
  isNew?: boolean
  isRemoved?: boolean
  animationKey?: string
}

/**
 * Filter options for matches
 */
export interface MatchFilters {
  searchQuery: string
  selectedSport: string | null // null means "all sports"
  selectedLeagues: string[]
  selectedStatuses: MatchStatus[] // Filter by match status
  sortBy: 'time' | 'team' | 'league' | 'score'
  showOnlyFavorites: boolean
}

/**
 * Sort function type
 */
export type MatchSortFn = (a: Match, b: Match) => number
