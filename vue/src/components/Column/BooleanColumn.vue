<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useRawValue } from '../../composables/useCellValue';
import type { TableCellValue, TableColumn, TableRow } from '../../types/table';
import { twMerge } from "tailwind-merge";
import CommonIcon from "../Common/CommonIcon.vue";
import { useTableConfiguration } from '../../config/tableConfig';

type BooleanColumnProps = {
  column: TableColumn;
  row: TableRow;
}

const props = defineProps<BooleanColumnProps>();
const tableConfig = useTableConfiguration();
const rawValue: ComputedRef<TableCellValue> = useRawValue(props.column, props.row);

function toBool(value: TableCellValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }
  return Boolean(value);
}

const boolValue: ComputedRef<boolean> = computed((): boolean => toBool(rawValue.value));

const explicitIcon: ComputedRef<string> = computed((): string => {
  const meta: TableColumn['meta'] = props.column.meta;
  const value = boolValue.value ? meta.trueIcon : meta.falseIcon;
  return typeof value === 'string' && value.length > 0 ? value : '';
});

const defaultIconComponent: ComputedRef<string> = computed((): string =>
  boolValue.value ? 'basil:check-solid' : 'basil:cross-solid'
);

const label: ComputedRef<string> = computed((): string => {
  const meta: TableColumn['meta'] = props.column.meta;
  const value = boolValue.value ? meta.trueLabel : meta.falseLabel;
  return typeof value === 'string' ? value : boolValue.value ? 'Yes' : 'No';
});

const isIconMode: ComputedRef<boolean> = computed((): boolean => props.column.meta.displayAs === 'icon');

const iconClasses: ComputedRef<string> = computed((): string =>
  twMerge([
    'h-5 w-5 shrink-0',
    boolValue.value ? `text-green-600${tableConfig.value.darkMode.enabled ? ' dark:text-green-300' : ''}` : `text-red-600${tableConfig.value.darkMode.enabled ? ' dark:text-red-300' : ''}`,
    props.column.cellClass
  ].filter(Boolean).join(' '))
);
</script>

<template>
  <span
    v-if="isIconMode"
    class="inline-flex h-7 w-7 items-center justify-center rounded-full"
    :class="boolValue ? `bg-green-100${tableConfig.darkMode.enabled ? ' dark:bg-green-950' : ''}` : `bg-red-100${tableConfig.darkMode.enabled ? ' dark:bg-red-950' : ''}`"
  >
    <CommonIcon
      :icon="explicitIcon || defaultIconComponent"
      :class="iconClasses"
    />
  </span>

  <span v-else>{{ label }}</span>
</template>
