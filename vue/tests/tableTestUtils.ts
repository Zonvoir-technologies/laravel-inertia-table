import { router } from '@inertiajs/vue3';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, beforeEach, vi } from 'vitest';
import type { TableColumn, TableDefinition, TableRow } from '../src/types/table';

export const installTableTestHooks = (): void => {
  enableAutoUnmount(afterEach);

  beforeEach(() => {
    vi.mocked(router.visit).mockReset();
    HTMLElement.prototype.hasPointerCapture ??= vi.fn(() => false);
    HTMLElement.prototype.setPointerCapture ??= vi.fn();
    HTMLElement.prototype.releasePointerCapture ??= vi.fn();
    globalThis.ResizeObserver ??= class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });
};

export const formDataEntries = (formData: FormData): Record<string, FormDataEntryValue> =>
  Object.fromEntries(Array.from(formData.entries()));

export const imageConfig = (overrides = {}) => ({
  url: '/avatars/ada.png',
  urls: [],
  icon: null,
  size: 'medium' as const,
  width: null,
  height: null,
  rounded: false,
  position: 'start' as const,
  class: '',
  alt: '',
  title: '',
  limit: null,
  ...overrides
});

export const makeTableColumn = (overrides: Partial<TableColumn> = {}): TableColumn => ({
  attribute: 'name',
  label: 'Name',
  sortable: false,
  toggleable: true,
  visible: true,
  alignment: 'left',
  meta: {},
  ...overrides
});

export const makeTableDefinition = <T extends TableRow = TableRow>(
  overrides: Partial<TableDefinition<T>> = {}
): TableDefinition<T> => ({
  name: 'table',
  columns: [],
  rows: [],
  pagination: {
    enabled: true,
    type: 'full',
    perPage: 15,
    defaultPerPage: 15,
    perPageOptions: [15, 25],
    currentPage: 1,
    from: 1,
    to: 1,
    total: 1,
    lastPage: 1,
    links: [],
    nextPageUrl: null,
    previousPageUrl: null,
    nextCursor: null,
    previousCursor: null,
    firstPageUrl: null,
    lastPageUrl: null
  },
  sorting: { column: null, direction: null },
  search: '',
  stickyHeader: false,
  rowSelectionKey: 'id',
  selectable: true,
  persistRowSelectionAcrossPages: false,
  meta: {},
  state: {},
  actions: [],
  exports: [],
  hasActions: false,
  hasBulkActions: false,
  hasExports: false,
  hasExportsThatLimitsToSelectedRows: false,
  emptyState: false,
  ...overrides
});