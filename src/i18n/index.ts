import { createI18n } from 'vue-i18n'
import en from './locales/en'
import sr from './locales/sr'

// Get saved language from localStorage or default to English
const savedLocale = localStorage.getItem('lmd_locale') || 'en'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    sr,
  },
  silentTranslationWarn: true,
  missingWarn: false,
})

export default i18n
