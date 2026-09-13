<script setup lang="ts">
import type { TableColumn, TableSorting } from '../types/table';
import TableCell from './TableCell.vue';
import TableHeaderDropdown from './TableHeaderDropdown.vue';
import CommonTooltip from './Common/CommonTooltip.vue';
import { useTableConfiguration } from '../config/tableConfig';

type SortDirection = 'asc' | 'desc';

type TableHeaderProps = {
  columns: TableColumn[];
  sorting: TableSorting;
  sticky?: boolean;
  stickyOffsets: Record<string, number>;
  stickySides: Record<string, 'left' | 'right'>;
  isColumnSticky: (column: TableColumn) => boolean;
}

defineProps<TableHeaderProps>();
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  sort: [payload: { column: TableColumn; direction: SortDirection }];
  stick: [column: TableColumn];
  hide: [column: TableColumn];
}>();

const canStick = (column: TableColumn): boolean => Boolean(column.stickable ?? column.sticky ?? column.meta.defaultToSticky);
const isHeaderInteractive = (column: TableColumn): boolean =>
  (column.toggleable || column.sortable || canStick(column));

const alignmentClass = (column: TableColumn): string =>
  column.alignment === 'right' ? 'justify-end' : column.alignment === 'center' ? 'justify-center' : 'justify-start';

const sortColumn = (column: TableColumn, direction: SortDirection): void => {
  if (!column.sortable) {
    return;
  }

  emit('sort', { column, direction });
};

const stickColumn = (column: TableColumn): void => {
  if (!canStick(column)) {
    return;
  }

  emit('stick', column);
};

const hideColumn = (column: TableColumn): void => {
  if (!column.toggleable) {
    return;
  }

  emit('hide', column);
};
</script>

<template>
  <thead :class="[tableConfig.classes.thead, sticky ? 'sticky top-0 z-50' : 'relative z-50']">
  <tr :class="tableConfig.classes.headerRow">
    <slot name="prefix" />
    <TableCell
      v-for="column in columns"
      :key="column.attribute"
      as="th"
      :column="column"
      :sticky-offset="stickyOffsets[column.attribute]"
      :sticky-side="stickySides[column.attribute]"
    >
      <TableHeaderDropdown
        v-if="isHeaderInteractive(column)"
        :column="column"
        :can-stick="canStick(column)"
        :is-sticky="isColumnSticky(column)"
        :trigger-class="[tableConfig.classes.headerButton, alignmentClass(column)]"
        @sort="(direction) => sortColumn(column, direction)"
        @stick="stickColumn(column)"
        @hide="hideColumn(column)"
      >
        <slot name="header" :column="column">
          <slot :name="`header(${column.attribute})`" :column="column">
            <CommonTooltip v-if="column.tooltip" :text="column.tooltip">
              <span class="min-w-0 truncate text-sm">{{ column.label }}</span>
            </CommonTooltip>
            <span v-else class="min-w-0 truncate text-sm">{{ column.label }}</span>
          </slot>
        </slot>
      </TableHeaderDropdown>
      <span v-else :class="[tableConfig.classes.headerButton, alignmentClass(column)]">
        <slot name="header" :column="column">
          <slot :name="`header(${column.attribute})`" :column="column">
            <CommonTooltip v-if="column.tooltip" :text="column.tooltip">
              <span class="min-w-0 truncate text-sm">{{ column.label }}</span>
            </CommonTooltip>
            <span v-else class="min-w-0 truncate text-sm">{{ column.label }}</span>
          </slot>
        </slot>
      </span>
    </TableCell>
  </tr>
  </thead>
</template>
