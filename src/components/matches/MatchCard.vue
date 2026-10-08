<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'
import type { Match } from '@/types/match'
import { useMatchesStore } from '@/stores/matchesStore'

interface MatchCardProps {
  match: Match
}

const props = defineProps<MatchCardProps>()
const emit = defineEmits<{
  (e: 'toggleFavorite', id: string | number): void
}>()

const matchesStore = useMatchesStore()
const { t, locale } = useI18n()

/** Intl locale for dates/times, following the selected UI language */
const intlLocale = computed(() => (locale.value === 'sr' ? 'sr-Latn-RS' : 'en-GB'))

/**
 * Format the match start time
 */
const formattedTime = computed(() => {
  try {
    const date = new Date(props.match.startTime)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return props.match.startTime
    }
    return date.toLocaleTimeString(intlLocale.value, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return props.match.startTime
  }
})

/**
 * Format the match date
 */
const formattedDate = computed(() => {
  try {
    const date = new Date(props.match.startTime)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }
    return date.toLocaleDateString(intlLocale.value, {
      day: 'numeric',
      month: 'short'
    })
  } catch {
    return ''
  }
})

/**
 * Get badge variant based on match status
 */
const statusVariant = computed(() => {
  switch (props.match.status) {
    case 'live':
      return 'destructive'
    case 'finished':
      return 'secondary'
    case 'upcoming':
    default:
      return 'default'
  }
})

/**
 * Get status display text with live indicator
 */
const statusText = computed(() => {
  switch (props.match.status) {
    case 'live':
      return t('match.status.live')
    case 'finished':
      return t('match.status.finished')
    case 'upcoming':
      return t('match.status.upcoming')
    default:
      return props.match.status
  }
})

/**
 * Status badge classes with animations
 */
const statusBadgeClasses = computed(() => {
  const baseClasses = 'mb-2 font-semibold'
  
  if (props.match.status === 'live') {
    return `${baseClasses} animate-pulse bg-red-600 hover:bg-red-600 text-white border-red-700`
  }
  
  if (props.match.status === 'upcoming') {
    return `${baseClasses} bg-blue-600 hover:bg-blue-600 text-white border-blue-700`
  }
  
  if (props.match.status === 'finished') {
    return `${baseClasses} bg-gray-500 hover:bg-gray-500 text-white border-gray-600`
  }
  
  return baseClasses
})

/**
 * Check if match is favorite
 */
const isFavorite = computed(() => matchesStore.isFavorite(props.match.id))

/**
 * Check if match is new (for animation)
 */
const isNew = computed(() => matchesStore.isNew(props.match.id))

/**
 * Check if match is being removed (for animation)
 */
const isRemoved = computed(() => matchesStore.isRemoved(props.match.id))

/**
 * Compute card classes with animation states
 */
const cardClasses = computed(() =>
  cn(
    'transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50',
    {
      'animate-match-new border-green-500/50 shadow-green-500/20': isNew.value,
      'animate-match-removed': isRemoved.value,
      'border-primary/30': !isNew.value && !isRemoved.value && props.match.status === 'live',
      'border-border': !isNew.value && !isRemoved.value && props.match.status !== 'live',
    }
  )
)

/**
 * Toggle favorite status
 */
function handleToggleFavorite() {
  emit('toggleFavorite', props.match.id)
}
</script>

<template>
  <Card :class="cardClasses">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <Badge
            :variant="statusVariant"
            :class="statusBadgeClasses"
          >
            <!-- Red dot for live matches -->
            <span
              v-if="match.status === 'live'"
              class="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-white"
            />
            {{ statusText }}
            <span
              v-if="match.status === 'live' && match.time"
              class="ml-1"
            >
              {{ match.time }}
            </span>
          </Badge>
          <p class="text-sm text-muted-foreground">
            {{ match.league }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 cursor-pointer"
            @click="handleToggleFavorite"
          >
            <Star
              :class="cn('h-4 w-4', isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400')"
            />
          </Button>
          <div class="text-right">
            <div class="text-sm font-medium">
              {{ formattedTime }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ formattedDate }}
            </div>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <!-- Teams and Score -->
      <div class="space-y-3">
        <!-- Home Team -->
        <div class="flex items-center justify-between">
          <span class="font-semibold text-lg">{{ match.homeTeam }}</span>
          <span
            v-if="match.score"
            class="text-2xl font-bold tabular-nums"
          >
            {{ match.score.home }}
          </span>
        </div>

        <!-- Divider -->
        <div class="border-t border-border" />

        <!-- Away Team -->
        <div class="flex items-center justify-between">
          <span class="font-semibold text-lg">{{ match.awayTeam }}</span>
          <span
            v-if="match.score"
            class="text-2xl font-bold tabular-nums"
          >
            {{ match.score.away }}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
