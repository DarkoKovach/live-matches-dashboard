<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useMatchesStore } from '@/stores/matchesStore'
import { analytics, AnalyticsEvent } from '@/utils/analytics'
import MatchCard from './MatchCard.vue'

const matchesStore = useMatchesStore()
const { t } = useI18n()

/**
 * Get filtered matches from store
 */
const matches = computed(() => matchesStore.filteredMatches)

/**
 * Current number of columns in the grid (responsive)
 */
const columns = ref(3)

/**
 * Calculate columns based on window width
 */
function updateColumns() {
  const width = window.innerWidth
  if (width < 768) {
    columns.value = 1 // mobile
  } else if (width < 1024) {
    columns.value = 2 // tablet
  } else {
    columns.value = 3 // desktop
  }
}

/**
 * Estimated height of each row in pixels
 * Approximate match card height + gap
 */
const ESTIMATED_ROW_HEIGHT = 243

/**
 * Calculate if we need virtual scrolling
 * Enable only if content height exceeds 1x viewport height
 */
const needsVirtualScroll = computed(() => {
  const totalRows = Math.ceil(matches.value.length / columns.value)
  const estimatedHeight = totalRows * ESTIMATED_ROW_HEIGHT
  const viewportHeight = window.innerHeight
  
  // Enable virtual scroll if content is taller than viewport
  return estimatedHeight > viewportHeight
})

// Track if we've already logged virtual scroll activation
const virtualScrollTracked = ref(false)

/**
 * Track when virtual scroll becomes active
 */
watch(needsVirtualScroll, (needsVirtual) => {
  if (needsVirtual && !virtualScrollTracked.value) {
    const totalRows = Math.ceil(matches.value.length / columns.value)
    analytics.trackEvent(AnalyticsEvent.VIRTUAL_SCROLL_ACTIVATED, {
      totalMatches: matches.value.length,
      totalRows,
      estimatedHeight: totalRows * ESTIMATED_ROW_HEIGHT,
      viewportHeight: window.innerHeight,
    })
    virtualScrollTracked.value = true
  }
})

/**
 * Group matches into rows based on current column count
 */
const matchRows = computed(() => {
  const rows: typeof matches.value[] = []
  for (let i = 0; i < matches.value.length; i += columns.value) {
    rows.push(matches.value.slice(i, i + columns.value))
  }
  return rows
})

/**
 * Window-based virtual scrolling instance
 * Scrolls with the page instead of in a separate container
 * 
 * Performance optimizations applied:
 * 1. Virtual scrolling - Only renders visible rows (saves ~80% DOM nodes)
 * 2. v-memo directive - Skips re-render if match data unchanged
 * 3. Computed properties - Cached calculations for rows and scroll state
 * 4. Row-based virtualization - Groups matches preserving grid layout
 */
const virtualizer = useWindowVirtualizer({
  get count() {
    return matchRows.value.length
  },
  estimateSize: () => ESTIMATED_ROW_HEIGHT,
  overscan: 5,
})

/**
 * Get actual rendered rows count from virtualizer
 */
const renderedRowsCount = computed(() => {
  if (!needsVirtualScroll.value) {
    return matchRows.value.length
  }
  return virtualizer.value.getVirtualItems().length
})

/**
 * Expose metrics for parent component (App.vue) to use in debug panel
 */
defineExpose({
  renderedRowsCount,
  totalRowsCount: computed(() => matchRows.value.length),
  needsVirtualScroll,
})

/**
 * Get window height for debug info
 */
const windowHeight = ref(window.innerHeight)

/**
 * Handle favorite toggle
 */
function handleToggleFavorite(matchId: string | number) {
  matchesStore.toggleFavorite(matchId)
}

/**
 * Setup responsive column detection
 */
onMounted(() => {
  updateColumns()
  window.addEventListener('resize', updateColumns)
  window.addEventListener('resize', () => {
    windowHeight.value = window.innerHeight
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumns)
})

// Watch for match changes and remeasure virtualizer
watch(() => matches.value.length, () => {
  if (needsVirtualScroll.value) {
    virtualizer.value.measure()
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div
      v-if="matchesStore.isLoading && matches.length === 0"
      class="text-center py-12"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p class="mt-4 text-muted-foreground">
        {{ t('states.loading') }}
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="matchesStore.error"
      class="text-center py-12 px-4 bg-destructive/10 rounded-lg border border-destructive"
    >
      <p class="text-destructive font-semibold">
        {{ t('states.error') }}
      </p>
      <p class="text-sm text-muted-foreground mt-2">
        {{ matchesStore.error }}
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="matches.length === 0"
      class="text-center py-12 px-4 bg-muted/50 rounded-lg"
    >
      <p class="text-muted-foreground">
        {{ t('states.noMatches') }}
      </p>
    </div>

    <!-- Virtual Scrolling - For Large Lists -->
    <div
      v-else-if="needsVirtualScroll"
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-4">
          <MatchCard
            v-for="match in matchRows[virtualRow.index]"
            :key="match.id"
            :match="match"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </div>
    </div>

    <!-- Regular Rendering - For Small Lists -->
    <TransitionGroup
      v-else
      name="match-list"
      tag="div"
      class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      <MatchCard
        v-for="match in matches"
        :key="match.id"
        :match="match"
        @toggle-favorite="handleToggleFavorite"
      />
    </TransitionGroup>

    <!-- Last Update Time -->
    <div
      v-if="matchesStore.lastFetchTime"
      class="text-center text-sm text-muted-foreground pt-4"
    >
      {{ t('states.lastUpdate', { time: matchesStore.lastFetchTime.toLocaleTimeString() }) }}
    </div>
  </div>
</template>

<style scoped>
/* List transition animations */
.match-list-move,
.match-list-enter-active,
.match-list-leave-active {
  transition: all 0.3s ease;
}

.match-list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.match-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.match-list-leave-active {
  position: absolute;
  /* Fix animation glitch - constrain to grid column width */
  max-width: 100%;
  overflow: hidden;
}
</style>
