<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { TableColumn, TableDefinition, TableResource, TableMetaValue } from '../types/table';
import type { TableApi } from '../composables/useTable';
import Switch from './Switch.vue';
import CommonButton from './Common/CommonButton.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import CommonIcon from './Common/CommonIcon.vue';
import { useTableConfiguration } from '../config/tableConfig';
import { useColumnPersistence } from '../composables/useColumnPersistence';

export type ToggleColumnsDropdownProps = {
  columns: TableColumn[];
  allColumns?: TableColumn[];
  isColumnVisible: (attribute: string) => boolean;
  reorderable?: boolean;
  tableApi?: TableApi | Pick<TableApi, 'reorderColumns'>;
  table?: TableDefinition | TableResource;
};

const props = withDefaults(defineProps<ToggleColumnsDropdownProps>(), {
  allColumns: undefined,
  reorderable: undefined,
  tableApi: undefined,
  table: undefined,
});
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  toggle: [attribute: string];
  reorder: [columns: string[]];
}>();

const canReorder: ComputedRef<boolean> = computed((): boolean => {
  if (typeof props.reorderable === 'boolean') {
    return props.reorderable;
  }
  return Boolean(props.table?.reorderable ?? (props.table?.meta?.reorderable as boolean | undefined));
});

const { persistColumnOrder, resetColumnOrder } = useColumnPersistence({
  table: props.table,
});

const search: Ref<string> = ref('');
const draggedAttr: Ref<string | null> = ref(null);
const dropTargetAttr: Ref<string | null> = ref(null);
const dropPosition: Ref<'before' | 'after' | null> = ref(null);

const activeColumnsList = computed((): TableColumn[] => {
  return props.allColumns && props.allColumns.length > 0 ? props.allColumns : props.columns;
});

const filteredColumns: ComputedRef<TableColumn[]> = computed((): TableColumn[] => {
  const term: string = search.value.trim().toLowerCase();

  if (!term) {
    return activeColumnsList.value;
  }

  return activeColumnsList.value.filter((column: TableColumn): boolean =>
    column.label.toLowerCase().includes(term) || column.attribute.toLowerCase().includes(term)
  );
});

const onDragStart = (event: DragEvent, attribute: string): void => {
  if (!canReorder.value) {
    return;
  }
  draggedAttr.value = attribute;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', attribute);
  }
};

const onDragOver = (event: DragEvent, attribute: string): void => {
  if (!canReorder.value || !draggedAttr.value || draggedAttr.value === attribute) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  const targetEl = event.currentTarget as HTMLElement;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    dropPosition.value = event.clientY < midY ? 'before' : 'after';
    dropTargetAttr.value = attribute;
  }
};

const onDragLeave = (_event: DragEvent, attribute: string): void => {
  if (dropTargetAttr.value === attribute) {
    dropTargetAttr.value = null;
    dropPosition.value = null;
  }
};

const onDrop = (_event: DragEvent, targetAttribute: string): void => {
  if (!canReorder.value) {
    return;
  }
  const source = draggedAttr.value;
  if (!source || source === targetAttribute) {
    onDragEnd();
    return;
  }

  const currentAttrs = activeColumnsList.value.map((c: TableColumn) => c.attribute);
  const fromIndex = currentAttrs.indexOf(source);
  if (fromIndex === -1 || !currentAttrs.includes(targetAttribute)) {
    onDragEnd();
    return;
  }

  const updatedAttrs = [...currentAttrs];
  const [moved] = updatedAttrs.splice(fromIndex, 1);
  const targetIdx = updatedAttrs.indexOf(targetAttribute);
  const insertIndex = dropPosition.value === 'before' ? targetIdx : targetIdx + 1;
  updatedAttrs.splice(Math.max(0, insertIndex), 0, moved);

  emit('reorder', updatedAttrs);
  if (props.tableApi && typeof props.tableApi.reorderColumns === 'function') {
    props.tableApi.reorderColumns(updatedAttrs);
  }

  persistColumnOrder(updatedAttrs);
  onDragEnd();
};

const onDragEnd = (): void => {
  draggedAttr.value = null;
  dropTargetAttr.value = null;
  dropPosition.value = null;
};

const handleReset = async (): Promise<void> => {
  await resetColumnOrder();

  const metaCols = props.table?.meta?.columns;
  const originalOrder = Array.isArray(metaCols)
    ? metaCols.map((c) => {
        if (typeof c === 'string') return c;
        if (typeof c === 'object' && c !== null) {
          const col = c as TableColumn | Record<string, TableMetaValue>;
          return String(col.attribute ?? col.key ?? col.name ?? '');
        }
        return '';
      }).filter(Boolean)
    : [];

  if (originalOrder.length > 0) {
    emit('reorder', originalOrder);
    if (props.tableApi && typeof props.tableApi.reorderColumns === 'function') {
      props.tableApi.reorderColumns(originalOrder);
    }
  }
};
</script>

<template>
  <CommonDropdown
    :width="canReorder ? 230 : 210"
    :offset="8"
    align="start"
  >
    <template #trigger="{ toggle, open }">
      <CommonButton
        type="button"
        variant="outline"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="toggle"
        leading-icon="columns"
      >
        {{ tableConfig.labels.columns }}
      </CommonButton>
    </template>

    <template #default>
      <div :class="tableConfig.classes.dropdownHeader">
        {{ tableConfig.labels.toggleColumns }}
      </div>

      <div :class="tableConfig.classes.dropdownSearchWrapper">
        <input
          v-model="search"
          type="search"
          :class="tableConfig.classes.dropdownSearchInput"
          :placeholder="tableConfig.labels.toggleColumnSearch"
          @click.stop
        >
      </div>

      <div class="max-h-72 overflow-y-auto py-1">
        <div
          v-for="column in filteredColumns"
          :key="column.attribute"
          :draggable="canReorder ? 'true' : undefined"
          tabindex="0"
          :class="[
            tableConfig.classes.dropdownItem,
            canReorder ? tableConfig.classes.reorderDropdownItem : '',
            canReorder && draggedAttr === column.attribute ? tableConfig.classes.reorderDraggingHeaderCell : '',
            canReorder && dropTargetAttr === column.attribute && dropPosition === 'before' ? tableConfig.classes.reorderDropTargetTop : '',
            canReorder && dropTargetAttr === column.attribute && dropPosition === 'after' ? tableConfig.classes.reorderDropTargetBottom : '',
          ]"
          role="menuitemcheckbox"
          :aria-checked="isColumnVisible(column.attribute)"
          @dragstart="canReorder ? onDragStart($event, column.attribute) : undefined"
          @dragover="canReorder ? onDragOver($event, column.attribute) : undefined"
          @dragleave="canReorder ? onDragLeave($event, column.attribute) : undefined"
          @drop="canReorder ? onDrop($event, column.attribute) : undefined"
          @dragend="canReorder ? onDragEnd() : undefined"
          @click="emit('toggle', column.attribute)"
        >
          <span
            v-if="canReorder"
            :class="tableConfig.classes.dragHandle"
            :title="tableConfig.labels.dragToReorder"
          >
            <CommonIcon
              v-if="tableConfig.icons.dragHandle"
              :icon="tableConfig.icons.dragHandle"
              class="h-3.5 w-3.5"
            />
          </span>

          <span class="truncate">
            {{ column.label }}
          </span>

          <span
            class="ml-auto pl-2"
            @click.stop
          >
            <Switch
              size="sm"
              :checked="isColumnVisible(column.attribute)"
              @update:checked="emit('toggle', column.attribute)"
            />
          </span>
        </div>

        <div
          v-if="filteredColumns.length === 0"
          :class="tableConfig.classes.dropdownEmpty"
        >
          {{ tableConfig.labels.noColumnsFound }}
        </div>
      </div>

      <div
        v-if="canReorder"
        class="border-t border-slate-100 dark:border-slate-800 p-1.5"
      >
        <button
          type="button"
          :class="tableConfig.classes.reorderResetButton"
          @click.stop="handleReset"
        >
          {{ tableConfig.labels.resetOrder }}
        </button>
      </div>
    </template>
  </CommonDropdown>
</template>
