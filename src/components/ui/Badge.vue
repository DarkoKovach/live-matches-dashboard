<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
  class?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  class: '',
})

const badgeClasses = computed(() =>
  cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
      'border-transparent bg-primary text-primary-foreground hover:bg-primary/80':
        props.variant === 'default',
      'border-transparent bg-muted text-muted-foreground hover:bg-muted/80':
        props.variant === 'secondary',
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80':
        props.variant === 'destructive',
      'text-foreground': props.variant === 'outline',
      'border-transparent bg-green-500 text-white hover:bg-green-600':
        props.variant === 'success',
    },
    props.class
  )
)
</script>

<template>
  <div :class="badgeClasses">
    <slot />
  </div>
</template>
