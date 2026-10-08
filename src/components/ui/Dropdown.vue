<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface DropdownOption {
  value: string
  label: string
}

interface Props {
  options: DropdownOption[]
  modelValue: string
  /** Minimum width of dropdown menu (default: 160px) */
  minWidth?: string
}

const { minWidth = '160px' } = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Dropdown open state
 */
const isOpen = ref(false)

/**
 * Dropdown element ref
 */
const dropdownRef = ref<HTMLElement | null>(null)

/**
 * Toggle dropdown
 */
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

/**
 * Select option and close dropdown
 */
function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

/**
 * Close dropdown when clicking outside
 */
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

/**
 * Expose toggle method for parent components
 */
defineExpose({
  toggle: toggleDropdown,
  close: () => isOpen.value = false,
  open: () => isOpen.value = true,
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- Trigger Slot -->
    <div @click="toggleDropdown">
      <slot
        name="trigger"
        :is-open="isOpen"
        :selected="modelValue"
      />
    </div>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      :class="cn('absolute top-full left-0 mt-1 z-50 rounded-md border-2 border-border/80 p-1 shadow-xl overflow-hidden')"
      :style="`background-color: hsl(var(--card)); min-width: ${minWidth};`"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        :class="cn(
          'w-full text-left px-3 py-2 text-sm cursor-pointer transition-all duration-150',
          // First item
          index === 0 && 'rounded-t-sm',
          // Last item
          index === options.length - 1 && 'rounded-b-sm',
          // Selected state - lighter background, no border
          modelValue === option.value 
            ? 'bg-primary/20 text-primary font-semibold' 
            : 'text-foreground hover:bg-primary/30 hover:text-primary hover:translate-x-0.5 hover:font-medium'
        )"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
