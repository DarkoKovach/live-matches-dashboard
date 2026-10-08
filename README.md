# ⚽ Mozzart Live Sports Matches Dashboard

A real-time sports matches dashboard with dynamic updates, animations, and advanced filtering capabilities. Built as a technical assignment demonstrating production-ready code quality and best practices.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1-646cff?logo=vite)
![Tests](https://img.shields.io/badge/Tests-21%20passing-success)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Performance Optimizations](#-performance-optimizations)
- [Library Choices & Justifications](#-library-choices--justifications)
- [Analytics Documentation](#-analytics-documentation)

## ✨ Features

### Core Features
- **Real-time Updates**: Automatic polling every 10 seconds with retry mechanism
- **Smart Animations**: 
  - New matches highlighted with 1-second animation
  - Removed matches fade out over 1 second before removal
  - Smooth transitions with Vue's `<TransitionGroup>`
- **Advanced Filtering**:
  - Search by team name (real-time)
  - Filter by sport and league (multi-select)
  - Show only favorites
  - Sort by time, team name, league, or score
- **Favorites System**: LocalStorage persistence with star icon toggle
- **Internationalization**: English/Serbian language support (vue-i18n)
- **Responsive Design**: Mobile-first approach, adapts to all screen sizes

### Advanced Features
- **Virtual Scrolling**: Efficient rendering of large match lists (100+ matches)
- **Error Handling**: Multi-layer retry mechanism with exponential backoff
- **Loading States**: Skeleton loaders during data fetches
- **Collapsible Filters**: Clean UI with expandable filter panel
- **Development Tools**: Debug panel for virtual scrolling metrics (DEV mode only)

## 🛠 Tech Stack

### Core
- **Vue 3.5** - Composition API with `<script setup>` TypeScript syntax
- **TypeScript 5.9** - Strict mode for type safety
- **Vite 7.1** - Lightning-fast build tool and dev server
- **Pinia 3.0** - Official Vue state management

### UI & Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix Vue** - Headless UI primitives for accessibility
- **Lucide Vue** - Beautiful icon library
- **Class Variance Authority** - Dynamic component variants

### Testing
- **Vitest 4.0** - Fast unit testing framework
- **@vue/test-utils 2.4** - Official Vue component testing
- **Happy DOM** - Fast DOM environment for tests

### Additional Libraries
- **@tanstack/vue-virtual** - High-performance virtual scrolling
- **@vueuse/core** - Composition API utilities
- **vue-i18n 9.14** - Internationalization framework

## 📁 Project Structure

```
src/
├── components/
│   ├── matches/
│   │   ├── MatchCard.vue          # Individual match display component
│   │   ├── MatchesList.vue        # Main list with virtual scrolling
│   │   ├── MatchFilters.vue       # Filter panel with all controls
│   │   ├── MatchDebugPanel.vue    # Debug panel for development metrics
│   │   └── MatchSkeleton.vue      # Loading skeleton component
│   ├── ui/                        # shadcn-vue components (Button, Input, Badge, Dropdown, etc.)
│   └── LanguageSwitcher.vue       # Language selection component
├── composables/
│   ├── useMatchesApi.ts           # API polling logic with retry mechanism
│   └── useSessionManagement.ts    # Session tracking & memory management
├── stores/
│   └── matchesStore.ts            # Pinia store for matches state & filtering
├── types/
│   └── match.ts                   # TypeScript interfaces (Match, MatchFilters, etc.)
├── utils/
│   ├── api.ts                     # API client with retry & error handling
│   ├── api.test.ts                # API unit tests
│   ├── analytics.ts               # Analytics tracking system
│   └── constants.ts               # Configuration constants
├── i18n/
│   ├── index.ts                   # i18n configuration
│   └── locales/
│       ├── en.ts                  # English translations
│       └── sr.ts                  # Serbian translations
├── lib/
│   └── utils.ts                   # Utility functions (cn helper)
├── test/
│   └── setup.ts                   # Vitest global configuration
├── assets/                        # Static assets
├── App.vue                        # Root component
├── main.ts                        # Application entry point
└── style.css                      # Global styles & Tailwind imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DarkoKovach/mozzart-web-app.git
cd mozzart-web-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your email for the API username header:
```env
VITE_API_USERNAME=your-email@example.com
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Production build with type checking
npm run preview      # Preview production build locally

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Check code with ESLint
npm run lint:fix     # Auto-fix ESLint errors
```

### Development Features

#### Debug Panel (DEV mode only)
Toggle with the bottom-right button to see:
- **Performance Metrics**: Virtual scrolling stats, DOM nodes saved
- **Grid Layout**: Responsive column count, total/rendered rows
- **Dimensions**: Viewport and content heights
- **Active State**: Filter count, favorites, animating matches
- **API Status**: Loading state, last fetch time, errors
- **Analytics Events**: Real-time event stream (last 10 events)

#### Viewing Analytics

**In Debug Panel:**
- Open debug panel (bottom-right button)
- Scroll to "📊 Analytics (Recent 10)" section
- See live events as they happen (auto-updates)

**In Browser Console:**
```javascript
// View all analytics events
window.analytics?.getEventQueue()

// View recent 10 events
window.analytics?.getEventQueue().slice(-10)

// Clear event queue
window.analytics?.clearEventQueue()
```

**Analytics are tracked for:**
- User actions (filters, favorites, search, sort, language)
- System events (API success/error, virtual scroll, race conditions)
- Performance metrics (memory cleanup, session timeout)

#### Hot Module Replacement (HMR)
- Instant updates without full page reload
- State preservation during development
- Fast refresh for Vue components

## 🧪 Testing

### Test Suite Overview
- **21 tests** across 3 test files
- **100% passing rate**
- **2 test types**: Unit tests & Component tests

### Test Files

#### `src/utils/api.test.ts` (5 tests)
- API client functionality
- Retry mechanism with exponential backoff
- Error handling and response validation
- HTTP header verification

#### `src/stores/matchesStore.test.ts` (9 tests)
- Pinia store state management
- Filter logic (search, sport, league, favorites)
- Available sports/leagues computation
- State initialization and updates

#### `src/components/matches/MatchCard.test.ts` (7 tests)
- Component rendering
- Status badge display (live/finished/upcoming)
- User interactions (favorite toggle)
- Edge cases (missing scores, time formatting)

### Running Tests

```bash
# Watch mode (recommended during development)
npm run test

# Single run
npm run test -- --run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

## 🏗 Architecture & Design Decisions

### State Management Pattern
- **Pinia Store**: Central source of truth for matches data
- **Composables**: Reusable logic (polling, animations)
- **Computed Properties**: Efficient filtering and derived state
- **LocalStorage**: Persistent favorites across sessions

### API Integration Strategy
- **Polling Interval**: 10 seconds
- **Retry Mechanism**: Exponential backoff (1s, 2s, 4s, 8s, 16s) - max 5 attempts
- **Error Handling**: 4-layer approach:
  1. API layer: Network errors, retries
  2. Store layer: Consecutive failure tracking
  3. UI layer: User-friendly error messages
  4. Component layer: Defensive coding (try-catch)

### Animation Implementation
- **Detection**: Compare previous vs current match lists by ID
- **Timing**: Exactly 1 second for both new and removed matches
- **Visual Feedback**:
  - New matches: Green border + background glow
  - Removed matches: Red border + fade out
- **Performance**: CSS transitions for GPU acceleration

### Virtual Scrolling Strategy
- **Activation**: Only when content exceeds viewport height
- **Row-based**: Virtualizes rows (1-3 columns per row) not individual cards
- **Responsive**: Dynamically adjusts column count (mobile: 1, tablet: 2, desktop: 3)
- **Library**: TanStack Virtual with `useWindowVirtualizer` for page-level scrolling

### Filter Architecture
- **Collapsible Panel**: Reduces UI clutter, starts collapsed
- **Priority Layout**: Most-used filters (favorites, sort) always visible
- **Real-time Search**: Instant filtering as user types
- **Multi-select**: Sport + leagues with visual active state
- **Reset**: One-click clear all filters with count badge

## ⚡ Performance Optimizations

### 1. Virtual Scrolling
- Only renders visible matches (~10-15 cards) instead of all (30-50+)
- Reduces DOM nodes by up to 90%
- Smooth scrolling with 1x viewport threshold

### 2. Computed Property Caching
- Vue automatically caches computed results
- Re-computes only when dependencies change
- Used for: filtered matches, available sports/leagues

### 3. Efficient Filtering
- Single-pass filtering algorithm
- Short-circuit evaluation
- Case-insensitive search with `toLowerCase()` cached

### 4. Component Optimization
- Proper `:key` usage in `v-for` loops
- Avoid unnecessary component re-renders
- Lazy loading of heavy components (future enhancement)

### 5. API Optimization
- Prevents polling during errors (waits for recovery)
- Reuses existing data during network issues
- Consecutive failure threshold before showing errors

## 📚 Library Choices & Justifications

### Core Framework: Vue 3.5 + Composition API
**Why Vue 3?**
- Modern reactive system with excellent performance
- Composition API provides better TypeScript support and code organization
- `<script setup>` syntax reduces boilerplate
- Excellent documentation and ecosystem

**Why Composition API over Options API?**
- Better TypeScript inference
- More flexible code organization via composables
- Easier testing and reuse of logic
- Industry standard for modern Vue development

### Build Tool: Vite 7.1
**Why Vite over Webpack/Create-Vue?**
- Lightning-fast HMR (Hot Module Replacement)
- Native ESM for development
- Optimized production builds with Rollup
- Zero-config TypeScript support
- Fast server start (~100ms vs 10s+ with Webpack)

### State Management: Pinia 3.0
**Why Pinia over Vuex?**
- Official recommended state management for Vue 3
- TypeScript-first design (better IntelliSense)
- Simpler API (no mutations, just actions)
- Excellent DevTools integration
- Modular by default (no need for modules)

### UI Framework: Tailwind CSS 4.1
**Why Tailwind over Bootstrap/Material UI?**
- Utility-first approach for rapid development
- No runtime JavaScript overhead
- Full customization without overriding styles
- Smaller bundle size (only includes used classes)
- Responsive design utilities built-in
- Consistency across the application

### Component Library: Radix Vue
**Why Radix Vue?**
- Headless UI primitives (unstyled, fully customizable)
- Accessibility (ARIA attributes) built-in
- Keyboard navigation support
- No design opinions (style with Tailwind)
- Small bundle size (tree-shakeable)
- Used as foundation for custom components

### Icons: Lucide Vue Next
**Why Lucide over Font Awesome/Heroicons?**
- Beautiful, consistent design
- Tree-shakeable (only import used icons)
- No CSS required
- Vue 3 native components
- Active development and frequent updates
- Open source and free

### Virtual Scrolling: @tanstack/vue-virtual
**Why TanStack Virtual over vue-virtual-scroller?**
- Framework-agnostic design (proven in React ecosystem)
- Excellent performance (used by major apps)
- Flexible API (row-based, grid support)
- Active maintenance by TanStack team
- TypeScript-first with great type definitions
- Window scrolling support (`useWindowVirtualizer`)

### Utilities: @vueuse/core
**Why VueUse?**
- Collection of essential Vue Composition utilities
- Well-tested and maintained
- Covers common needs (intervals, localStorage, etc.)
- Tree-shakeable
- Excellent TypeScript support
- Reduces custom code for common patterns

### Internationalization: vue-i18n 9.14
**Why vue-i18n?**
- Official i18n solution for Vue 3
- Composition API support
- TypeScript type-safe translations
- Pluralization and date/number formatting
- Lazy loading of locales
- Small bundle impact with tree-shaking

### Testing: Vitest 4.0 + @vue/test-utils
**Why Vitest over Jest?**
- Native ESM support (no complex config)
- Vite-powered (same config, same transforms)
- Faster test execution (~10x vs Jest)
- Built-in TypeScript support
- Compatible with Jest API (easy migration)
- Better watch mode and UI

**Why Happy DOM over jsdom?**
- 5-10x faster than jsdom
- Smaller memory footprint
- Good enough for Vue component tests
- Active development

### Styling Utilities
**tailwind-merge + clsx**
- Combined in a `cn()` utility function for class management
- `clsx`: Handles conditional class names with clean syntax
- `tailwind-merge`: Intelligently merges Tailwind classes and resolves conflicts (e.g., `px-4` + `px-2` = `px-2`)
- Used throughout all UI components (Button, Badge, Input, Card, etc.)
- Prevents duplicate utility classes and ensures Tailwind precedence
- Simple API: `cn('base', condition && 'conditional', 'override-class')`

---

## � Analytics Documentation

This project includes a comprehensive analytics system for tracking user interactions, system events, and performance metrics.

**📖 Full Analytics Guide:** See [ANALYTICS_GUIDE.md](./ANALYTICS_GUIDE.md) for detailed documentation on:
- How to view analytics (Debug Panel + Browser Console)
- All tracked event types
- Developer commands and filtering
- Testing and debugging analytics

**Quick Access:**
```javascript
// View all analytics events in browser console
window.analytics.getEventQueue()

// View recent 10 events
window.analytics.getEventQueue().slice(-10)

// Clear event queue
window.analytics.clearEventQueue()
```

---

## �📝 Additional Notes

### API Configuration
- **Endpoint**: `http://172.235.235.11/api/matches`
- **Required Header**: `username: <your-email>`
- **Polling**: Every 10 seconds
- **Retry**: Up to 5 attempts with exponential backoff

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

### Possible Future Enhancements
- E2E tests with Playwright
- PWA support for offline functionality
- WebSocket support for real-time updates (alternative to polling)
- Advanced analytics dashboard
- Match detail pages with statistics

---

**Built with ❤️ for Mozzart** | [Technical Assignment] | by Darko Kovac


