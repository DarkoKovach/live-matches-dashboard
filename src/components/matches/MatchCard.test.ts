import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import MatchCard from './MatchCard.vue'
import type { Match } from '@/types/match'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      match: {
        status: {
          live: 'LIVE',
          finished: 'Finished',
          upcoming: 'Upcoming',
        },
      },
    },
  },
})

describe('MatchCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockMatch: Match = {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    score: { home: 2, away: 1 },
    startTime: '2024-01-01T15:00:00Z',
    time: '45:00',
    status: 'live',
    league: 'Premier League',
    sport: 'football',
  }

  it('should render match information', () => {
    const wrapper = mount(MatchCard, {
      props: { match: mockMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Arsenal')
    expect(wrapper.text()).toContain('Chelsea')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('1')
  })

  it('should render live badge for live matches', () => {
    const wrapper = mount(MatchCard, {
      props: { match: mockMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('LIVE')
  })

  it('should render finished status', () => {
    const finishedMatch = { ...mockMatch, status: 'finished' as const }
    const wrapper = mount(MatchCard, {
      props: { match: finishedMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Finished')
  })

  it('should render league name', () => {
    const wrapper = mount(MatchCard, {
      props: { match: mockMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Premier League')
  })

  it('should emit toggleFavorite event', async () => {
    const wrapper = mount(MatchCard, {
      props: { match: mockMatch },
      global: {
        plugins: [i18n],
      },
    })

    const favoriteButton = wrapper.find('button')
    await favoriteButton.trigger('click')

    expect(wrapper.emitted('toggleFavorite')).toBeTruthy()
    expect(wrapper.emitted('toggleFavorite')?.[0]).toEqual([1])
  })

  it('should display match time for live matches', () => {
    const wrapper = mount(MatchCard, {
      props: { match: mockMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('45:00')
  })

  it('should handle matches without score', () => {
    const upcomingMatch = { ...mockMatch, score: undefined, status: 'upcoming' as const }
    const wrapper = mount(MatchCard, {
      props: { match: upcomingMatch },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Arsenal')
    expect(wrapper.text()).toContain('Chelsea')
    expect(wrapper.text()).toContain('Upcoming')
  })
})
