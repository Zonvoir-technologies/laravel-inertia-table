<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import type { ImageConfig, TableAction, TableColumn, TableRow } from '../types/table';
import BadgeColumn from './Column/BadgeColumn.vue';
import BooleanColumn from './Column/BooleanColumn.vue';
import DateColumn from './Column/DateColumn.vue';
import DateTimeColumn from './Column/DateTimeColumn.vue';
import ImageColumn from './Column/ImageColumn.vue';
import NumberColumn from './Column/NumberColumn.vue';
import TextColumn from './Column/TextColumn.vue';
import TableActions from './TableActions.vue';

type CellValueProps = {
  column: TableColumn;
  row: TableRow;
  rowIndex?: number;
  rowNumberStart?: number;
}

const props = withDefaults(
  defineProps<CellValueProps>(),
  {
    rowIndex: 0,
    rowNumberStart: 1,
  }
);

const image: ComputedRef<ImageConfig | null> = computed((): ImageConfig | null => props.row._column_images?.[props.column.attribute] ?? null);
const actionDropdown: ComputedRef<boolean> = computed((): boolean => Boolean(props.column.meta.asDropdown ?? props.column.meta.dropdown));
const rowActions: ComputedRef<TableAction[]> = computed((): TableAction[] => Array.isArray(props.row._actions) ? props.row._actions : []);
const serialNumber: ComputedRef<number> = computed((): number => props.rowNumberStart + props.rowIndex);
</script>

<template>
  <span v-if="column.type === 'serial-number'">
    {{ serialNumber }}
  </span>

  <TableActions
    v-else-if="column.type === 'action'"
    :actions="rowActions"
    :row="row"
    :dropdown="actionDropdown"
  />

  <ImageColumn
    v-else-if="column.type === 'image'"
    :column="column"
    :row="row"
    :image="image"
  />

  <ImageColumn
    v-else-if="image"
    :column="column"
    :row="row"
    :image="image"
    show-content
  >
    <BadgeColumn v-if="column.type === 'badge'" :column="column" :row="row" />
    <BooleanColumn v-else-if="column.type === 'boolean'" :column="column" :row="row" />
    <NumberColumn v-else-if="column.type === 'numeric'" :column="column" :row="row" />
    <DateColumn v-else-if="column.type === 'date'" :column="column" :row="row" />
    <DateTimeColumn v-else-if="column.type === 'date-time'" :column="column" :row="row" />
    <TextColumn v-else :column="column" :row="row" />
  </ImageColumn>

  <BadgeColumn v-else-if="column.type === 'badge'" :column="column" :row="row" />
  <BooleanColumn v-else-if="column.type === 'boolean'" :column="column" :row="row" />
  <NumberColumn v-else-if="column.type === 'numeric'" :column="column" :row="row" />
  <DateColumn v-else-if="column.type === 'date'" :column="column" :row="row" />
  <DateTimeColumn v-else-if="column.type === 'date-time'" :column="column" :row="row" />
  <TextColumn v-else :column="column" :row="row" />
</template>
