<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useRawValue } from '../../composables/useCellValue';
import { formatDateValue } from '../../helpers/formatDateValue';
import type { TableCellValue, TableColumn, TableRow } from '../../types/table';

type DateColumnProps = {
  column: TableColumn;
  row: TableRow;
}

const props = defineProps<DateColumnProps>();
const rawValue: ComputedRef<TableCellValue> = useRawValue(props.column, props.row);
const displayValue: ComputedRef<string> = computed((): string => formatDateValue(props.column, rawValue.value, true));
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
