import type { Match, MatchStatus } from '@/types/match'

/**
 * Demo data source used when no API is configured (e.g. the public GitHub Pages demo).
 *
 * Simulates a live feed between polls: live matches advance and score,
 * upcoming matches kick off, finished matches drop out and new fixtures appear,
 * so the new/removed animations and filters can be seen without the real API.
 */

interface Fixture {
  sport: string
  league: string
  teams: string[]
}

const FIXTURES: Fixture[] = [
  { sport: 'Football', league: 'Premier League', teams: ['Arsenal', 'Chelsea', 'Liverpool', 'Man City', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton'] },
  { sport: 'Football', league: 'La Liga', teams: ['Real Madrid', 'Barcelona', 'Atlético', 'Sevilla', 'Valencia', 'Villarreal'] },
  { sport: 'Football', league: 'Serie A', teams: ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'] },
  { sport: 'Football', league: 'Super Liga', teams: ['Crvena zvezda', 'Partizan', 'Vojvodina', 'TSC', 'Čukarički', 'Radnički'] },
  { sport: 'Basketball', league: 'EuroLeague', teams: ['Real Madrid', 'Fenerbahçe', 'Olympiacos', 'Panathinaikos', 'Partizan', 'Crvena zvezda'] },
  { sport: 'Basketball', league: 'NBA', teams: ['Lakers', 'Celtics', 'Nuggets', 'Warriors', 'Bucks', 'Thunder'] },
  { sport: 'Tennis', league: 'ATP 500', teams: ['Djokovic', 'Alcaraz', 'Sinner', 'Medvedev', 'Zverev', 'Rune'] },
]

const POOL_SIZE = 36

let nextId = 1
let pool: Match[] = []

const rand = (n: number) => Math.floor(Math.random() * n)
const pick = <T>(arr: T[]): T => arr[rand(arr.length)] as T

function createMatch(status: MatchStatus): Match {
  const fixture = pick(FIXTURES)
  const home = pick(fixture.teams)
  let away = pick(fixture.teams)
  while (away === home) away = pick(fixture.teams)

  const now = Date.now()
  const minute = status === 'live' ? 1 + rand(80) : 0
  const startOffset =
    status === 'upcoming' ? (10 + rand(240)) * 60_000 : -(minute || 95 + rand(180)) * 60_000
  const scored = status === 'upcoming' ? undefined : rand(3)

  return {
    id: nextId++,
    sport: fixture.sport,
    league: fixture.league,
    homeTeam: home,
    awayTeam: away,
    homeScore: scored,
    awayScore: status === 'upcoming' ? undefined : rand(3),
    startTime: new Date(now + startOffset).toISOString(),
    matchTime: new Date(now + startOffset).toISOString(),
    status,
    time: status === 'live' ? `${minute}'` : undefined,
  }
}

function seed() {
  pool = [
    ...Array.from({ length: 14 }, () => createMatch('live')),
    ...Array.from({ length: 16 }, () => createMatch('upcoming')),
    ...Array.from({ length: 6 }, () => createMatch('finished')),
  ]
}

function tick() {
  pool = pool
    // Drop some finished matches so the "removed" animation is visible
    .filter((m) => !(m.status === 'finished' && Math.random() < 0.25))
    .map((m) => {
      if (m.status === 'live') {
        const minute = parseInt(String(m.time ?? '0'), 10) + 1 + rand(4)
        if (minute >= 90) return { ...m, status: 'finished' as const, time: undefined }
        return {
          ...m,
          time: `${minute}'`,
          homeScore: (m.homeScore ?? 0) + (Math.random() < 0.08 ? 1 : 0),
          awayScore: (m.awayScore ?? 0) + (Math.random() < 0.08 ? 1 : 0),
        }
      }
      if (m.status === 'upcoming' && Math.random() < 0.1) {
        return { ...m, status: 'live' as const, time: "1'", homeScore: 0, awayScore: 0 }
      }
      return m
    })

  // Top up with new fixtures so the "new match" animation is visible
  while (pool.length < POOL_SIZE) pool.push(createMatch('upcoming'))
}

/**
 * Returns the next snapshot of the simulated feed.
 */
export async function fetchMockMatches(): Promise<Match[]> {
  if (pool.length === 0) seed()
  else tick()
  // Small artificial latency so loading states behave like a real request
  await new Promise((resolve) => setTimeout(resolve, 250))
  return pool.map((m) => ({ ...m }))
}
