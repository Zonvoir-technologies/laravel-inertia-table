<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useRawValue } from '../../composables/useCellValue';
import type { TableCellValue, TableColumn, TableRow } from '../../types/table';

type NumberColumnProps = {
  column: TableColumn;
  row: TableRow;
}

const props = defineProps<NumberColumnProps>();
const rawValue: ComputedRef<TableCellValue> = useRawValue(props.column, props.row);

const stringMeta = (key: string, fallback = ''): string => {
  const value = props.column.meta[key];

  return typeof value === 'string' ? value : fallback;
};

const precision: ComputedRef<number | null> = computed((): number | null => {
  const value = props.column.meta.precision;

  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
});

const parseNumber = (value: TableCellValue): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue: string = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  const normalizedValue: string = trimmedValue.replace(/,/g, '');
  const numberValue: number = Number(normalizedValue);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const groupInteger = (value: string, separator: string): string => {
  if (separator === '') {
    return value;
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

const formattedValue: ComputedRef<string> = computed((): string => {
  const value: TableCellValue = rawValue.value;
  const placeholder: string = stringMeta('placeholder', '-');

  if (value === null || value === undefined || value === '') {
    return placeholder;
  }

  const numericValue: number | null = parseNumber(value);

  if (numericValue === null) {
    return String(value);
  }

  const fixedValue: string = precision.value === null
    ? String(numericValue)
    : numericValue.toFixed(precision.value);
  const isNegative: boolean = fixedValue.startsWith('-');
  const unsignedValue: string = isNegative ? fixedValue.slice(1) : fixedValue;
  const [integerValue = '0', decimalValue] = unsignedValue.split('.');
  const thousandsSeparator: string = stringMeta('thousandsSeparator', '');
  const decimalSeparator: string = stringMeta('decimalSeparator', '');
  const prefix: string = stringMeta('prefix');
  const suffix: string = stringMeta('suffix');
  const groupedInteger: string = groupInteger(integerValue, thousandsSeparator);
  const numberText: string = `${isNegative ? '-' : ''}${groupedInteger}${decimalValue !== undefined ? `${decimalSeparator}${decimalValue}` : ''}`;

  return `${prefix}${numberText}${suffix}`;
});
</script>

<template>
  <span>{{ formattedValue }}</span>
</template>
