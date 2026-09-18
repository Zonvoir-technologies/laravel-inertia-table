import { computed, ref, unref, type ComputedRef, type MaybeRef, type Ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { normalizeTable } from '../helpers/normalizeTable';
import { visitUrl } from '../helpers/visitUrl';
import type { TableAction, TableDefinition, TableMetaValue, TableResource, TableRow, TableRowKey } from '../types/table';

export type ActionExecutionPayload = { action: TableAction; response?: TableMetaValue };
export type ActionSelectionMode = 'page' | 'all';

export type UseActionsOptions = {
  selectedKeys?: MaybeRef<TableRowKey[]>;
  selectionMode?: MaybeRef<ActionSelectionMode>;
  onExecuted?: (payload: ActionExecutionPayload) => void;
}

export type UseActionsApi = {
  selectedItems: Ref<TableRowKey[]>;
  loadingAction: Ref<string | null>;
  isPerformingAction: ComputedRef<boolean>;
  allItemsAreSelected: ComputedRef<boolean>;
  toggleItem: (key: TableRowKey | '*') => void;
  clearSelection: () => void;
  performAction: (action: TableAction, keys?: TableRowKey[], selectionMode?: ActionSelectionMode) => void;
}

const isTableDefinition = <T extends TableRow>(
  table: TableResource<T> | TableDefinition<T> | undefined
): table is TableDefinition<T> => {
  return (
    Boolean(table) &&
    Array.isArray((table as TableDefinition<T>).rows) &&
    Array.isArray((table as TableDefinition<T>).columns) &&
    typeof (table as TableDefinition<T>).pagination === 'object' &&
    typeof (table as TableDefinition<T>).sorting === 'object'
  );
};

const normalizeCurrentTable = <T extends TableRow>(table: MaybeRef<TableResource<T> | TableDefinition<T> | undefined>): TableDefinition<T> | null => {
  const currentTable: TableResource<T> | TableDefinition<T> | undefined = unref(table);

  if (!currentTable) {
    return null;
  }

  return isTableDefinition(currentTable) ? currentTable : normalizeTable(currentTable);
};

const rowKey = <T extends TableRow>(table: TableDefinition<T>, row: T): TableRowKey | null => {
  const key: string | null = table.rowSelectionKey;

  if (!key) {
    return null;
  }

  const value = row[key];

  return typeof value === 'string' || typeof value === 'number' ? value : null;
};

export function useActions<T extends TableRow = TableRow>(
  table: MaybeRef<TableResource<T> | TableDefinition<T> | undefined>,
  options: UseActionsOptions = {}
): UseActionsApi {
  const selectedItems: Ref<TableRowKey[]> = ref([]);
  const loadingAction: Ref<string | null> = ref(null);

  const currentSelectedKeys = (): TableRowKey[] => options.selectedKeys ? [...unref(options.selectedKeys)] : [...selectedItems.value];

  const currentSelectionMode = (): ActionSelectionMode => options.selectionMode ? unref(options.selectionMode) : 'page';

  const selectableKeys: ComputedRef<TableRowKey[]> = computed((): TableRowKey[] => {
    const currentTable: TableDefinition<T> | null = normalizeCurrentTable(table);

    if (!currentTable) {
      return [];
    }

    return currentTable.rows
      .filter((row: T): boolean => row._selectable !== false)
      .map((row: T): TableRowKey | null => rowKey(currentTable, row))
      .filter((key): key is TableRowKey => key !== null);
  });

  const allItemsAreSelected: ComputedRef<boolean> = computed((): boolean => {
    const keys: TableRowKey[] = selectableKeys.value;
    const selected: TableRowKey[] = currentSelectedKeys();

    return keys.length > 0 && keys.every((key: TableRowKey): boolean => selected.includes(key));
  });

  const toggleItem = (key: TableRowKey | '*'): void => {
    if (options.selectedKeys) {
      return;
    }

    if (key === '*') {
      selectedItems.value = allItemsAreSelected.value ? [] : [...selectableKeys.value];
      return;
    }

    selectedItems.value = selectedItems.value.includes(key)
      ? selectedItems.value.filter((selectedKey: TableRowKey): boolean => selectedKey !== key)
      : [...selectedItems.value, key];
  };

  const clearSelection = (): void => {
    if (!options.selectedKeys) {
      selectedItems.value = [];
    }
  };

  const performAction = (action: TableAction, keys: TableRowKey[] = currentSelectedKeys(), selectionMode: ActionSelectionMode = currentSelectionMode()): void => {
    if (action.url?.url) {
      if (action.url.target) {
        window.open(action.url.url, action.url.target);
        options.onExecuted?.({ action });
        return;
      }

      visitUrl(action.url.url, {
        method: action.url.method ?? 'get',
        preserveScroll: action.url.preserveScroll ?? false,
        preserveState: action.url.preserveState ?? false
      });
      return;
    }

    if (!action.endpoint || action.type === 'custom') {
      options.onExecuted?.({ action });
      return;
    }

    const currentTable: TableDefinition<T> | null = normalizeCurrentTable(table);

    if (!currentTable) {
      return;
    }

    loadingAction.value = action.key;
    router.visit(action.endpoint, {
      method: 'post',
      data: {
        table: currentTable.meta.table,
        action: action.key,
        keys,
        selectionMode,
        data: action.data ?? {}
      },
      preserveScroll: true,
      preserveState: false,
      onFinish: (): void => {
        loadingAction.value = null;
        options.onExecuted?.({ action });
      }
    });
  };

  return {
    selectedItems,
    loadingAction,
    isPerformingAction: computed((): boolean => loadingAction.value !== null),
    allItemsAreSelected,
    toggleItem,
    clearSelection,
    performAction
  };
}
