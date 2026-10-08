import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './i18n'
import './style.css'
import App from './App.vue'
import { analytics } from './utils/analytics'
import { FEATURE_FLAGS } from './utils/constants'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.mount('#app')

// Expose analytics to window for debugging in console (respects ENABLE_DEBUG_PANEL flag)
if (FEATURE_FLAGS.ENABLE_DEBUG_PANEL) {
  interface WindowWithAnalytics extends Window {
    analytics?: typeof analytics
  }
  ;(window as unknown as WindowWithAnalytics).analytics = analytics
  console.log('📊 Analytics service available via window.analytics')
  console.log('   - window.analytics.getEventQueue() - View all events')
  console.log('   - window.analytics.clearEventQueue() - Clear events')
}
