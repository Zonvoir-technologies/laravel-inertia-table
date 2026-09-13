import type {
  PaginatedResults,
  TableDefinition,
  TableColumn,
  TableEmptyState,
  TablePagination,
  TableResource,
  TableRow,
  TableSorting
} from '../types/table';

const DEFAULT_PER_PAGE: number = 15;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeEmptyState<T extends TableRow>(resource: TableResource<T>): false | TableEmptyState {
  const emptyState: unknown = resource.emptyState;

  if (typeof emptyState === 'string') {
    return { message: emptyState };
  }

  if (isPlainRecord(emptyState)) {
    const action = isPlainRecord(emptyState.action) ? emptyState.action : null;

    return {
      title: typeof emptyState.title === 'string' ? emptyState.title : null,
      message: typeof emptyState.message === 'string' ? emptyState.message : null,
      icon: typeof emptyState.icon === 'string' ? emptyState.icon : null,
      action: action as TableEmptyState['action']
    };
  }

  return false;
}

function isPaginatedResults<T extends TableRow>(
  results: TableResource<T>['results']
): results is PaginatedResults<T> {
  return Boolean(results && !Array.isArray(results) && Array.isArray(results.data));
}

function normalizeColumn(column: Partial<TableColumn>, index: number): TableColumn {
  const attribute: string = String(
    column.attribute ?? column.key ?? column.name ?? `column_${index + 1}`
  );
  const visibleByDefault: boolean | undefined =
    typeof column.visibleByDefault === 'boolean' ? column.visibleByDefault : undefined;

  return {
    ...column,
    attribute,
    label: String(column.label ?? column.header ?? attribute),
    sortable: Boolean(column.sortable),
    toggleable: column.toggleable ?? true,
    visible: column.visible ?? visibleByDefault ?? true,
    alignment: column.alignment ?? 'left',
    meta: { ...(column.meta ?? {}) }
  };
}

function normalizeRows<T extends TableRow>(resource: TableResource<T>): T[] {
  if (Array.isArray(resource.rows)) {
    return [...resource.rows];
  }

  if (Array.isArray(resource.results)) {
    return [...resource.results];
  }

  if (isPaginatedResults(resource.results)) {
    return [...resource.results.data];
  }

  return [];
}

function normalizePagination<T extends TableRow>(
  resource: TableResource<T>
): TablePagination {
  const results: PaginatedResults<T> | undefined = isPaginatedResults(resource.results) ? resource.results : undefined;
  const configuredPagination: Partial<TablePagination> =
    typeof resource.pagination === 'object' ? resource.pagination : {};
  const perPage: number =
    resource.state?.perPage ?? results?.per_page ?? resource.defaultPerPage ?? DEFAULT_PER_PAGE;

  return {
    enabled: Boolean(resource.pagination ?? results),
    type: configuredPagination.type ?? resource.paginationType ?? 'full',
    perPage,
    defaultPerPage:
      configuredPagination.defaultPerPage ?? resource.defaultPerPage ?? perPage,
    perPageOptions: [
      ...(configuredPagination.perPageOptions ?? resource.perPageOptions ?? [10, 15, 25, 50])
    ],
    currentPage:
      configuredPagination.currentPage ?? resource.state?.page ?? results?.current_page ?? 1,
    from: configuredPagination.from ?? results?.from ?? null,
    to: configuredPagination.to ?? results?.to ?? null,
    total: configuredPagination.total ?? results?.total ?? null,
    lastPage: configuredPagination.lastPage ?? results?.last_page ?? null,
    links: [...(configuredPagination.links ?? results?.links ?? [])],
    nextPageUrl:
      configuredPagination.nextPageUrl ?? results?.next_page_url ?? null,
    previousPageUrl:
      configuredPagination.previousPageUrl ?? results?.prev_page_url ?? null,
    nextCursor: configuredPagination.nextCursor ?? results?.next_cursor ?? null,
    previousCursor: configuredPagination.previousCursor ?? results?.prev_cursor ?? null,
    firstPageUrl: configuredPagination.firstPageUrl ?? results?.first_page_url ?? null,
    lastPageUrl: configuredPagination.lastPageUrl ?? results?.last_page_url ?? null
  };
}

function normalizeSorting(resource: TableResource): TableSorting {
  return {
    column: resource.state?.sort ?? null,
    direction:
      resource.state?.direction === 'asc' || resource.state?.direction === 'desc'
        ? resource.state.direction
        : null
  };
}

export function normalizeTable<T extends TableRow = TableRow>(
  resource: TableResource<T> = {}
): TableDefinition<T> {
  const columns: TableColumn[] = (resource.columns ?? []).map((column: Partial<TableColumn>, index: number): TableColumn => normalizeColumn(column, index));
  const state: TableDefinition<T>['state'] = { ...(resource.state ?? {}) };
  const hasBulkActions: boolean = Boolean(resource.hasBulkActions ?? resource.actions?.some((action): boolean => Boolean(action.bulk)));
  const hasSelectedRowExports: boolean = Boolean(
    resource.hasExportsThatLimitsToSelectedRows ?? resource.exports?.some((exportAction): boolean => Boolean(exportAction.limitToSelectedRows))
  );

  return {
    name: resource.name ?? '',
    columns,
    rows: normalizeRows(resource),
    pagination: normalizePagination(resource),
    sorting: normalizeSorting(resource),
    search: state.search ?? '',
    stickyHeader: Boolean(resource.stickyHeader ?? resource.meta?.stickyHeader),
    rowSelectionKey: Object.prototype.hasOwnProperty.call(resource, 'rowSelectionKey')
      ? (typeof resource.rowSelectionKey === 'string' ? resource.rowSelectionKey : null)
      : 'id',
    selectable: resource.selectable ?? true,
    persistRowSelectionAcrossPages: Boolean(resource.persistRowSelectionAcrossPages),
    meta: { ...(resource.meta ?? {}) },
    state,
    actions: [...(resource.actions ?? [])],
    exports: [...(resource.exports ?? [])],
    hasActions: Boolean(resource.hasActions ?? resource.actions?.length),
    hasBulkActions,
    hasExports: Boolean(resource.hasExports ?? resource.exports?.length),
    hasExportsThatLimitsToSelectedRows: hasSelectedRowExports,
    emptyState: normalizeEmptyState(resource)
  };
}
