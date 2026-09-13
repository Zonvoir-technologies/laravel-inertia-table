<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  label?: string;
}

withDefaults(defineProps<SpinnerProps>(), {
  size: 'sm',
  color: 'text-white',
  label: 'Loading...',
});

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};
</script>

<template>
  <div class="inline-flex items-center justify-center" role="status" :aria-label="label">
    <div
      :class="[
        'animate-spin rounded-full border-solid border-current border-t-transparent',
        sizeClasses[size],
        color,
      ]"
    />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
