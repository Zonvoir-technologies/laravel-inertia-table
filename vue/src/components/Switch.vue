<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  size?: SwitchSize;
  color?: string;
}

interface SwitchClasses {
  switch: string;
  thumb: string;
  on: string;
  off: string;
}

const props = withDefaults(
  defineProps<SwitchProps>(),
  {
    disabled: false,
    size: 'md',
    color: 'primary',
  }
);

const emit = defineEmits<{
  'update:checked': [boolean];
}>();

const normalizeColor = (color: string = 'primary'): string => {
  const normalized = color.toLowerCase();
  const aliases: Record<string, string> = {
    default: 'primary',
    destructive: 'red',
    danger: 'red',
    success: 'green',
    warning: 'amber',
    muted: 'gray',
  };

  return aliases[normalized] ?? normalized;
};

const switchTrackClasses: ComputedRef<string> = computed((): string => {
  const color = normalizeColor(props.color);

  if (color === 'primary') {
    const light = props.checked ? 'bg-[var(--zt-primary,#0f172a)]' : 'bg-slate-300';
    const dark = props.checked ? 'dark:bg-[var(--zt-primary,#0f172a)]' : 'dark:bg-slate-700';

    return `${light} ${dark}`;
  }

  const light = props.checked ? `bg-${color}-500` : 'bg-slate-300';
  const dark = props.checked ? `dark:bg-${color}-500` : 'dark:bg-slate-700';

  return `${light} ${dark}`;
});

const sizes: ComputedRef<SwitchClasses> = computed((): SwitchClasses => {
  switch (props.size) {
    case 'sm':
      return {
        switch: 'h-4 w-7',
        thumb: 'h-3 w-3',
        on: 'translate-x-3.5',
        off: 'translate-x-0.5',
      };

    case 'lg':
      return {
        switch: 'h-8 w-14',
        thumb: 'h-6 w-6',
        on: 'translate-x-7',
        off: 'translate-x-1',
      };

    default:
      return {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        on: 'translate-x-5',
        off: 'translate-x-0.5',
      };
  }
});
</script>

<template>
  <button
    type="button"
    role="switch"
    :disabled="disabled"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    class="cursor-pointer inline-flex shrink-0 items-center rounded-full transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      sizes.switch,
      switchTrackClasses,
    ]"
    @click="emit('update:checked', !checked)"
  >
    <span
      class="rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
      :class="[
        sizes.thumb,
        checked ? sizes.on : sizes.off,
      ]"
    />
  </button>
</template>
