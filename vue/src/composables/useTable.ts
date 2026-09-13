import { computed, readonly, ref, shallowReactive, unref, watch, type ComputedRef, type MaybeRef, type Ref } from 'vue';
import { normalizeTable } from '../helpers/normalizeTable';
import type {
  TableColumn,
  TableDefinition,
  TablePagination,
  TableResource,
  TableRow,
  TableSorting
} from '../types/table';

export type TableState<T extends TableRow = TableRow> = {
  rows: T[];
  columns: TableDefinition<T>['columns'];
  loading: boolean;
  columnVisibility: Record<string, boolean>;
  pagination: TablePagination;
  sorting: TableSorting;
  search: string;
}

export type TableApi<T extends TableRow = TableRow> = {
  state: Readonly<TableState<T>>;
  rows: ComputedRef<T[]>;
  columns: ComputedRef<TableDefinition<T>['columns']>;
  visibleColumns: ComputedRef<TableDefinition<T>['columns']>;
  hideableColumns: ComputedRef<TableDefinition<T>['columns']>;
  loading: ComputedRef<boolean>;
  pagination: ComputedRef<TablePagination>;
  sorting: ComputedRef<TableSorting>;
  search: ComputedRef<string>;
  setLoading: (isLoading: boolean) => void;
  setSearch: (value: string) => void;
  setSort: (column: string | null, direction?: 'asc' | 'desc' | null) => void;
  setPerPage: (value: number) => void;
  isColumnVisible: (attribute: string) => boolean;
  setColumnVisibility: (attribute: string, visible: boolean) => void;
  toggleColumnVisibility: (attribute: string) => void;
  isColumnSticky: (attribute: string) => boolean;
  setColumnSticky: (attribute: string, sticky: boolean) => void;
  toggleColumnSticky: (attribute: string) => void;
}

function isTableDefinition<T extends TableRow>(
  table: TableResource<T> | TableDefinition<T>
): table is TableDefinition<T> {
  return (
    Array.isArray((table as TableDefinition<T>).rows) &&
    Array.isArray((table as TableDefinition<T>).columns) &&
    typeof (table as TableDefinition<T>).pagination === 'object' &&
    typeof (table as TableDefinition<T>).sorting === 'object'
  );
}

export function useTable<T extends TableRow = TableRow>(
  table: MaybeRef<TableDefinition<T>>
): TableApi<T>;
export function useTable<T extends TableRow = TableRow>(
  table: MaybeRef<TableResource<T>>
): TableApi<T>;
export function useTable<T extends TableRow = TableRow>(
  table: MaybeRef<TableResource<T> | TableDefinition<T>>
): TableApi<T> {
  const loading: Ref<boolean> = ref(false);
  const columnVisibilityOverrides: Record<string, boolean> = {};

  const state: TableState<T> = shallowReactive<TableState<T>>({
    rows: [],
    columns: [],
    loading: false,
    columnVisibility: {},
    pagination: normalizeTable<T>().pagination,
    sorting: { column: null, direction: null },
    search: ''
  });

  const sync = (nextTable: TableResource<T> | TableDefinition<T>): void => {
    const tableDefinition: TableDefinition<T> = isTableDefinition(nextTable)
      ? nextTable
      : normalizeTable(nextTable);

    state.rows = [...tableDefinition.rows];

    const nextColumns: TableDefinition<T>['columns'] = tableDefinition.columns.map((column: TableColumn): TableColumn => ({
      ...column,
      meta: { ...column.meta }
    }));
    const stateColumns: unknown = tableDefinition.state.columns;
    const tableVisibility: Record<string, boolean> = stateColumns && typeof stateColumns === 'object' && !Array.isArray(stateColumns)
      ? stateColumns as Record<string, boolean>
      : {};

    const stickyColumns: string[] | null = Array.isArray(tableDefinition.state.sticky)
      ? tableDefinition.state.sticky
      : null;

    state.columns = nextColumns.map((column: TableColumn): TableColumn => ({
      ...column,
      sticky: stickyColumns
        ? stickyColumns.includes(column.attribute)
        : Boolean(column.sticky ?? column.meta.defaultToSticky),
      stickable: column.stickable ?? true,
      visible:
        typeof columnVisibilityOverrides[column.attribute] === 'boolean'
          ? columnVisibilityOverrides[column.attribute]
          : typeof tableVisibility[column.attribute] === 'boolean'
            ? tableVisibility[column.attribute]
            : column.visible
    }));
    state.columnVisibility = Object.fromEntries(
      state.columns.map((column: TableColumn): [string, boolean] => [column.attribute, column.visible])
    );
    state.pagination = {
      ...tableDefinition.pagination,
      perPageOptions: [...tableDefinition.pagination.perPageOptions],
      links: [...tableDefinition.pagination.links]
    };
    state.sorting = { ...tableDefinition.sorting };
    state.search = tableDefinition.search;
  };

  watch(
    (): TableResource<T> | TableDefinition<T> => unref(table),
    (nextTable: TableResource<T> | TableDefinition<T>): void => sync(nextTable),
    { deep: true, immediate: true }
  );

  watch(
    loading,
    (isLoading: boolean): void => {
      state.loading = isLoading;
    },
    { immediate: true }
  );

  const setLoading = (isLoading: boolean): void => {
    loading.value = isLoading;
    state.loading = isLoading;
  };

  const setSearch = (value: string): void => {
    state.search = value;
  };

  const setSort = (column: string | null, direction: 'asc' | 'desc' | null = null): void => {
    state.sorting = {
      column,
      direction
    };
  };

  const setPerPage = (value: number): void => {
    state.pagination = {
      ...state.pagination,
      perPage: value
    };
  };

  const isColumnVisible = (attribute: string): boolean => state.columnVisibility[attribute] ?? true;

  const setColumnVisibility = (attribute: string, visible: boolean): void => {
    const column: TableColumn | undefined = state.columns.find((currentColumn: TableColumn): boolean => currentColumn.attribute === attribute);

    if (!column || !column.toggleable) {
      return;
    }

    state.columnVisibility = {
      ...state.columnVisibility,
      [attribute]: visible
    };
    columnVisibilityOverrides[attribute] = visible;
  };

  const toggleColumnVisibility = (attribute: string): void => {
    const column: TableColumn | undefined = state.columns.find((currentColumn: TableColumn): boolean => currentColumn.attribute === attribute);

    if (!column || !column.toggleable) {
      return;
    }

    state.columnVisibility = {
      ...state.columnVisibility,
      [attribute]: !(state.columnVisibility[attribute] ?? true)
    };
    columnVisibilityOverrides[attribute] = state.columnVisibility[attribute];
  };

  const isColumnSticky = (attribute: string): boolean => {
    const column: TableColumn | undefined = state.columns.find((currentColumn: TableColumn): boolean => currentColumn.attribute === attribute);

    return Boolean(column?.sticky ?? column?.meta.defaultToSticky);
  };

  const setColumnSticky = (attribute: string, sticky: boolean): void => {
    const column: TableColumn | undefined = state.columns.find((currentColumn: TableColumn): boolean => currentColumn.attribute === attribute);

    if (!column || !Boolean(column.stickable ?? true)) {
      return;
    }

    state.columns = state.columns.map((currentColumn: TableColumn): TableColumn =>
      currentColumn.attribute === attribute
        ? {
            ...currentColumn,
            sticky,
            stickable: true
          }
        : currentColumn
    );
  };

  const toggleColumnSticky = (attribute: string): void => {
    const column: TableColumn | undefined = state.columns.find((currentColumn: TableColumn): boolean => currentColumn.attribute === attribute);

    if (!column) {
      return;
    }

    setColumnSticky(attribute, !Boolean(column.sticky ?? column.meta.defaultToSticky));
  };

  return {
    state: readonly(state) as unknown as Readonly<TableState<T>>,
    rows: computed((): T[] => state.rows),
    columns: computed((): TableDefinition<T>['columns'] => state.columns),
    visibleColumns: computed((): TableDefinition<T>['columns'] =>
      state.columns.filter((column: TableColumn): boolean => state.columnVisibility[column.attribute] ?? column.visible)
    ),
    hideableColumns: computed((): TableDefinition<T>['columns'] => state.columns.filter((column: TableColumn): boolean => column.toggleable)),
    loading: computed((): boolean => state.loading),
    pagination: computed((): TablePagination => state.pagination),
    sorting: computed((): TableSorting => state.sorting),
    search: computed((): string => state.search),
    setLoading,
    setSearch,
    setSort,
    setPerPage,
    isColumnVisible,
    setColumnVisibility,
    toggleColumnVisibility,
    isColumnSticky,
    setColumnSticky,
    toggleColumnSticky
  };
}


