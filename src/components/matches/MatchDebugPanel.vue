<script setup lang="ts">
import { computed } from 'vue'
import { Code2, X } from 'lucide-vue-next'
import { useMatchesStore } from '@/stores/matchesStore'
import { analytics } from '@/utils/analytics'

/**
 * Props for the debug panel
 */
interface Props {
  /** Total number of matches displayed */
  totalMatches: number
  /** Total number of rows in the grid */
  totalRows: number
  /** Number of rendered rows (for virtual scrolling) */
  renderedRows: number
  /** Current number of columns in responsive grid */
  columns: number
  /** Whether virtual scrolling is active */
  isVirtualScrollEnabled: boolean
  /** Viewport height in pixels */
  viewportHeight: number
  /** Content height in pixels */
  contentHeight: number
  /** Show/hide state controlled by parent */
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const matchesStore = useMatchesStore()

/**
 * Debug metrics computed from props and store
 */
const debugMetrics = computed(() => {
  const total = props.totalMatches
  const domNodes = props.isVirtualScrollEnabled
    ? props.renderedRows * props.columns
    : total
  const savedNodes = Math.max(0, total - domNodes) // Cap at 0 to prevent negative values
  const savedPercentage = total > 0 ? Math.round((savedNodes / total) * 100) : 0

  // Count active filters
  const activeFilters = []
  if (matchesStore.filters.selectedLeagues.length > 0) activeFilters.push('Leagues')
  if (matchesStore.filters.searchQuery) activeFilters.push('Search')
  if (matchesStore.filters.sortBy !== 'time') activeFilters.push('Sort')
  if (matchesStore.filters.showOnlyFavorites) activeFilters.push('Favorites')
  if (matchesStore.filters.selectedSport) activeFilters.push('Sport')

  // Count matches in different states
  const newMatchesCount = matchesStore.matches.filter((m) =>
    matchesStore.isNew(m.id),
  ).length
  const removedMatchesCount = matchesStore.matches.filter((m) =>
    matchesStore.isRemoved(m.id),
  ).length

  return {
    total,
    domNodes,
    savedNodes,
    savedPercentage,
    isVirtual: props.isVirtualScrollEnabled,
    columns: props.columns,
    rows: props.totalRows,
    rendered: props.renderedRows,
    viewportHeight: Math.round(props.viewportHeight),
    contentHeight: Math.round(props.contentHeight),
    overflow: (props.contentHeight / props.viewportHeight).toFixed(1),
    activeFilters,
    favorites: matchesStore.favoriteMatchIds.size,
    newMatches: newMatchesCount,
    removedMatches: removedMatchesCount,
    totalRawMatches: matchesStore.matches.length,
    filteredCount: matchesStore.filteredMatches.length,
  }
})

/**
 * Get recent analytics events (last 10)
 */
const recentEvents = computed(() => {
  const queue = analytics.getEventQueue()
  return queue.slice(-10).reverse() // Show most recent first
})

/**
 * Format event data for display
 */
function formatEventData(data: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

/**
 * Toggle panel visibility
 */
function togglePanel() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <!-- Debug info panel -->
  <div
    v-if="modelValue"
    class="fixed right-4 top-20 z-50 max-w-xs space-y-3 rounded-lg border border-primary/20 bg-black/90 p-4 text-xs text-white shadow-2xl backdrop-blur"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 text-sm font-bold text-primary">
      <div class="flex items-center gap-2">
        <span>🚀</span>
        <span>Virtual Scroll Active</span>
      </div>
      <button
        class="cursor-pointer text-gray-400 hover:text-white transition-colors"
        title="Close Debug Panel"
        @click="togglePanel"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Performance Metrics -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-emerald-400">
        Performance
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">DOM nodes saved:</span>
        <span class="font-mono text-emerald-400">{{ debugMetrics.savedNodes }} ({{ debugMetrics.savedPercentage }}%)</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Rendered/Total:</span>
        <span class="font-mono">{{ debugMetrics.domNodes }}/{{ debugMetrics.total }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Virtual scrolling:</span>
        <span :class="debugMetrics.isVirtual ? 'text-green-400' : 'text-gray-500'">{{
          debugMetrics.isVirtual ? '✓ Enabled' : '✗ Disabled'
        }}</span>
      </div>
    </div>

    <!-- Grid Layout -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-blue-400">
        Grid Layout
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Columns:</span>
        <span class="font-mono">{{ debugMetrics.columns }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Rows (rendered/total):</span>
        <span class="font-mono">{{ debugMetrics.rendered }}/{{ debugMetrics.rows }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Raw/Filtered matches:</span>
        <span class="font-mono">{{ debugMetrics.totalRawMatches }}/{{
          debugMetrics.filteredCount
        }}</span>
      </div>
    </div>

    <!-- Dimensions -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-purple-400">
        Dimensions
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Viewport:</span>
        <span class="font-mono">{{ debugMetrics.viewportHeight }}px</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Content height:</span>
        <span class="font-mono">{{ debugMetrics.contentHeight }}px</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Overflow:</span>
        <span class="font-mono">{{ debugMetrics.overflow }}x</span>
      </div>
    </div>

    <!-- Active State -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-yellow-400">
        Active State
      </div>
      <div class="flex justify-between gap-2">
        <span class="text-gray-400">Active filters:</span>
        <span class="text-right text-xs font-mono">{{
          debugMetrics.activeFilters.length > 0
            ? debugMetrics.activeFilters.join(', ')
            : 'None'
        }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Favorites:</span>
        <span class="font-mono text-yellow-400">{{ debugMetrics.favorites }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Animating (new):</span>
        <span class="font-mono text-green-400">{{ debugMetrics.newMatches }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Animating (removed):</span>
        <span class="font-mono text-red-400">{{ debugMetrics.removedMatches }}</span>
      </div>
    </div>

    <!-- API Status -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-orange-400">
        API Status
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Loading:</span>
        <span :class="matchesStore.isLoading ? 'text-yellow-400' : 'text-gray-500'">{{
          matchesStore.isLoading ? '● Fetching' : '○ Idle'
        }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Last fetch:</span>
        <span class="text-xs font-mono">{{
          matchesStore.lastFetchTime?.toLocaleTimeString() || 'Never'
        }}</span>
      </div>
      <div
        v-if="matchesStore.error"
        class="flex justify-between"
      >
        <span class="text-gray-400">Error:</span>
        <span class="text-xs font-mono text-red-400">{{
          matchesStore.error.substring(0, 20)
        }}...</span>
      </div>
    </div>

    <!-- Analytics Events -->
    <div class="space-y-1 border-t border-white/10 pt-2">
      <div class="font-semibold text-purple-400">
        📊 Analytics (Recent 10)
      </div>
      <div
        v-if="recentEvents.length === 0"
        class="text-xs text-gray-500"
      >
        No events yet...
      </div>
      <div
        v-else
        class="max-h-48 space-y-1 overflow-y-auto"
      >
        <div
          v-for="(event, idx) in recentEvents"
          :key="idx"
          class="rounded border border-purple-900/30 bg-purple-950/20 p-1.5"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-mono text-purple-300">{{ event.event }}</span>
            <span class="text-[10px] text-gray-500">{{
              new Date(event.timestamp).toLocaleTimeString()
            }}</span>
          </div>
          <div
            v-if="Object.keys(event.data).length > 0"
            class="mt-0.5 text-[10px] text-gray-400"
          >
            {{ formatEventData(event.data) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Debug toggle button -->
  <button
    class="fixed bottom-4 right-4 z-50 cursor-pointer rounded-full bg-purple-600 p-3 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-700"
    :title="props.modelValue ? 'Close Debug Panel' : 'Toggle Debug Panel (Dev Tools)'"
    @click="togglePanel"
  >
    <X
      v-if="props.modelValue"
      :size="20"
    />
    <Code2
      v-else
      :size="20"
    />
  </button>
</template>
