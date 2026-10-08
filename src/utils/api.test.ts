import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchMatches } from './api'

// Mock fetch globally with proper typing
const mockFetch = vi.fn()
globalThis.fetch = mockFetch as unknown as typeof fetch

describe('API Utils', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMatches', () => {
    it('should fetch matches successfully', async () => {
      const mockResponse = {
        matches: [
          {
            id: 1,
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            homeScore: 2,
            awayScore: 1,
            matchTime: '2024-01-01T10:00:00Z',
            time: '45:00',
            status: 'live',
            league: 'Premier League',
            sport: 'football',
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchMatches()

      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]).toMatchObject({
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        score: { home: 2, away: 1 },
        startTime: '2024-01-01T10:00:00Z',
        status: 'live',
      })
      expect(result.requestId).toBeGreaterThan(0)
    })

    it('should retry on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ matches: [] }),
        })

      const result = await fetchMatches()

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toMatchObject({
        matches: [],
        requestId: expect.any(Number),
      })
    })

    it('should return empty array after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await fetchMatches()
      
      // Should gracefully return empty array instead of throwing
      expect(result).toMatchObject({
        matches: [],
        requestId: expect.any(Number),
      })
    }, 35000) // Increase timeout to 35 seconds for retry delays

    it('should handle invalid API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' }),
      })

      const result = await fetchMatches()

      expect(result).toMatchObject({
        matches: [],
        requestId: expect.any(Number),
      })
    })

    it('should include username header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matches: [] }),
      })

      await fetchMatches()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            username: expect.any(String),
          }),
        })
      )
    })
  })
})
