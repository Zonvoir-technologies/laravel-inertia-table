<script setup lang="ts" generic="T extends TableRow">
import type { TableCellValue, TableColumn, TableDefinition, TableRow, TableRowKey } from '../types/table';
import CellValue from './CellValue.vue';
import TableCell from './TableCell.vue';
import TableRowComponent from './TableRow.vue';
import { useTableConfiguration } from '../config/tableConfig';

export type TableBodyProps<T extends TableRow> = {
  columns: TableColumn[];
  rows: T[];
  table?: TableDefinition<T>;
  stickyOffsets: Record<string, number>;
  stickySides: Record<string, 'left' | 'right'>;
  rowNumberStart?: number;
  autoVisit?: boolean;
  hasCellClickListener?: boolean;
}

export type CellClickPayload<T extends TableRow> = {
  row: T;
  column: TableColumn;
  value: TableCellValue;
  event: MouseEvent;
};

const props = withDefaults(
  defineProps<TableBodyProps<T>>(),
  {
    rowNumberStart: 1,
    autoVisit: true,
    hasCellClickListener: false,
  }
);
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  rowClick: [row: T, column: TableColumn | null, event: MouseEvent];
  cellClick: [payload: CellClickPayload<T>];
}>();

const columnFromEvent = (event: MouseEvent): TableColumn | null => {
  const target: Element | null = event.target instanceof Element ? event.target : null;
  const cell: HTMLElement | null | undefined = target?.closest<HTMLElement>('[data-column]');
  const attribute: string | undefined = cell?.dataset.column;

  return props.columns.find((column: TableColumn): boolean => column.attribute === attribute) ?? null;
};

const emitCellClick = (payload: CellClickPayload<TableRow>): void => {
  emit('cellClick', {
    ...payload,
    row: payload.row as T
  });
};

const renderKeyForRow = (row: T, rowIndex: number): TableRowKey | number => {
  const key: string | null | undefined = props.table?.rowSelectionKey;
  const value = key ? row[key] : null;

  return typeof value === 'string' || typeof value === 'number' ? value : rowIndex;
};

const emitRowClick = (payload: { row: T; event: MouseEvent }): void => {
  emit('rowClick', payload.row, columnFromEvent(payload.event), payload.event);
};
const cellValueFor = (row: T, column: TableColumn, rowIndex: number): TableCellValue =>
  (column.type === 'serial-number' ? props.rowNumberStart + rowIndex : row[column.attribute]) as TableCellValue;
</script>

<template>
  <tbody :class="tableConfig.classes.tbody">
    <TableRowComponent
      v-for="(row, rowIndex) in rows"
      :key="renderKeyForRow(row, rowIndex)"
      :row="row"
      @click="emitRowClick"
    >
      <slot
        name="row"
        :row="row"
        :row-index="rowIndex"
        :columns="columns"
        :emit-cell-click="emitCellClick"
      >
        <slot name="row-prefix" :row="row" :row-index="rowIndex" />
        <TableCell
          v-for="column in columns"
          :key="column.attribute"
          :column="column"
          :row="row"
          :value="cellValueFor(row, column, rowIndex)"
          clickable
          :auto-visit="autoVisit"
          :has-click-listener="hasCellClickListener"
          :sticky-offset="stickyOffsets[column.attribute]"
          :sticky-side="stickySides[column.attribute]"
          @click="emitCellClick"
        >
          <slot
            :name="`cell(${column.attribute})`"
            :column="column"
            :row="row"
            :row-index="rowIndex"
            :value="cellValueFor(row, column, rowIndex)"
          >
            <CellValue
              :column="column"
              :row="row"
              :row-index="rowIndex"
              :row-number-start="rowNumberStart"
            />
          </slot>
        </TableCell>
      </slot>
    </TableRowComponent>
  </tbody>
</template>
