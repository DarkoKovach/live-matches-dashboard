<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppLogo from '@/assets/logo.svg'

const { t } = useI18n()

/**
 * Scroll to top of page when logo is clicked
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <header class="bg-gradient-to-r from-[#1a1a3e] via-[#2a2a5e] to-[#1a1a3e] shadow-lg sticky top-0 z-10 border-b border-primary/20">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a
            href="#"
            class="cursor-pointer transition-transform hover:scale-105"
            @click.prevent="scrollToTop"
          >
            <img
              :src="AppLogo"
              alt="Live Matches"
              class="h-10 md:h-8"
            >
          </a>
          <div class="border-l border-primary/30 pl-4 hidden md:block">
            <h1 class="text-xl font-bold text-white">
              {{ t('app.title') }}
            </h1>
            <p class="text-xs text-white/70 mt-0.5">
              {{ t('app.subtitle') }}
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  </header>
</template>
