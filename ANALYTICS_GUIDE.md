# 📊 Analytics Viewing Guide

## Where to See Analytics

Analytics are tracked throughout the application and can be viewed in **2 places**:

---

## 1. 🎯 Debug Panel (Visual UI)

**How to Access:**
1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. Click the **Info button** (bottom-right corner)
4. Scroll down to **"📊 Analytics (Recent 10)"** section

**What You'll See:**
- **Event Name**: Type of event (e.g., `filter_applied`, `api_fetch_success`)
- **Timestamp**: When the event occurred
- **Event Data**: Additional context (e.g., filter type, match count)

**Live Updates:**
- Events appear in real-time as they happen
- Most recent 10 events shown (newest first)
- Auto-scrollable list

**Example Events You'll See:**
```
app_mounted                    10:30:15 AM
  sessionId: 1729852815123-abc123

api_fetch_success             10:30:17 AM
  matchCount: 42

filter_applied                10:30:25 AM
  filterType: league, value: Premier League

favorite_toggled              10:30:30 AM
  matchId: 123, isFavorite: true

race_condition_prevented      10:30:35 AM
  requestId: 5, lastProcessed: 8
```

---

## 2. 🖥️ Browser Console (Developer Tools)

**How to Access:**
1. Start the dev server: `npm run dev`
2. Open browser DevTools (F12 or Cmd+Opt+I)
3. Go to **Console** tab

**Available Commands:**

### View All Analytics Events
```javascript
window.analytics.getEventQueue()
```
**Returns:** Array of all tracked events with full data

**Example Output:**
```javascript
[
  {
    event: "app_mounted",
    data: { sessionId: "1729852815123-abc123" },
    timestamp: 1729852815123
  },
  {
    event: "api_fetch_success",
    data: { matchCount: 42 },
    timestamp: 1729852817456
  },
  // ... more events
]
```

### View Recent 10 Events
```javascript
window.analytics.getEventQueue().slice(-10)
```

### Clear Event Queue
```javascript
window.analytics.clearEventQueue()
```

### Filter Specific Event Types
```javascript
// Get all API-related events
window.analytics.getEventQueue().filter(e => e.event.includes('api'))

// Get all user actions
window.analytics.getEventQueue().filter(e => 
  ['filter_applied', 'favorite_toggled', 'sort_changed', 'search_performed'].includes(e.event)
)

// Count events by type
const eventCounts = window.analytics.getEventQueue().reduce((acc, e) => {
  acc[e.event] = (acc[e.event] || 0) + 1
  return acc
}, {})
console.table(eventCounts)
```

---

## 📋 Tracked Event Types

### User Actions
- `filter_applied` - When user applies any filter
- `favorite_toggled` - When user favorites/unfavorites a match
- `sort_changed` - When user changes sort order
- `search_performed` - When user searches for teams
- `language_changed` - When user switches language

### System Events
- `app_mounted` - When app initializes
- `api_fetch_success` - When API call succeeds
- `api_fetch_error` - When API call fails
- `api_retry_attempted` - When API retry is triggered
- `virtual_scroll_activated` - When virtual scrolling kicks in

### Performance Events
- `memory_cleanup` - When periodic memory cleanup runs
- `session_timeout` - When user session times out
- `race_condition_prevented` - When old API response is discarded

---

## 🎛️ Configuration

Analytics can be **enabled/disabled** via `.env`:

```bash
# Enable analytics tracking
VITE_ENABLE_ANALYTICS=true

# Disable analytics tracking
VITE_ENABLE_ANALYTICS=false
```

**Note:** In production, you can connect analytics to services like:
- **Sentry** (error tracking)
- **Google Analytics** (user behavior)
- **Mixpanel** (product analytics)
- **PostHog** (open-source analytics)

---

## 🧪 Testing Analytics

### Trigger Events Manually

**1. Filter Events:**
- Change sport filter → `filter_applied`
- Change league filter → `filter_applied`
- Toggle favorites → `filter_applied`
- Change sort order → `sort_changed`
- Search for team → `search_performed`

**2. API Events:**
- Wait for polling interval → `api_fetch_success`
- Disconnect network → `api_fetch_error` + `api_retry_attempted`

**3. Performance Events:**
- Wait 5 minutes → `memory_cleanup`
- Idle for 1 hour → `session_timeout`
- Rapid filter changes → Potential `race_condition_prevented`

**4. System Events:**
- Refresh page → `app_mounted`
- Scroll large list → `virtual_scroll_activated`

---

## 💡 Pro Tips

### 1. Monitor API Health
```javascript
// Check API success rate
const apiEvents = window.analytics.getEventQueue().filter(e => 
  e.event.includes('api_fetch')
)
const successRate = apiEvents.filter(e => 
  e.event === 'api_fetch_success'
).length / apiEvents.length * 100
console.log(`API Success Rate: ${successRate.toFixed(2)}%`)
```

### 2. Track User Engagement
```javascript
// See what users interact with most
const userActions = window.analytics.getEventQueue().filter(e => 
  ['filter_applied', 'favorite_toggled', 'sort_changed', 'search_performed'].includes(e.event)
)
console.table(userActions.map(e => ({
  action: e.event,
  time: new Date(e.timestamp).toLocaleTimeString()
})))
```

### 3. Debug Race Conditions
```javascript
// Check if race conditions are happening
const raceEvents = window.analytics.getEventQueue().filter(e => 
  e.event === 'race_condition_prevented'
)
console.log(`Race conditions prevented: ${raceEvents.length}`)
```

---

## 🚀 Next Steps

- **Add custom events**: See `src/utils/analytics.ts` to add new event types
- **Integrate Sentry**: Add `VITE_SENTRY_DSN` to `.env` for error monitoring
- **Export analytics**: Create CSV/JSON export functionality
- **Build dashboard**: Create analytics visualization component