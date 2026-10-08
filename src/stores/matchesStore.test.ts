import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMatchesStore } from './matchesStore'
import type { Match } from '@/types/match'

// Mock API
vi.mock('@/utils/api', () => ({
  fetchMatches: vi.fn(),
}))

describe('Matches Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useMatchesStore()

    expect(store.matches).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.filters.searchQuery).toBe('')
    expect(store.filters.showOnlyFavorites).toBe(false)
  })

  it('should toggle favorite', () => {
    const store = useMatchesStore()

    store.toggleFavorite(1)
    expect(store.isFavorite(1)).toBe(true)

    store.toggleFavorite(1)
    expect(store.isFavorite(1)).toBe(false)
  })

  it('should update filters', () => {
    const store = useMatchesStore()

    store.updateFilters({ searchQuery: 'Arsenal' })
    expect(store.filters.searchQuery).toBe('Arsenal')

    store.updateFilters({ showOnlyFavorites: true })
    expect(store.filters.showOnlyFavorites).toBe(true)
  })

  it('should reset filters', () => {
    const store = useMatchesStore()

    store.updateFilters({
      searchQuery: 'Test',
      showOnlyFavorites: true,
      selectedSport: 'football',
    })

    store.resetFilters()

    expect(store.filters.searchQuery).toBe('')
    expect(store.filters.showOnlyFavorites).toBe(false)
    expect(store.filters.selectedSport).toBeNull()
  })

  it('should filter matches by search query', () => {
    const store = useMatchesStore()

    store.matches = [
      {
        id: 1,
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        startTime: '2024-01-01',
        status: 'live',
        league: 'Premier League',
        sport: 'football',
      },
      {
        id: 2,
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        startTime: '2024-01-01',
        status: 'live',
        league: 'La Liga',
        sport: 'football',
      },
    ] as Match[]

    store.updateFilters({ searchQuery: 'Arsenal' })

    expect(store.filteredMatches).toHaveLength(1)
    expect(store.filteredMatches[0]?.homeTeam).toBe('Arsenal')
  })

  it('should filter matches by sport', () => {
    const store = useMatchesStore()

    store.matches = [
      {
        id: 1,
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        startTime: '2024-01-01',
        status: 'live',
        league: 'Premier League',
        sport: 'football',
      },
      {
        id: 2,
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        startTime: '2024-01-01',
        status: 'live',
        league: 'NBA',
        sport: 'basketball',
      },
    ] as Match[]

    store.updateFilters({ selectedSport: 'football' })

    expect(store.filteredMatches).toHaveLength(1)
    expect(store.filteredMatches[0]?.sport).toBe('football')
  })

  it('should filter matches by favorites', () => {
    const store = useMatchesStore()

    store.matches = [
      { id: 1, homeTeam: 'Team A', awayTeam: 'Team B', startTime: '2024-01-01', status: 'live', league: 'League', sport: 'football' },
      { id: 2, homeTeam: 'Team C', awayTeam: 'Team D', startTime: '2024-01-01', status: 'live', league: 'League', sport: 'football' },
    ] as Match[]

    store.toggleFavorite(1)
    store.updateFilters({ showOnlyFavorites: true })

    expect(store.filteredMatches).toHaveLength(1)
    expect(store.filteredMatches[0]?.id).toBe(1)
  })

  it('should get available sports', () => {
    const store = useMatchesStore()

    store.matches = [
      { id: 1, sport: 'football', homeTeam: 'A', awayTeam: 'B', startTime: '2024-01-01', status: 'live', league: 'L' },
      { id: 2, sport: 'basketball', homeTeam: 'C', awayTeam: 'D', startTime: '2024-01-01', status: 'live', league: 'L' },
      { id: 3, sport: 'football', homeTeam: 'E', awayTeam: 'F', startTime: '2024-01-01', status: 'live', league: 'L' },
    ] as Match[]

    const sports = store.availableSports
    expect(sports).toHaveLength(2)
    expect(sports).toContain('football')
    expect(sports).toContain('basketball')
  })

  it('should get available leagues filtered by sport', () => {
    const store = useMatchesStore()

    store.matches = [
      { id: 1, sport: 'football', league: 'Premier League', homeTeam: 'A', awayTeam: 'B', startTime: '2024-01-01', status: 'live' },
      { id: 2, sport: 'football', league: 'La Liga', homeTeam: 'C', awayTeam: 'D', startTime: '2024-01-01', status: 'live' },
      { id: 3, sport: 'basketball', league: 'NBA', homeTeam: 'E', awayTeam: 'F', startTime: '2024-01-01', status: 'live' },
    ] as Match[]

    store.updateFilters({ selectedSport: 'football' })

    const leagues = store.availableLeagues
    expect(leagues).toHaveLength(2)
    expect(leagues).toContain('Premier League')
    expect(leagues).toContain('La Liga')
    expect(leagues).not.toContain('NBA')
  })
})
