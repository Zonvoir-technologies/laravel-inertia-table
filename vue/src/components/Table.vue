<script setup lang="ts" generic="T extends TableRow">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch, type ComponentInternalInstance, type ComputedRef, type Ref, type Slots } from 'vue';
import { useTable, type TableApi } from '../composables/useTable';
import { useActions, type UseActionsApi } from '../composables/useActions';
import { provideTableContext } from '../composables/useTableContext';
import { normalizeTable } from '../helpers/normalizeTable';
import { visitUrl } from '../helpers/visitUrl';
import type { TableAction, TableCellValue, TableColumn, TableDefinition, TableExport, TableEmptyState, TableErrorState as TableErrorStateConfig, TableMetaValue, TablePagination, TableResource, TableRow, TableRowKey, TableSorting, TableUrl, TableUrlValue } from '../types/table';
import { provideTableConfiguration, type TableConfiguration } from '../config/tableConfig';
import EmptyState from './EmptyState.vue';
import LoadingState from './LoadingState.vue';
import TableErrorState from './TableErrorState.vue';
import CellValue from './CellValue.vue';
import TablePaginationComponent from './TablePagination.vue';
import TableBody from './TableBody.vue';
import TableCell from './TableCell.vue';
import TableHeader from './TableHeader.vue';
import ToggleColumnsDropdown from './ToggleColumnsDropdown.vue';
import CommonCheckbox from "./Common/CommonCheckbox.vue";
import TableBulkActions from "./TableBulkActions.vue";
import TableExports from "./TableExports.vue";
import CommonIcon from "./Common/CommonIcon.vue";

export type TableProps<T extends TableRow> = {
  table?: TableResource<T> | TableDefinition<T>;
  loading?: boolean;
  showColumnToggle?: boolean;
  selectable?: boolean;
  autoVisit?: boolean;
  searchDebounce?: number;
  config?: TableConfiguration;
}

export type CellClickPayload<T extends TableRow> = { row: T; column: TableColumn; value: TableCellValue; event: MouseEvent };
export type SelectionMode = 'page' | 'all';
type QueryStateKey = 'columns' | 'cursor' | 'direction' | 'page' | 'perPage' | 'search' | 'sort' | 'sticky';
type QueryValue = string | number | string[] | null;
type SortPayload = { column: TableColumn; direction: 'asc' | 'desc' };

const props = withDefaults(
  defineProps<TableProps<T>>(),
  {
    loading: false,
    showColumnToggle: true,
    selectable: true,
    autoVisit: true,
    searchDebounce: 300,
    config: undefined
  }
);

const emit = defineEmits<{
  'row-click': [row: T, column: TableColumn | null, event: MouseEvent];
  'cell-click': [payload: CellClickPayload<T>];
  'search-change': [value: string];
  'per-page-change': [value: number];
  'page-click': [url: string | null];
  retry: [];
}>();

const isTableDefinition = (
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

const instance: ComponentInternalInstance | null = getCurrentInstance();
const slots: Slots = useSlots();
const tableConfig = provideTableConfiguration(computed((): TableConfiguration | undefined => props.config));

const tableDefinition: ComputedRef<TableDefinition<T>> = computed((): TableDefinition<T> =>
  isTableDefinition(props.table) ? props.table : normalizeTable<T>(props.table ?? {})
);
provideTableContext(tableDefinition);

const tableApi: TableApi<T> = useTable<T>(tableDefinition);
const tableElement: Ref<HTMLTableElement | null> = ref(null);
const stickyOffsets: Ref<Record<string, number>> = ref({});
const stickySides: Ref<Record<string, 'left' | 'right'>> = ref({});
const selectedRows: Ref<Set<TableRowKey>> = ref(new Set<TableRowKey>());
const selectionMode: Ref<SelectionMode> = ref('page');
const localSearch: Ref<string> = ref('');
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
let resizeObserver: ResizeObserver | undefined;

const stickyHeader: ComputedRef<boolean> = computed((): boolean => Boolean(tableDefinition.value.stickyHeader));
const rows: ComputedRef<T[]> = computed((): T[] => tableApi.rows.value ?? []);
const visibleColumns: ComputedRef<TableColumn[]> = computed((): TableColumn[] => tableApi.visibleColumns.value ?? []);
const hideableColumns: ComputedRef<TableColumn[]> = computed((): TableColumn[] => tableApi.hideableColumns.value ?? []);
const pagination: ComputedRef<TablePagination> = computed((): TablePagination => tableApi.pagination.value);
const rowNumberStart: ComputedRef<number> = computed((): number => pagination.value.from ?? 1);
const sorting: ComputedRef<TableSorting> = computed((): TableSorting => tableApi.sorting.value);
const isLoading: ComputedRef<boolean> = computed((): boolean => tableApi.loading.value);
const hasRows: ComputedRef<boolean> = computed((): boolean => rows.value.length > 0);
const hasTablePayload: ComputedRef<boolean> = computed((): boolean => props.table !== null && typeof props.table !== 'undefined');
const tableError: ComputedRef<TableErrorStateConfig | null> = computed((): TableErrorStateConfig | null => {
  if (!hasTablePayload.value) {
    return {
      title: tableConfig.value.labels.errorTitle,
      message: tableConfig.value.labels.errorMessage,
      icon: 'error',
      retry: true
    };
  }

  return null;
});
const emptyState: ComputedRef<TableEmptyState> = computed((): TableEmptyState => tableDefinition.value.emptyState || {});

const rowSelectionKey: ComputedRef<string | null> = computed((): string | null => tableDefinition.value.rowSelectionKey);
const selectable: ComputedRef<boolean> = computed((): boolean => props.selectable && tableDefinition.value.selectable);
const persistRowSelectionAcrossPages: ComputedRef<boolean> = computed((): boolean => tableDefinition.value.persistRowSelectionAcrossPages);

const rowKey = (row: T): TableRowKey | null => {
  const key: string | null = rowSelectionKey.value;

  if (!key) {
    return null;
  }

  const value = row[key];

  return typeof value === 'string' || typeof value === 'number' ? value : null;
};

const selectableRows: ComputedRef<T[]> = computed((): T[] => rows.value.filter((row: T): boolean => row._selectable !== false && rowKey(row) !== null));
const hasSelectableRows: ComputedRef<boolean> = computed((): boolean => selectable.value && selectableRows.value.length > 0);
const selectedRowKeys: ComputedRef<TableRowKey[]> = computed((): TableRowKey[] => Array.from(selectedRows.value));
const bulkActions: ComputedRef<TableAction[]> = computed((): TableAction[] => tableDefinition.value.actions.filter((action: TableAction): boolean => Boolean(action.bulk) && !action.hidden));
const exportActions: ComputedRef<TableExport[]> = computed((): TableExport[] => tableDefinition.value.exports.filter((exportAction: TableExport): boolean => !exportAction.hidden));
const actionsApi: UseActionsApi = useActions<T>(tableDefinition, {
  selectedKeys: selectedRowKeys,
  selectionMode
});
const columnsWithForwardedHeaderSlots: ComputedRef<TableColumn[]> = computed((): TableColumn[] =>
  visibleColumns.value.filter((column: TableColumn): boolean => Boolean(slots.header || slots[`header(${column.attribute})`]))
);

const visibleColumnCount: ComputedRef<number> = computed((): number =>
  Math.max(visibleColumns.value.length + (selectable.value ? 1 : 0), 1)
);

const allVisibleRowsSelected: ComputedRef<boolean> = computed(
  (): boolean =>
    hasSelectableRows.value &&
    selectableRows.value.every((row: T): boolean => {
      const key: TableRowKey | null = rowKey(row);

      return key !== null && selectedRows.value.has(key);
    })
);

const isStickyColumn = (column: TableColumn): boolean =>
  Boolean(column.sticky ?? column.meta.defaultToSticky);

const stickySideFor = (column: TableColumn): 'left' | 'right' => {
  const index: number = visibleColumns.value.findIndex((visibleColumn: TableColumn): boolean => visibleColumn.attribute === column.attribute);

  return index >= visibleColumns.value.length / 2 ? 'right' : 'left';
};

const isColumnSticky = (column: TableColumn): boolean => tableApi.isColumnSticky(column.attribute);

const columnSelector = (attribute: string): string => {
  const escapedAttribute: string =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(attribute)
      : attribute.replace(/"/g, '\\"');

  return `th[data-column="${escapedAttribute}"]`;
};

const measureStickyOffsets = async (): Promise<void> => {
  await nextTick();

  const table: HTMLTableElement | null = tableElement.value;

  if (!table) {
    stickyOffsets.value = {};
    stickySides.value = {};
    return;
  }

  const offsets: Record<string, number> = {};
  const sides: Record<string, 'left' | 'right'> = {};
  let leftOffset: number = 0;
  let rightOffset: number = 0;

  for (const column of visibleColumns.value) {
    if (!isStickyColumn(column) || stickySideFor(column) !== 'left') {
      continue;
    }

    offsets[column.attribute] = leftOffset;
    sides[column.attribute] = 'left';

    const headerCell: HTMLElement | null = table.querySelector<HTMLElement>(columnSelector(column.attribute));
    leftOffset += headerCell?.offsetWidth ?? 0;
  }

  for (const column of [...visibleColumns.value].reverse()) {
    if (!isStickyColumn(column) || stickySideFor(column) !== 'right') {
      continue;
    }

    offsets[column.attribute] = rightOffset;
    sides[column.attribute] = 'right';

    const headerCell: HTMLElement | null = table.querySelector<HTMLElement>(columnSelector(column.attribute));
    rightOffset += headerCell?.offsetWidth ?? 0;
  }

  stickyOffsets.value = offsets;
  stickySides.value = sides;
};

watch(
  (): boolean => props.loading,
  (isLoading: boolean): void => tableApi.setLoading(isLoading),
  { immediate: true }
);

watch(
  (): string => tableApi.search.value,
  (value: string): void => {
    localSearch.value = value;
  },
  { immediate: true }
);

watch(
  (): string[] => visibleColumns.value.map((column: TableColumn): string => `${column.attribute}:${isStickyColumn(column) ? 'sticky' : 'static'}`),
  (): void => {
    void measureStickyOffsets();
  },
  { immediate: true }
);

watch(
  (): string => rows.value.map((row: T): TableRowKey | null => rowKey(row)).join('\\u001f'),
  (): void => {
    if (!persistRowSelectionAcrossPages.value) {
      clearSelection();
    }
  }
);

onMounted((): void => {
  void measureStickyOffsets();

  if (typeof ResizeObserver === 'undefined' || !tableElement.value) {
    return;
  }

  resizeObserver = new ResizeObserver((): void => {
    void measureStickyOffsets();
  });
  resizeObserver.observe(tableElement.value);
});

onBeforeUnmount((): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  resizeObserver?.disconnect();
});

const hasListener = (name: string): boolean => {
  const vnodeProps = instance?.vnode.props;

  return Boolean(vnodeProps && Object.prototype.hasOwnProperty.call(vnodeProps, name));
};

const hasRowClickListener: ComputedRef<boolean> = computed((): boolean => hasListener('onRowClick'));
const hasCellClickListener: ComputedRef<boolean> = computed((): boolean => hasListener('onCellClick'));

const normalizeUrl = (value: TableUrlValue | undefined): TableUrl | null => {
  if (!value) {
    return null;
  }

  return typeof value === 'string' ? { url: value, target: null } : value;
};

const visitResolvedUrl = (value: TableUrlValue | undefined, event: MouseEvent): void => {
  const link: TableUrl | null = normalizeUrl(value);

  if (!link?.url || !props.autoVisit || event.defaultPrevented) {
    return;
  }

  if (link.target) {
    return;
  }

  visitUrl(link.url, {
    preserveScroll: link.preserveScroll ?? false,
    preserveState: link.preserveState ?? false
  });
};

const handleRowClick = (row: T, column: TableColumn | null, event: MouseEvent): void => {
  emit('row-click', row, column, event);

  if (hasRowClickListener.value) {
    return;
  }

  visitResolvedUrl(row._url, event);
};

const handleCellClick = (payload: CellClickPayload<T>): void => {
  emit('cell-click', payload);
};

const handleForwardedCellClick = (payload: CellClickPayload<TableRow>): void => {
  handleCellClick(payload as CellClickPayload<T>);
};

const currentUrl = (): string =>
  typeof window === 'undefined' ? '/' : `${window.location.pathname}${window.location.search}`;

const retryTable = (): void => {
  emit('retry');

  if (props.autoVisit) {
    visitUrl(currentUrl());
  }
};

const queryKey = (key: QueryStateKey): string => {
  const queryString: TableMetaValue = tableDefinition.value.meta.queryString;

  if (queryString && typeof queryString === 'object' && !Array.isArray(queryString)) {
    const configuredKey = queryString[key];

    if (typeof configuredKey === 'string') {
      return configuredKey;
    }
  }

  return tableDefinition.value.name ? `${tableDefinition.value.name}[${key}]` : key;
};

const queryKeyAliases = (key: QueryStateKey): string[] => {
  const keys: string[] = [queryKey(key), key];

  if (tableDefinition.value.name) {
    keys.push(`${tableDefinition.value.name}[${key}]`);
  }

  return [...new Set(keys)];
};

const visitWithQuery = (updates: Record<string, QueryValue>): void => {
  const url: URL = new URL(currentUrl(), typeof window === 'undefined' ? 'http://localhost' : window.location.origin);

  Object.entries(updates).forEach(([key, value]: [string, QueryValue]): void => {
    const stateKey: QueryStateKey = key as QueryStateKey;
    const normalizedKey: string = queryKey(stateKey);

    queryKeyAliases(stateKey).forEach((alias: string): void => {
      url.searchParams.delete(alias);

      [...url.searchParams.keys()]
        .filter((currentKey: string): boolean => currentKey.startsWith(`${alias}[`))
        .forEach((currentKey: string): void => url.searchParams.delete(currentKey));
    });

    if (value === null || value === '') {
      return;
    }

    if (Array.isArray(value) && value.length === 0) {
      if (stateKey === 'sticky') {
        url.searchParams.set(normalizedKey, '');
      }

      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item: string, index: number): void => url.searchParams.append(`${normalizedKey}[${index}]`, item));
      return;
    }

    url.searchParams.set(normalizedKey, String(value));
  });

  visitUrl(`${url.pathname}${url.search}`);
};

const updateSearch = (value: string): void => {
  localSearch.value = value;
  tableApi.setSearch(value);
  emit('search-change', value);

  if (!props.autoVisit) {
    return;
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout((): void => {
    visitWithQuery({ search: value, page: null, cursor: null });
  }, props.searchDebounce);
};

const updatePerPage = (value: number): void => {
  tableApi.setPerPage(value);
  emit('per-page-change', value);

  if (props.autoVisit) {
    visitWithQuery({
      perPage: value === pagination.value.defaultPerPage ? null : value,
      page: null,
      cursor: null
    });
  }
};

const sortColumn = (payload: SortPayload): void => {
  tableApi.setSort(payload.column.attribute, payload.direction);

  if (!props.autoVisit) {
    return;
  }

  visitWithQuery({
    sort: payload.column.attribute,
    direction: payload.direction,
    page: null,
    cursor: null
  });
};

const currentQueryValue = (key: QueryStateKey): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const url: URL = new URL(currentUrl(), window.location.origin);

  for (const alias of queryKeyAliases(key)) {
    const value: string | null = url.searchParams.get(alias);

    if (value) {
      return value;
    }
  }

  return null;
};

const currentDirection = (): 'asc' | 'desc' | null => {
  const value: string | null = sorting.value.direction ?? currentQueryValue('direction');

  return value === 'asc' || value === 'desc' ? value : null;
};
const visitPage = (url: string | null): void => {
  emit('page-click', url);

  if (props.autoVisit && url) {
    visitUrl(url);
  }
};

const currentExportState = (): Record<string, QueryValue | string[]> => ({
  page: pagination.value.currentPage,
  perPage: pagination.value.perPage,
  cursor: null,
  search: localSearch.value,
  sort: sorting.value.column,
  direction: currentDirection(),
  columns: hiddenColumnAttributes(),
  sticky: stickyColumnAttributes()
});

const hiddenColumnAttributes = (): string[] =>
  tableDefinition.value.columns
    .filter((column: TableColumn): boolean => !visibleColumns.value.some((visibleColumn: TableColumn): boolean => visibleColumn.attribute === column.attribute))
    .map((column: TableColumn): string => column.attribute);
const stickyColumnAttributes = (): string[] =>
  visibleColumns.value
    .filter((column: TableColumn): boolean => tableApi.isColumnSticky(column.attribute))
    .map((column: TableColumn): string => column.attribute);

const syncColumnsQuery = (): void => {
  if (!props.autoVisit) {
    return;
  }

  const columns: string[] = hiddenColumnAttributes();

  visitWithQuery({
    columns: columns.length === 0 ? null : columns
  });
};

const toggleColumnVisibility = (attribute: string): void => {
  tableApi.toggleColumnVisibility(attribute);
  syncColumnsQuery();
};

const hideColumn = (column: TableColumn): void => {
  if (!tableApi.isColumnVisible(column.attribute)) {
    return;
  }

  tableApi.setColumnVisibility(column.attribute, false);
  syncColumnsQuery();
};

const toggleColumnSticky = async (column: TableColumn): Promise<void> => {
  tableApi.toggleColumnSticky(column.attribute);
  await measureStickyOffsets();

  if (props.autoVisit) {
    visitWithQuery({
      sticky: stickyColumnAttributes()
    });
  }
};

const toggleRowSelection = (row: T): void => {
  const nextSelectedRows: Set<TableRowKey> = new Set(selectedRows.value);
  const key: TableRowKey | null = rowKey(row);

  if (key === null) {
    return;
  }

  if (nextSelectedRows.has(key)) {
    nextSelectedRows.delete(key);
  } else {
    nextSelectedRows.add(key);
  }

  selectedRows.value = nextSelectedRows;
};

const toggleAllVisibleRows = (): void => {
  const nextSelectedRows: Set<TableRowKey> = new Set(selectedRows.value);

  if (allVisibleRowsSelected.value) {
    selectableRows.value.forEach((row: T): void => {
      const key: TableRowKey | null = rowKey(row);

      if (key !== null) {
        nextSelectedRows.delete(key);
      }
    });
  } else {
    selectableRows.value.forEach((row: T): void => {
      const key: TableRowKey | null = rowKey(row);

      if (key !== null) {
        nextSelectedRows.add(key);
      }
    });
  }

  selectedRows.value = nextSelectedRows;
};

const clearSelection = (): void => {
  selectedRows.value = new Set<TableRowKey>();
  selectionMode.value = 'page';
};
const columnAttribute = (column: TableColumn | string): string => typeof column === 'string' ? column : column.attribute;

const setSearch = (value: string): void => {
  updateSearch(value);
};

const setPerPage = (value: number): void => {
  updatePerPage(value);
};

const setSort = (column: TableColumn | string | null, direction: 'asc' | 'desc' | null = 'asc'): void => {
  const attribute: string | null = column === null ? null : columnAttribute(column);
  tableApi.setSort(attribute, direction);

  if (!props.autoVisit) {
    return;
  }

  visitWithQuery({
    sort: attribute,
    direction: attribute === null ? null : direction,
    page: null,
    cursor: null
  });
};

const toggleColumn = (column: TableColumn | string): void => {
  toggleColumnVisibility(columnAttribute(column));
};

const setColumnSticky = async (column: TableColumn | string, sticky: boolean): Promise<void> => {
  tableApi.setColumnSticky(columnAttribute(column), sticky);
  await measureStickyOffsets();

  if (props.autoVisit) {
    visitWithQuery({
      sticky: stickyColumnAttributes()
    });
  }
};

const makeSticky = (column: TableColumn | string): Promise<void> => setColumnSticky(column, true);

const removeSticky = (column: TableColumn | string): Promise<void> => setColumnSticky(column, false);

const putState = (nextState: Partial<TableDefinition<T>['state']>): void => {
  if (typeof nextState.search === 'string') {
    setSearch(nextState.search);
  }

  if (typeof nextState.perPage === 'number') {
    setPerPage(nextState.perPage);
  }

  if (typeof nextState.sort === 'string' || nextState.sort === null) {
    const direction: 'asc' | 'desc' | null = nextState.direction === 'asc' || nextState.direction === 'desc' ? nextState.direction : null;
    setSort(nextState.sort, direction);
  }

  if (nextState.columns && typeof nextState.columns === 'object' && !Array.isArray(nextState.columns)) {
    Object.entries(nextState.columns).forEach(([attribute, visible]: [string, boolean]): void => {
      if (typeof visible === 'boolean') {
        tableApi.setColumnVisibility(attribute, visible);
      }
    });
    syncColumnsQuery();
  }

  if (Array.isArray(nextState.sticky)) {
    tableDefinition.value.columns.forEach((column: TableColumn): void => {
      tableApi.setColumnSticky(column.attribute, nextState.sticky?.includes(column.attribute) ?? false);
    });
    void measureStickyOffsets();

    if (props.autoVisit) {
      visitWithQuery({
        sticky: stickyColumnAttributes()
      });
    }
  }
};

const toggleItem = (key: TableRowKey | '*'): void => {
  if (key === '*') {
    toggleAllVisibleRows();
    return;
  }

  const row: T | undefined = rows.value.find((currentRow: T): boolean => rowKey(currentRow) === key);

  if (row) {
    toggleRowSelection(row);
  }
};

const performAction = (action: TableAction, keys: TableRowKey[] = selectedRowKeys.value): void => {
  actionsApi.performAction(action, keys, selectionMode.value);
};
const cellValueFor = (row: T, column: TableColumn, rowIndex: number): TableCellValue =>
  (column.type === 'serial-number' ? rowNumberStart.value + rowIndex : row[column.attribute]) as TableCellValue;

defineExpose({
  tableApi,
  actionsApi,
  state: tableApi.state,
  rows,
  columns: tableApi.columns,
  visibleColumns,
  hideableColumns,
  pagination,
  sorting,
  search: tableApi.search,
  hasBulkActions: computed((): boolean => bulkActions.value.length > 0),
  hasFilters: false,
  hasSelectableRows,
  selectedItems: selectedRowKeys,
  selectedRows: selectedRowKeys,
  allItemsAreSelected: allVisibleRowsSelected,
  isNavigating: isLoading,
  isPerformingAction: actionsApi.isPerformingAction,
  setSearch,
  setPerPage,
  setSort,
  toggleColumn,
  toggleColumnVisibility,
  setColumnSticky,
  makeSticky,
  removeSticky,
  putState,
  toggleItem,
  clearSelection,
  performAction
});
</script>

<template>
    <section
    :class="[tableConfig.classes.root, tableConfig.darkMode.enabled ? tableConfig.classes.rootDark : '']"
    :data-dark-mode="tableConfig.darkMode.enabled ? 'enabled' : undefined"
    :data-dark-class="tableConfig.darkMode.class"
    :data-dark-attribute="tableConfig.darkMode.attribute"
    data-test="zonvoir-table"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <header :class="tableConfig.classes.toolbar">
        <h2 class="sr-only">{{ tableDefinition.name }}</h2>

        <slot name="toolbar" :table="tableDefinition" :table-api="tableApi">
          <div :class="tableConfig.classes.toolbarContent">
            <div :class="tableConfig.classes.toolbarSearch">
              <slot name="beforeSearch"></slot>
              <label :class="tableConfig.classes.search">
                <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <CommonIcon icon="search" class="h-4 w-4" />
                </span>
                <input
                  name="search"
                  :value="localSearch"
                  type="search"
                  autocomplete="off"
                  :class="tableConfig.classes.searchInput"
                  :placeholder="tableConfig.labels.search"
                  @input="updateSearch(($event.target as HTMLInputElement).value)"
                >
              </label>
              <slot name="afterSearch"></slot>
            </div>

            <div :class="tableConfig.classes.toolbarActions">
              <slot name="beforeActions"></slot>

              <slot name="column-toggle" :table-api="tableApi">
                <ToggleColumnsDropdown
                  v-if="showColumnToggle && hideableColumns.length > 0"
                  :columns="hideableColumns"
                  :is-column-visible="tableApi.isColumnVisible"
                  @toggle="toggleColumnVisibility"
                />
              </slot>

              <slot name="exports" :table="tableDefinition" :selected-keys="selectedRowKeys" :state="currentExportState()">
                <TableExports
                  :exports="exportActions"
                  :selected-keys="selectedRowKeys"
                  :state="currentExportState()"
                />
              </slot>

              <slot name="actions" :table="tableDefinition" :table-api="tableApi">
                <div :class="tableConfig.classes.bulkActions" data-test="bulk-actions">
                  <TableBulkActions
                    :actions="bulkActions"
                    :table="tableDefinition"
                    :selected-keys="selectedRowKeys"
                    :selection-mode="selectionMode"
                  />
                </div>
              </slot>
              <slot name="afterActions"></slot>
            </div>
          </div>
        </slot>

      </header>

      <div :class="tableConfig.classes.scroll" data-test="table-scroll-container">
        <slot
          name="table"
          :columns="visibleColumns"
          :rows="rows"
          :table="tableDefinition"
          :table-api="tableApi"
        >
          <table ref="tableElement" :class="tableConfig.classes.table">
            <slot
              name="thead"
              :columns="visibleColumns"
              :sorting="sorting"
              :sticky="stickyHeader"
              :sticky-offsets="stickyOffsets"
              :sticky-sides="stickySides"
              :is-column-sticky="isColumnSticky"
              :sort-column="sortColumn"
              :toggle-column-sticky="toggleColumnSticky"
              :hide-column="hideColumn"
              :selectable="selectable"
              :all-visible-rows-selected="allVisibleRowsSelected"
              :has-selectable-rows="hasSelectableRows"
              :toggle-all-visible-rows="toggleAllVisibleRows"
            >
              <TableHeader
                :columns="visibleColumns"
                :sorting="sorting"
                :sticky="stickyHeader"
                :sticky-offsets="stickyOffsets"
                :sticky-sides="stickySides"
                :is-column-sticky="isColumnSticky"
                @sort="sortColumn"
                @stick="toggleColumnSticky"
                @hide="hideColumn"
              >
                <template #prefix>
                  <th
                    v-if="selectable"
                    :class="tableConfig.classes.selectionHeader"
                  >
                    <CommonCheckbox
                      :model-value="allVisibleRowsSelected"
                      :disabled="!hasSelectableRows"
                      :ariaLabel="tableConfig.labels.selectAllRows"
                      @update:model-value="toggleAllVisibleRows"
                    />
                  </th>
                </template>
                <template
                  v-for="column in columnsWithForwardedHeaderSlots"
                  #[`header(${column.attribute})`]="slotProps"
                >
                  <slot :name="`header(${column.attribute})`" :column="slotProps.column">
                    <slot name="header" :column="slotProps.column" />
                  </slot>
                </template>
              </TableHeader>
            </slot>

            <template v-if="isLoading && $slots.loadingState">
              <slot
                name="loadingState"
                :table="tableDefinition"
                :table-api="tableApi"
                :columns="visibleColumns"
                :colspan="visibleColumnCount"
              />
            </template>

            <LoadingState
              v-else-if="isLoading"
              :colspan="visibleColumnCount"
              :message="tableConfig.labels.loading"
            />

            <TableErrorState
              v-else-if="tableError"
              :title="tableError.title"
              :message="tableError.message"
              :icon="tableError.icon"
              :retry="tableError.retry"
              :action="tableError.action ?? null"
              :colspan="visibleColumnCount"
              @retry="retryTable"
            />

            <slot
              v-else-if="hasRows"
              name="tbody"
              :columns="visibleColumns"
              :rows="rows"
              :table="tableDefinition"
              :table-api="tableApi"
              :sticky-offsets="stickyOffsets"
              :sticky-sides="stickySides"
              :row-number-start="rowNumberStart"
              :auto-visit="autoVisit"
              :has-cell-click-listener="hasCellClickListener"
              :handle-row-click="handleRowClick"
              :handle-cell-click="handleCellClick"
              :selectable="selectable"
              :row-key="rowKey"
              :selected-rows="selectedRows"
              :toggle-row-selection="toggleRowSelection"
            >
              <TableBody
                :columns="visibleColumns"
                :rows="rows"
                :table="tableDefinition"
                :sticky-offsets="stickyOffsets"
                :sticky-sides="stickySides"
                :row-number-start="rowNumberStart"
                :auto-visit="autoVisit"
                :has-cell-click-listener="hasCellClickListener"
                @row-click="handleRowClick"
                @cell-click="handleCellClick"
              >
                <template #row="slotProps">
                  <slot
                    name="row"
                    :row="slotProps.row"
                    :row-index="slotProps.rowIndex"
                    :columns="slotProps.columns"
                    :table="tableDefinition"
                    :table-api="tableApi"
                  >
                    <td
                      v-if="selectable"
                      :class="[
                        tableConfig.classes.selectionCell,
                        rowKey(slotProps.row) !== null && selectedRows.has(rowKey(slotProps.row)!)
                          ? 'shadow-[inset_4px_0_0_0_rgb(209_213_219)]'
                          : ''
                      ]"
                    >
                      <CommonCheckbox
                        :model-value="rowKey(slotProps.row) !== null && selectedRows.has(rowKey(slotProps.row)!)"
                        :disabled="slotProps.row._selectable === false || rowKey(slotProps.row) === null"
                        :ariaLabel="tableConfig.labels.selectRow"
                        @click.stop
                        @update:model-value="toggleRowSelection(slotProps.row)"
                      />
                    </td>
                    <TableCell
                      v-for="column in visibleColumns"
                      :key="column.attribute"
                      :column="column"
                      :row="slotProps.row"
                      :value="cellValueFor(slotProps.row as T, column, slotProps.rowIndex)"
                      clickable
                      :auto-visit="autoVisit"
                      :has-click-listener="hasCellClickListener"
                      :sticky-offset="stickyOffsets[column.attribute]"
                      :sticky-side="stickySides[column.attribute]"
                      @click="handleForwardedCellClick"
                    >
                      <slot
                        :name="`cell(${column.attribute})`"
                        :column="column"
                        :row="slotProps.row"
                        :row-index="slotProps.rowIndex"
                        :value="cellValueFor(slotProps.row as T, column, slotProps.rowIndex)"
                      >
                        <CellValue
                          :column="column"
                          :row="slotProps.row"
                          :row-index="slotProps.rowIndex"
                          :row-number-start="rowNumberStart"
                        />
                      </slot>
                    </TableCell>
                  </slot>
                </template>
              </TableBody>
            </slot>

            <EmptyState
              v-else-if="$slots.emptyState"
              :colspan="visibleColumnCount"
            >
              <slot
                name="emptyState"
                :table="tableDefinition"
                :table-api="tableApi"
                :empty-state="emptyState"
                :action="emptyState.action ?? null"
                :columns="visibleColumns"
                :rows="rows"
                :colspan="visibleColumnCount"
              />
            </EmptyState>

            <EmptyState
              v-else
              :title="emptyState.title"
              :message="emptyState.message"
              :icon="emptyState.icon"
              :action="emptyState.action ?? null"
              :colspan="visibleColumnCount"
            />
          </table>
        </slot>
      </div>

      <footer :class="tableConfig.classes.paginationContainer" v-if="pagination.enabled">
        <slot name="pagination" :pagination="pagination" :table="tableDefinition" :table-api="tableApi">
          <TablePaginationComponent
            :selectable="selectable"
            :selected-rows="selectedRows"
            :pagination="pagination"
            @per-page-change="updatePerPage"
            @page-click="visitPage"
          />
        </slot>
      </footer>
    </div>
  </section>
</template>
