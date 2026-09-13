<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { useDisplayValue } from '../../composables/useCellValue';
import type { TableColumn, TableRow } from '../../types/table';

type TextColumnProps = {
  column: TableColumn;
  row: TableRow;
}

const props = defineProps<TextColumnProps>();
const displayValue: ComputedRef<string> = useDisplayValue(props.column, props.row);
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
