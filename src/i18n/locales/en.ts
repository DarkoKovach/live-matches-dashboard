export default {
  app: {
    title: 'Live Matches',
    subtitle: 'Live sports results with automatic updates',
    footer: 'Live Matches • Real-time Sports Matches Dashboard',
    pageTitle: "Live Matches {'|'} Results {'|'} Follow Live",
  },
  match: {
    status: {
      live: 'LIVE',
      finished: 'Finished',
      upcoming: 'Upcoming',
    },
  },
  filters: {
    search: 'Search teams...',
    favorites: 'Favorites',
    live: 'LIVE',
    activeFilters: 'Active Filters:',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    status: 'Match Status:',
    sortBy: {
      label: 'Sort by',
      time: 'Sort by time',
      team: 'Sort by team',
      league: 'Sort by league',
      score: 'Sort by score',
    },
    sports: 'Sports:',
    leagues: 'Leagues:',
    leaguesForSport: 'Leagues ({sport}):',
    reset: 'Reset',
    showing: 'Showing: {count} of {total} matches',
  },
  sports: {
    football: 'Football',
    basketball: 'Basketball',
    tennis: 'Tennis',
  },
  states: {
    loading: 'Loading matches...',
    error: 'Error loading data',
    noMatches: 'No matches matching search criteria',
    noMatchesAvailable: 'No matches available',
    fetchError: 'Error loading data',
    lastUpdate: 'Last update: {time}',
  },
  language: {
    select: 'Language',
    en: 'English',
    sr: 'Serbian',
  },
}
