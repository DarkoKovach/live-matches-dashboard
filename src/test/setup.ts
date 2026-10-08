/**
 * Vitest setup file
 * Runs before all test files
 */

import { config } from '@vue/test-utils'

// Configure Vue Test Utils globally
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n
}
