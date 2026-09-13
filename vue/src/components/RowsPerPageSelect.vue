<script setup lang="ts">
import { computed, type WritableComputedRef } from 'vue';
import { useTableConfiguration } from '../config/tableConfig';

type RowsPerPageSelectProps = {
  modelValue: number;
  options: number[];
}

const props = defineProps<RowsPerPageSelectProps>();
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  change: [value: number];
}>();

const selected: WritableComputedRef<number> = computed({
  get: (): number => props.modelValue,
  set: (value: number | string): void => emit('change', Number(value)),
});
</script>

<template>
  <select
    v-model="selected"
    :class="['h-9 min-w-16 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none hover:bg-slate-50 focus:border-slate-400', tableConfig.darkMode.enabled ? 'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:border-slate-500' : '']"
    :aria-label="tableConfig.labels.rowsPerPage"
    data-test="rows-per-page-trigger"
  >
    <option
      v-for="option in options"
      :key="option"
      :value="option"
      data-test="rows-per-page-option"
    >
      {{ option }}
    </option>
  </select>
</template>
