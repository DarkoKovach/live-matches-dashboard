<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Star, X, ChevronDown, ChevronUp, Radio, Circle } from 'lucide-vue-next'
import { useMatchesStore } from '@/stores/matchesStore'
import type { MatchStatus } from '@/types/match'
import { cn } from '@/lib/utils'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Dropdown from '@/components/ui/Dropdown.vue'

const { t } = useI18n()
const matchesStore = useMatchesStore()

/**
 * Filter panel collapsed state
 */
const isCollapsed = ref(true)

/**
 * Search query model
 */
const searchQuery = computed({
  get: () => matchesStore.filters.searchQuery,
  set: (value) => matchesStore.updateFilters({ searchQuery: value }),
})

/**
 * Show only favorites toggle
 */
const showOnlyFavorites = computed({
  get: () => matchesStore.filters.showOnlyFavorites,
  set: (value) => matchesStore.updateFilters({ showOnlyFavorites: value }),
})

/**
 * Sort by option
 */
const sortBy = computed({
  get: () => matchesStore.filters.sortBy,
  set: (value: string) => matchesStore.updateFilters({ sortBy: value as 'time' | 'team' | 'league' | 'score' }),
})

/**
 * Selected sport
 */
const selectedSport = computed({
  get: () => matchesStore.filters.selectedSport,
  set: (value) => {
    // When sport changes, clear selected leagues since they're sport-specific
    matchesStore.updateFilters({ selectedSport: value, selectedLeagues: [] })
  },
})

/**
 * Selected leagues
 */
const selectedLeagues = computed({
  get: () => matchesStore.filters.selectedLeagues,
  set: (value) => matchesStore.updateFilters({ selectedLeagues: value }),
})

/**
 * Selected statuses
 */
const selectedStatuses = computed({
  get: () => matchesStore.filters.selectedStatuses,
  set: (value) => matchesStore.updateFilters({ selectedStatuses: value }),
})

/**
 * Quick toggle for live matches only
 */
const showOnlyLive = computed({
  get: () => matchesStore.filters.selectedStatuses.length === 1 && matchesStore.filters.selectedStatuses[0] === 'live',
  set: (value) => {
    if (value) {
      matchesStore.updateFilters({ selectedStatuses: ['live'] })
    } else {
      matchesStore.updateFilters({ selectedStatuses: [] })
    }
  },
})

/**
 * Available sports from matches
 */
const availableSports = computed(() => matchesStore.availableSports)

/**
 * Available leagues from matches (filtered by selected sport)
 */
const availableLeagues = computed(() => matchesStore.availableLeagues)

/**
 * Get translated sport name
 */
function getSportName(sport: string | undefined) {
  if (!sport) return ''
  const key = `sports.${sport}` as const
  return t(key, sport) // Fallback to original if translation missing
}

/**
 * Toggle sport selection
 */
function toggleSport(sport: string | undefined) {
  if (!sport) return
  
  if (selectedSport.value === sport) {
    // Deselect sport (show all)
    selectedSport.value = null
  } else {
    // Select sport (this will also clear league filters)
    selectedSport.value = sport
  }
}

/**
 * Check if sport is selected
 */
function isSportSelected(sport: string | undefined) {
  if (!sport) return false
  return selectedSport.value === sport
}

/**
 * Toggle league selection
 */
function toggleLeague(league: string) {
  const current = selectedLeagues.value
  if (current.includes(league)) {
    selectedLeagues.value = current.filter(l => l !== league)
  } else {
    selectedLeagues.value = [...current, league]
  }
}

/**
 * Check if league is selected
 */
function isLeagueSelected(league: string) {
  return selectedLeagues.value.includes(league)
}

/**
 * Toggle status selection
 */
function toggleStatus(status: MatchStatus) {
  const current = selectedStatuses.value
  if (current.includes(status)) {
    selectedStatuses.value = current.filter(s => s !== status)
  } else {
    selectedStatuses.value = [...current, status]
  }
}

/**
 * Check if status is selected
 */
function isStatusSelected(status: MatchStatus) {
  return selectedStatuses.value.includes(status)
}

/**
 * Toggle live filter
 */
function toggleLiveFilter() {
  showOnlyLive.value = !showOnlyLive.value
}

/**
 * Reset all filters
 */
function handleResetFilters() {
  matchesStore.resetFilters()
}

/**
 * Remove sport filter
 */
function removeSportFilter() {
  selectedSport.value = null
}

/**
 * Remove league filter
 */
function removeLeagueFilter(league: string) {
  selectedLeagues.value = selectedLeagues.value.filter(l => l !== league)
}

/**
 * Remove status filter
 */
function removeStatusFilter(status: MatchStatus) {
  selectedStatuses.value = selectedStatuses.value.filter(s => s !== status)
}

/**
 * Toggle favorites filter
 */
function toggleFavoritesFilter() {
  showOnlyFavorites.value = !showOnlyFavorites.value
}

/**
 * Sort options for dropdown
 */
const sortOptions = computed(() => [
  { value: 'time', label: t('filters.sortBy.time') },
  { value: 'team', label: t('filters.sortBy.team') },
  { value: 'league', label: t('filters.sortBy.league') },
  { value: 'score', label: t('filters.sortBy.score') },
])

/**
 * Count of active filters
 */
const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count++
  if (selectedSport.value) count++
  if (selectedLeagues.value.length > 0) count++
  if (selectedStatuses.value.length > 0) count++
  if (showOnlyFavorites.value) count++
  return count
})
</script>

<template>
  <div class="space-y-4 p-4 bg-card rounded-lg border shadow-sm">
    <!-- Top Row: Favorites, Live, Sort, and Expand/Collapse -->
    <div class="flex flex-wrap gap-2 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        <!-- Favorites Toggle -->
        <Button
          variant="outline"
          size="sm"
          :class="cn(
            'cursor-pointer border-2 transition-colors',
            showOnlyFavorites ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' : 'hover:bg-accent'
          )"
          @click="toggleFavoritesFilter"
        >
          <Star :class="cn('h-4 w-4', showOnlyFavorites && 'fill-current', 'md:mr-2')" />
          <span class="hidden md:inline">{{ t('filters.favorites') }}</span>
        </Button>

        <!-- Live Toggle -->
        <Button
          variant="outline"
          size="sm"
          :class="cn(
            'cursor-pointer border-2 transition-colors',
            showOnlyLive ? 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20' : 'hover:bg-accent'
          )"
          @click="toggleLiveFilter"
        >
          <Radio
            v-if="showOnlyLive"
            :class="cn('h-4 w-4 animate-pulse', 'md:mr-2')"
          />
          <Circle
            v-else
            :class="cn('h-4 w-4', 'md:mr-2')"
          />
          <span class="hidden md:inline">{{ t('filters.live') }}</span>
        </Button>

        <!-- Sort Dropdown -->
        <Dropdown
          v-model="sortBy"
          :options="sortOptions"
        >
          <template #trigger="{ isOpen }">
            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer text-xs md:text-sm"
            >
              <ChevronDown :class="cn('h-4 w-4 mr-2 transition-transform', isOpen && 'rotate-180')" />
              {{ t(`filters.sortBy.${sortBy}`) }}
            </Button>
          </template>
        </Dropdown>
      </div>

      <!-- Expand/Collapse Button -->
      <Button
        variant="outline"
        size="sm"
        class="cursor-pointer"
        @click="isCollapsed = !isCollapsed"
      >
        <component
          :is="isCollapsed ? ChevronDown : ChevronUp"
          :class="cn('h-4 w-4', 'md:mr-2')"
        />
        <span class="hidden md:inline">
          {{ isCollapsed ? t('filters.showFilters') : t('filters.hideFilters') }}
        </span>
      </Button>
    </div>

    <!-- Collapsible Filter Content -->
    <div
      v-if="!isCollapsed"
      class="space-y-4 pt-2"
    >
      <!-- Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          type="text"
          :placeholder="t('filters.search')"
          class="pl-10"
        />
      </div>

      <!-- Active Filters Display -->
      <div
        v-if="activeFiltersCount > 0"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-muted-foreground">
            {{ t('filters.activeFilters') }}
          </p>
          <Button
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            @click="handleResetFilters"
          >
            <X class="h-4 w-4 mr-2" />
            {{ t('filters.reset') }} ({{ activeFiltersCount }})
          </Button>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <!-- Favorites Filter Badge -->
          <Badge
            v-if="showOnlyFavorites"
            variant="default"
            class="cursor-pointer hover:bg-primary/80 transition-colors pr-1"
          >
            <Star class="h-3 w-3 mr-1 fill-current" />
            {{ t('filters.favorites') }}
            <X 
              class="h-3 w-3 ml-2 inline-block hover:bg-primary-foreground/20 rounded-full"
              @click.stop="toggleFavoritesFilter"
            />
          </Badge>

          <!-- Selected Sport Badge -->
          <Badge
            v-if="selectedSport"
            variant="default"
            class="cursor-pointer hover:bg-primary/80 transition-colors pr-1"
          >
            {{ getSportName(selectedSport) }}
            <X 
              class="h-3 w-3 ml-2 inline-block hover:bg-primary-foreground/20 rounded-full"
              @click.stop="removeSportFilter"
            />
          </Badge>

          <!-- Selected League Badges -->
          <Badge
            v-for="league in selectedLeagues"
            :key="`active-${league}`"
            variant="default"
            class="cursor-pointer hover:bg-primary/80 transition-colors pr-1"
          >
            {{ league }}
            <X 
              class="h-3 w-3 ml-2 inline-block hover:bg-primary-foreground/20 rounded-full"
              @click.stop="removeLeagueFilter(league)"
            />
          </Badge>

          <!-- Selected Status Badges -->
          <Badge
            v-for="status in selectedStatuses"
            :key="`active-${status}`"
            :variant="status === 'live' ? 'destructive' : 'default'"
            class="cursor-pointer hover:bg-primary/80 transition-colors pr-1"
          >
            {{ t(`match.status.${status}`) }}
            <X 
              class="h-3 w-3 ml-2 inline-block hover:bg-primary-foreground/20 rounded-full"
              @click.stop="removeStatusFilter(status)"
            />
          </Badge>
        </div>
      </div>

      <!-- Sport Filters -->
      <div
        v-if="availableSports.length > 0"
        class="space-y-2"
      >
        <p class="text-sm font-medium">
          {{ t('filters.sports') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="sport in availableSports"
            :key="sport"
            :variant="isSportSelected(sport) ? 'default' : 'outline'"
            class="cursor-pointer hover:bg-primary/80 transition-colors"
            @click="toggleSport(sport)"
          >
            {{ getSportName(sport) }}
          </Badge>
        </div>
      </div>

      <!-- League Filters (filtered by selected sport) -->
      <div
        v-if="availableLeagues.length > 0"
        class="space-y-2"
      >
        <p class="text-sm font-medium">
          <template v-if="selectedSport">
            {{ t('filters.leaguesForSport', { sport: getSportName(selectedSport) }) }}
          </template>
          <template v-else>
            {{ t('filters.leagues') }}
          </template>
        </p>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="league in availableLeagues"
            :key="league"
            :variant="isLeagueSelected(league) ? 'default' : 'outline'"
            class="cursor-pointer hover:bg-primary/80 transition-colors"
            @click="toggleLeague(league)"
          >
            {{ league }}
          </Badge>
        </div>
      </div>

      <!-- Status Filters -->
      <div class="space-y-2">
        <p class="text-sm font-medium">
          {{ t('filters.status') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <Badge
            :variant="isStatusSelected('live') ? 'destructive' : 'outline'"
            :class="cn(
              'cursor-pointer transition-colors',
              isStatusSelected('live') 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'hover:bg-red-100 hover:text-red-600'
            )"
            @click="toggleStatus('live')"
          >
            <span
              v-if="isStatusSelected('live')"
              class="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-white"
            />
            {{ t('match.status.live') }}
          </Badge>
          <Badge
            :variant="isStatusSelected('upcoming') ? 'default' : 'outline'"
            :class="cn(
              'cursor-pointer transition-colors',
              isStatusSelected('upcoming')
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'hover:bg-blue-100 hover:text-blue-600'
            )"
            @click="toggleStatus('upcoming')"
          >
            {{ t('match.status.upcoming') }}
          </Badge>
          <Badge
            :variant="isStatusSelected('finished') ? 'secondary' : 'outline'"
            :class="cn(
              'cursor-pointer transition-colors',
              isStatusSelected('finished')
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'hover:bg-gray-100 hover:text-gray-600'
            )"
            @click="toggleStatus('finished')"
          >
            {{ t('match.status.finished') }}
          </Badge>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div
        v-if="activeFiltersCount > 0"
        class="text-sm text-muted-foreground"
      >
        {{ t('filters.showing', { count: matchesStore.filteredMatches.length, total: matchesStore.matches.length }) }}
      </div>
    </div>
  </div>
</template>
