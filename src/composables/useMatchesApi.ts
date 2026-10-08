import { onMounted, onUnmounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useMatchesStore } from '@/stores/matchesStore'
import { POLLING_INTERVAL } from '@/utils/constants'

/**
 * Composable for managing matches API polling
 * Automatically fetches matches on mount and polls at regular intervals
 * 
 * @param interval - Polling interval in milliseconds (default: 7000ms)
 * @returns Object with polling controls
 */
export function useMatchesApi(interval: number = POLLING_INTERVAL) {
  const matchesStore = useMatchesStore()

  // Setup polling with @vueuse/core
  const { pause, resume, isActive } = useIntervalFn(
    () => {
      matchesStore.loadMatches()
    },
    interval,
    { immediate: false } // Don't start immediately, we'll do initial fetch first
  )

  /**
   * Start polling
   */
  function startPolling() {
    if (!isActive.value) {
      resume()
    }
  }

  /**
   * Stop polling
   */
  function stopPolling() {
    if (isActive.value) {
      pause()
    }
  }

  /**
   * Manually trigger a fetch
   */
  function refetch() {
    matchesStore.loadMatches()
  }

  // Lifecycle hooks
  onMounted(async () => {
    // Initial fetch
    await matchesStore.loadMatches()
    // Start polling
    resume()
  })

  onUnmounted(() => {
    // Clean up polling when component unmounts
    pause()
  })

  return {
    isActive,
    startPolling,
    stopPolling,
    refetch,
  }
}
