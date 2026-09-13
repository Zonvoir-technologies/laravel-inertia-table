<script setup lang="ts" generic="T extends TableRow">
import type { TableRow } from '../types/table';
import { useTableConfiguration } from '../config/tableConfig';

export type TableRowProps<T extends TableRow> = {
  row: T;
  clickable?: boolean;
}

export type RowClickPayload<T extends TableRow> = { row: T; event: MouseEvent };

const tableConfig = useTableConfiguration();

withDefaults(
  defineProps<TableRowProps<T>>(),
  {
    clickable: true
  }
);

defineEmits<{
  click: [payload: RowClickPayload<T>];
}>();
</script>

<template>
  <tr
    :class="[
      tableConfig.classes.row,
      clickable ? 'cursor-pointer' : ''
    ]"
    @click="$emit('click', { row, event: $event })"
  >
    <slot />
  </tr>
</template>
