<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useTableConfiguration } from '../../config/tableConfig';
interface CheckboxProps {
  modelValue: boolean;
  disabled?: boolean;
  ariaLabel: string;
}

const props = defineProps<CheckboxProps>();
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const emitChecked = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked);
};

const checkboxClasses: ComputedRef<string> = computed((): string => {
  const light = props.modelValue ? 'border-slate-950 bg-slate-950' : 'border-slate-300 bg-white';
  const dark = props.modelValue ? 'dark:border-slate-100 dark:bg-slate-100' : 'dark:border-slate-600 dark:bg-slate-950';
  return tableConfig.value.darkMode.enabled ? `${light} ${dark}` : light;
});
</script>

<template>
  <label
    class="relative inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px]"
    :class="{ 'cursor-not-allowed opacity-50': props.disabled }"
  >
    <input
      type="checkbox"
      class="absolute inset-0 h-full w-full cursor-pointer appearance-none"
      :checked="props.modelValue"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel"
      @change="emitChecked"
    >

    <span
      class="pointer-events-none flex h-5 w-5 items-center justify-center rounded-[4px] border-2 transition-colors"
      :class="checkboxClasses"
    >
      <svg
        v-if="props.modelValue"
        :class="['absolute h-3 w-3 text-white', tableConfig.darkMode.enabled ? 'dark:text-slate-950' : '']"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 6.2 4.8 8.5 9.5 3.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </label>
</template>
