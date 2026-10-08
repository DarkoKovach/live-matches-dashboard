import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'
import type { Match, MatchFilters } from '@/types/match'
import { fetchMatches } from '@/utils/api'
import { analytics, AnalyticsEvent } from '@/utils/analytics'

/**
 * Matches Store
 * Manages the state of all matches, including fetching, filtering, and favorites
 */
export const useMatchesStore = defineStore('matches', () => {
  // Use global i18n instance instead of useI18n() composable
  // (Pinia stores don't have Vue component setup context)
  const { t } = i18n.global

  // State
  const matches = ref<Match[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTime = ref<Date | null>(null)
  const newMatchIds = ref<Set<string | number>>(new Set())
  const removedMatchIds = ref<Set<string | number>>(new Set())
  const favoriteMatchIds = ref<Set<string | number>>(new Set())

  // Race condition prevention
  const lastProcessedRequestId = ref(0)

  // Track consecutive failures for better error handling
  const consecutiveFailures = ref(0)
  const MAX_FAILURES_BEFORE_ERROR = 5

  // Filters
  const filters = ref<MatchFilters>({
    searchQuery: '',
    selectedSport: null,
    selectedLeagues: [],
    selectedStatuses: [],
    sortBy: 'time',
    showOnlyFavorites: false,
  })

  // Computed
  /**
   * Get unique sports from all matches
   */
  const availableSports = computed(() => {
    const sports = new Set(matches.value.map(m => m.sport).filter(Boolean))
    return Array.from(sports).sort()
  })

  /**
   * Get unique leagues from all matches
   * If a sport is selected, only show leagues for that sport
   */
  const availableLeagues = computed(() => {
    let matchesToConsider = matches.value
    
    // Filter by selected sport first
    if (filters.value.selectedSport) {
      matchesToConsider = matchesToConsider.filter(m => m.sport === filters.value.selectedSport)
    }
    
    const leagues = new Set(matchesToConsider.map(m => m.league))
    return Array.from(leagues).sort()
  })

  /**
   * Get filtered and sorted matches based on current filters
   */
  const filteredMatches = computed(() => {
    let result = [...matches.value]

    // Filter by selected sport
    if (filters.value.selectedSport) {
      result = result.filter(m => m.sport === filters.value.selectedSport)
    }

    // Filter by search query (team names)
    if (filters.value.searchQuery.trim()) {
      const query = filters.value.searchQuery.toLowerCase()
      result = result.filter(m =>
        m.homeTeam.toLowerCase().includes(query) ||
        m.awayTeam.toLowerCase().includes(query)
      )
    }

    // Filter by selected leagues
    if (filters.value.selectedLeagues.length > 0) {
      result = result.filter(m =>
        filters.value.selectedLeagues.includes(m.league)
      )
    }

    // Filter by selected statuses
    if (filters.value.selectedStatuses.length > 0) {
      result = result.filter(m =>
        filters.value.selectedStatuses.includes(m.status)
      )
    }

    // Filter by favorites
    if (filters.value.showOnlyFavorites) {
      result = result.filter(m => favoriteMatchIds.value.has(m.id))
    }

    // Sort matches
    result.sort((a, b) => {
      switch (filters.value.sortBy) {
        case 'team':
          return a.homeTeam.localeCompare(b.homeTeam)
        case 'league':
          return a.league.localeCompare(b.league)
        case 'score': {
          if (!a.score || !b.score) return 0
          const totalA = a.score.home + a.score.away
          const totalB = b.score.home + b.score.away
          return totalB - totalA
        }
        case 'time':
        default:
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
    })

    return result
  })

  /**
   * Check if a match is marked as favorite
   */
  const isFavorite = computed(() => (matchId: string | number) => {
    return favoriteMatchIds.value.has(matchId)
  })

  /**
   * Check if a match is new (just added)
   */
  const isNew = computed(() => (matchId: string | number) => {
    return newMatchIds.value.has(matchId)
  })

  /**
   * Check if a match is being removed
   */
  const isRemoved = computed(() => (matchId: string | number) => {
    return removedMatchIds.value.has(matchId)
  })

  // Actions
  /**
   * Fetch matches from API and detect changes
   * Only shows error after 5 consecutive failures
   */
  async function loadMatches() {
    isLoading.value = true

    try {
      const { matches: newMatches, requestId } = await fetchMatches()

      // **Race Condition Prevention**
      // Ignore responses from older requests
      if (requestId <= lastProcessedRequestId.value) {
        console.warn(
          `🔄 Ignoring outdated API response (ID: ${requestId}, latest: ${lastProcessedRequestId.value})`,
        )
        analytics.trackEvent(AnalyticsEvent.RACE_CONDITION_PREVENTED, {
          receivedRequestId: requestId,
          expectedRequestId: lastProcessedRequestId.value,
        })
        return
      }

      // Update last processed request ID
      lastProcessedRequestId.value = requestId

      // If we got data, reset consecutive failures and clear error
      if (newMatches.length > 0) {
        consecutiveFailures.value = 0
        error.value = null

        analytics.trackEvent(AnalyticsEvent.API_FETCH_SUCCESS, {
          matchCount: newMatches.length,
          requestId,
        })
        
        // Get the current state BEFORE any updates
        const oldMatches = [...matches.value]
        const oldIds = new Set(oldMatches.map(m => m.id))
        const newIds = new Set(newMatches.map(m => m.id))
        
        // 1. Find NEW matches (in new response but NOT in old)
        const addedMatches = newMatches.filter(m => !oldIds.has(m.id))
        
        // 2. Find REMOVED matches (in old but NOT in new response)
        const removedMatches = oldMatches.filter(m => !newIds.has(m.id))
        
        // 3. Find UNCHANGED matches (in both old and new)
        const unchangedMatches = newMatches.filter(m => oldIds.has(m.id))
        
        // Clear previous animation states
        newMatchIds.value.clear()
        removedMatchIds.value.clear()
        
        // Mark NEW matches for animation (skip on first load to avoid animating everything)
        if (oldMatches.length > 0) {
          addedMatches.forEach(match => {
            newMatchIds.value.add(match.id)
          })
          
          // Mark REMOVED matches for animation
          removedMatches.forEach(match => {
            removedMatchIds.value.add(match.id)
          })
        }
        
        // If we have removed matches, show them temporarily with the new matches
        if (removedMatches.length > 0) {
          // IMMEDIATELY show combined array: unchanged + new + removed
          matches.value = [
            ...unchangedMatches,  // Matches that exist in both (updated data from new response)
            ...addedMatches,      // New matches (will show green animation)
            ...removedMatches,    // Old matches being removed (will show red animation)
          ]
          
          // After 1 second, remove the old matches
          setTimeout(() => {
            // Only remove if these IDs are still in the removedMatchIds set
            const idsToRemove = new Set(removedMatches.map(m => m.id))
            matches.value = matches.value.filter(m => !idsToRemove.has(m.id))
            
            // Clear animation markers
            addedMatches.forEach(match => {
              newMatchIds.value.delete(match.id)
            })
            
            removedMatches.forEach(match => {
              removedMatchIds.value.delete(match.id)
            })
          }, 1000)
        } else {
          // No removed matches, just update directly
          matches.value = newMatches
          
          // Clear new match animations after 1 second
          if (addedMatches.length > 0) {
            setTimeout(() => {
              addedMatches.forEach(match => {
                newMatchIds.value.delete(match.id)
              })
            }, 1000)
          }
        }
        
      } else {
        // Empty response - increment failures
        consecutiveFailures.value++
        
        // Only show error after MAX_FAILURES_BEFORE_ERROR consecutive empty responses
        if (consecutiveFailures.value >= MAX_FAILURES_BEFORE_ERROR) {
          error.value = t('states.noMatchesAvailable')
          // If we have no matches at all, clear them
          if (matches.value.length === 0) {
            matches.value = []
          }
        }
        // Don't update matches if we have existing data and haven't hit the threshold
      }
      
      lastFetchTime.value = new Date()
    } catch (err) {
      consecutiveFailures.value++
      console.error('Error loading matches:', err)
      
      // Only show error after MAX_FAILURES_BEFORE_ERROR attempts
      if (consecutiveFailures.value >= MAX_FAILURES_BEFORE_ERROR) {
        error.value = err instanceof Error ? err.message : t('states.fetchError')
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle favorite status of a match
   */
  function toggleFavorite(matchId: string | number) {
    const isFavorite = favoriteMatchIds.value.has(matchId)
    
    if (isFavorite) {
      favoriteMatchIds.value.delete(matchId)
    } else {
      favoriteMatchIds.value.add(matchId)
    }
    
    // Track analytics
    analytics.trackEvent(AnalyticsEvent.FAVORITE_TOGGLED, {
      matchId: String(matchId),
      isFavorite: !isFavorite, // New state
      totalFavorites: favoriteMatchIds.value.size,
    })
    
    // Persist to localStorage
    saveFavoritesToStorage()
  }

  /**
   * Save favorites to localStorage
   */
  function saveFavoritesToStorage() {
    const favoritesArray = Array.from(favoriteMatchIds.value)
    localStorage.setItem('lmd_favorite_matches', JSON.stringify(favoritesArray))
  }

  /**
   * Load favorites from localStorage
   */
  function loadFavoritesFromStorage() {
    const stored = localStorage.getItem('lmd_favorite_matches')
    if (stored) {
      try {
        const favoritesArray = JSON.parse(stored)
        favoriteMatchIds.value = new Set(favoritesArray)
      } catch (err) {
        console.error('Failed to load favorites from storage:', err)
      }
    }
  }

  /**
   * Update filter settings
   */
  function updateFilters(newFilters: Partial<MatchFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    
    // Track analytics for each filter type
    if (newFilters.selectedSport !== undefined) {
      analytics.trackEvent(AnalyticsEvent.FILTER_APPLIED, {
        filterType: 'sport',
        value: newFilters.selectedSport || 'all',
      })
    }
    
    if (newFilters.selectedLeagues !== undefined) {
      analytics.trackEvent(AnalyticsEvent.FILTER_APPLIED, {
        filterType: 'leagues',
        count: newFilters.selectedLeagues.length,
        leagues: newFilters.selectedLeagues.join(', '),
      })
    }
    
    if (newFilters.showOnlyFavorites !== undefined) {
      analytics.trackEvent(AnalyticsEvent.FILTER_APPLIED, {
        filterType: 'favorites',
        enabled: newFilters.showOnlyFavorites,
      })
    }
    
    if (newFilters.sortBy !== undefined) {
      analytics.trackEvent(AnalyticsEvent.SORT_CHANGED, {
        sortBy: newFilters.sortBy,
      })
    }
    
    if (newFilters.searchQuery !== undefined && newFilters.searchQuery.trim()) {
      analytics.trackEvent(AnalyticsEvent.SEARCH_PERFORMED, {
        query: newFilters.searchQuery,
        queryLength: newFilters.searchQuery.length,
      })
    }
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    filters.value = {
      searchQuery: '',
      selectedSport: null,
      selectedLeagues: [],
      selectedStatuses: [],
      sortBy: 'time',
      showOnlyFavorites: false,
    }
  }

  // Initialize favorites from storage
  loadFavoritesFromStorage()

  return {
    // State
    matches,
    isLoading,
    error,
    lastFetchTime,
    filters,
    favoriteMatchIds,
    
    // Computed
    filteredMatches,
    availableSports,
    availableLeagues,
    isFavorite,
    isNew,
    isRemoved,
    
    // Actions
    loadMatches,
    toggleFavorite,
    updateFilters,
    resetFilters,
  }
})
