export default {
  app: {
    title: 'Mečevi uživo',
    subtitle: 'Uživo sportski rezultati sa automatskim ažuriranjem',
    footer: 'Live Matches • Real-time Sports Matches Dashboard',
    pageTitle: "Live Matches {'|'} Rezultati {'|'} Prati uživo",
  },
  match: {
    status: {
      live: 'UŽIVO',
      finished: 'Završeno',
      upcoming: 'Uskoro',
    },
  },
  filters: {
    search: 'Pretraži timove...',
    favorites: 'Favoriti',
    live: 'UŽIVO',
    activeFilters: 'Aktivni filteri:',
    showFilters: 'Prikaži filtere',
    hideFilters: 'Sakrij filtere',
    status: 'Status meča:',
    sortBy: {
      label: 'Sortiraj po',
      time: 'Sortiraj po vremenu',
      team: 'Sortiraj po timu',
      league: 'Sortiraj po ligi',
      score: 'Sortiraj po rezultatu',
    },
    sports: 'Sportovi:',
    leagues: 'Lige:',
    leaguesForSport: 'Lige ({sport}):',
    reset: 'Resetuj',
    showing: 'Prikazano: {count} od {total} mečeva',
  },
  sports: {
    football: 'Fudbal',
    basketball: 'Košarka',
    tennis: 'Tenis',
  },
  states: {
    loading: 'Učitavanje mečeva...',
    error: 'Greška pri učitavanju podataka',
    noMatches: 'Nema mečeva koji odgovaraju kriterijumima pretrage',
    noMatchesAvailable: 'Nema dostupnih mečeva',
    fetchError: 'Greška pri učitavanju podataka',
    lastUpdate: 'Poslednje ažuriranje: {time}',
  },
  language: {
    select: 'Jezik',
    en: 'Engleski',
    sr: 'Srpski',
  },
}
