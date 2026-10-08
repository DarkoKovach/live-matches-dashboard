<script setup lang="ts">
import { watchEffect, ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMatchesApi } from '@/composables/useMatchesApi'
import { useSessionManagement } from '@/composables/useSessionManagement'
import { useMatchesStore } from '@/stores/matchesStore'
import { FEATURE_FLAGS } from '@/utils/constants'
import AppHeader from '@/components/AppHeader.vue'
import MatchFilters from '@/components/matches/MatchFilters.vue'
import MatchesList from '@/components/matches/MatchesList.vue'
import MatchDebugPanel from '@/components/matches/MatchDebugPanel.vue'

// Initialize API polling
useMatchesApi()

// Initialize session management and memory cleanup
useSessionManagement()

const { t } = useI18n()
const matchesStore = useMatchesStore()

/**
 * Template ref for MatchesList component
 */
const matchesListRef = ref<InstanceType<typeof MatchesList>>()

/**
 * Debug panel state and metrics
 */
const isDev = FEATURE_FLAGS.ENABLE_DEBUG_PANEL
const showDebugPanel = ref(false)
const windowHeight = ref(window.innerHeight)
const columns = ref(3)

/**
 * Calculate columns based on window width (same as MatchesList)
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
 * Calculate total rows for debug panel
 */
const totalRows = computed(() => {
  return matchesListRef.value?.totalRowsCount ?? Math.ceil(matchesStore.filteredMatches.length / columns.value)
})

/**
 * Get actual rendered rows from MatchesList component
 */
const renderedRows = computed(() => {
  return matchesListRef.value?.renderedRowsCount ?? totalRows.value
})

/**
 * Estimated row height (same as MatchesList)
 */
const ESTIMATED_ROW_HEIGHT = 243

/**
 * Calculate if virtual scrolling is needed
 */
const needsVirtualScroll = computed(() => {
  return matchesListRef.value?.needsVirtualScroll ?? false
})

/**
 * Calculate total content height
 */
const contentHeight = computed(() => totalRows.value * ESTIMATED_ROW_HEIGHT)

// Update page title when language changes
watchEffect(() => {
  // Use raw string to avoid pipe interpretation
  const title = t('app.pageTitle')
  document.title = title
})

/**
 * Setup responsive listeners
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
  window.removeEventListener('resize', () => {
    windowHeight.value = window.innerHeight
  })
})

</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Filters Section -->
        <MatchFilters />

        <!-- Matches List -->
        <MatchesList ref="matchesListRef" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border bg-card/50 backdrop-blur-sm mt-12 py-6">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>{{ t('app.footer') }}</p>
      </div>
    </footer>

    <!-- Global Debug Panel (always accessible) -->
    <MatchDebugPanel
      v-if="isDev"
      v-model="showDebugPanel"
      :total-matches="matchesStore.filteredMatches.length"
      :total-rows="totalRows"
      :rendered-rows="renderedRows"
      :columns="columns"
      :is-virtual-scroll-enabled="needsVirtualScroll"
      :viewport-height="windowHeight"
      :content-height="contentHeight"
    />
  </div>
</template>
