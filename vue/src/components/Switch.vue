<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  size?: SwitchSize;
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
  }
);

const emit = defineEmits<{
  'update:checked': [boolean];
}>();

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
      checked ? 'bg-black' : 'bg-slate-300',
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
