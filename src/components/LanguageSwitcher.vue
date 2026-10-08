<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe, ChevronDown } from 'lucide-vue-next'
import { analytics, AnalyticsEvent } from '@/utils/analytics'
import { cn } from '@/lib/utils'
import Dropdown from '@/components/ui/Dropdown.vue'

const { locale } = useI18n()

/**
 * Language options for dropdown
 */
const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'sr', label: 'SR' },
]

/**
 * Current language as string
 */
const currentLanguage = computed({
  get: () => locale.value,
  set: (value: string) => {
    const previousLang = locale.value
    locale.value = value
    localStorage.setItem('lmd_locale', value)
    
    // Track language change
    analytics.trackEvent(AnalyticsEvent.LANGUAGE_CHANGED, {
      from: previousLang,
      to: value,
    })
  },
})
</script>

<template>
  <Dropdown
    v-model="currentLanguage"
    :options="languageOptions"
    min-width="80px"
  >
    <template #trigger="{ isOpen }">
      <div class="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-md px-3 py-2 cursor-pointer hover:bg-primary/20 transition-colors">
        <Globe class="h-4 w-4 text-primary hidden md:inline" />
        <span class="text-primary font-semibold text-sm uppercase">
          {{ currentLanguage }}
        </span>
        <ChevronDown :class="cn('h-3 w-3 text-primary transition-transform', isOpen && 'rotate-180')" />
      </div>
    </template>
  </Dropdown>
</template>
