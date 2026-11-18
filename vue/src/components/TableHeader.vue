<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { TableColumn, TableDefinition, TableResource, TableSorting } from '../types/table';
import type { TableApi } from '../composables/useTable';
import TableCell from './TableCell.vue';
import TableHeaderDropdown from './TableHeaderDropdown.vue';
import CommonTooltip from './Common/CommonTooltip.vue';
import { useTableConfiguration } from '../config/tableConfig';
import { useColumnPersistence } from '../composables/useColumnPersistence';

type SortDirection = 'asc' | 'desc';

export type TableHeaderProps = {
  columns: TableColumn[];
  allColumns?: TableColumn[];
  sorting: TableSorting;
  sticky?: boolean;
  stickyOffsets: Record<string, number>;
  stickySides: Record<string, 'left' | 'right'>;
  isColumnSticky: (column: TableColumn) => boolean;
  reorderable?: boolean;
  tableApi?: TableApi | Pick<TableApi, 'reorderColumns'>;
  table?: TableDefinition | TableResource;
};

const props = withDefaults(defineProps<TableHeaderProps>(), {
  allColumns: undefined,
  sticky: false,
  reorderable: undefined,
  tableApi: undefined,
  table: undefined,
});
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  sort: [payload: { column: TableColumn; direction: SortDirection }];
  stick: [column: TableColumn];
  hide: [column: TableColumn];
  reorder: [columns: string[]];
}>();

const canReorder: ComputedRef<boolean> = computed((): boolean => {
  if (typeof props.reorderable === 'boolean') {
    return props.reorderable;
  }
  return Boolean(props.table?.reorderable ?? (props.table?.meta?.reorderable as boolean | undefined));
});

const { persistColumnOrder } = useColumnPersistence({
  table: props.table,
});

const draggedAttr: Ref<string | null> = ref(null);
const dropTargetAttr: Ref<string | null> = ref(null);
const dropSide: Ref<'left' | 'right' | null> = ref(null);

const canStick = (column: TableColumn): boolean =>
  Boolean(column.stickable ?? column.sticky ?? column.meta?.defaultToSticky);

const isHeaderInteractive = (column: TableColumn): boolean =>
  Boolean(column.toggleable || column.sortable || canStick(column));

const alignmentClass = (column: TableColumn): string =>
  column.alignment === 'right'
    ? 'justify-end'
    : column.alignment === 'center'
      ? 'justify-center'
      : 'justify-start';

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

const onDragStart = (event: DragEvent, column: TableColumn): void => {
  if (!canReorder.value) {
    return;
  }
  const target = event.target as HTMLElement | null;
  if (target && target.closest('button, [role="button"], input, a')) {
    event.preventDefault();
    return;
  }

  draggedAttr.value = column.attribute;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', column.attribute);
  }
};

const onDragOver = (event: DragEvent, column: TableColumn): void => {
  if (!canReorder.value || !draggedAttr.value || draggedAttr.value === column.attribute) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  const th = event.currentTarget as HTMLElement | null;
  if (th) {
    const rect = th.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    dropSide.value = event.clientX < midX ? 'left' : 'right';
    dropTargetAttr.value = column.attribute;
  }
};

const onDragLeave = (_event: DragEvent, column: TableColumn): void => {
  if (dropTargetAttr.value === column.attribute) {
    dropTargetAttr.value = null;
    dropSide.value = null;
  }
};

const onDrop = (event: DragEvent, targetColumn: TableColumn): void => {
  if (!canReorder.value) {
    return;
  }
  event.preventDefault();
  const source = draggedAttr.value;
  if (!source || source === targetColumn.attribute) {
    onDragEnd();
    return;
  }

  const currentAttrs = props.columns.map((c: TableColumn) => c.attribute);
  const fromIndex = currentAttrs.indexOf(source);
  const toIndex = currentAttrs.indexOf(targetColumn.attribute);

  if (fromIndex === -1 || toIndex === -1) {
    onDragEnd();
    return;
  }

  const updated = [...currentAttrs];
  const [moved] = updated.splice(fromIndex, 1);
  const targetIdx = updated.indexOf(targetColumn.attribute);
  const insertIndex = dropSide.value === 'left' ? targetIdx : targetIdx + 1;
  updated.splice(Math.max(0, insertIndex), 0, moved);

  let finalOrder = updated;
  if (props.allColumns && props.allColumns.length > 0) {
    const allAttrs = props.allColumns.map((c: TableColumn) => c.attribute);
    const fromAll = allAttrs.indexOf(source);
    if (fromAll !== -1 && allAttrs.includes(targetColumn.attribute)) {
      const allUpdated = [...allAttrs];
      const [movedAll] = allUpdated.splice(fromAll, 1);
      const allTargetIdx = allUpdated.indexOf(targetColumn.attribute);
      const allInsertIndex = dropSide.value === 'left' ? allTargetIdx : allTargetIdx + 1;
      allUpdated.splice(Math.max(0, allInsertIndex), 0, movedAll);
      finalOrder = allUpdated;
    }
  }

  emit('reorder', finalOrder);
  if (props.tableApi && typeof props.tableApi.reorderColumns === 'function') {
    props.tableApi.reorderColumns(finalOrder);
  }

  persistColumnOrder(finalOrder);
  onDragEnd();
};

const onDragEnd = (): void => {
  draggedAttr.value = null;
  dropTargetAttr.value = null;
  dropSide.value = null;
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
        :draggable="canReorder ? 'true' : undefined"
        :class="[
          canReorder ? tableConfig.classes.reorderableHeaderCell : '',
          canReorder && draggedAttr === column.attribute ? tableConfig.classes.reorderDraggingHeaderCell : '',
          canReorder && dropTargetAttr === column.attribute && dropSide === 'left' ? tableConfig.classes.reorderDropTargetLeft : '',
          canReorder && dropTargetAttr === column.attribute && dropSide === 'right' ? tableConfig.classes.reorderDropTargetRight : '',
        ]"
        @dragstart="canReorder ? onDragStart($event, column) : undefined"
        @dragover="canReorder ? onDragOver($event, column) : undefined"
        @dragleave="canReorder ? onDragLeave($event, column) : undefined"
        @drop="canReorder ? onDrop($event, column) : undefined"
        @dragend="canReorder ? onDragEnd() : undefined"
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
