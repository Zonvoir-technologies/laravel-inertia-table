import { nextTick, ref } from 'vue';
import { useTable, type TableDefinition } from '../../src';

const tableDefinition = (overrides: Partial<TableDefinition> = {}): TableDefinition => ({
  name: 'Users',
  columns: [
    {
      attribute: 'name',
      label: 'Name',
      sortable: true,
      toggleable: true,
      visible: true,
      alignment: 'left',
      meta: {}
    },
    {
      attribute: 'email',
      label: 'Email',
      sortable: false,
      toggleable: true,
      visible: false,
      alignment: 'left',
      meta: { defaultToSticky: true }
    }
  ],
  rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }],
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
  sorting: { column: 'name', direction: 'asc' },
  search: 'ada',
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

describe('useTable', () => {
  it('normalizes and exposes table state as computed values', () => {
    const table = useTable(tableDefinition());

    expect(table.rows.value).toEqual([{ id: 1, name: 'Ada', email: 'ada@example.com' }]);
    expect(table.visibleColumns.value.map((column) => column.attribute)).toEqual(['name']);
    expect(table.hideableColumns.value.map((column) => column.attribute)).toEqual(['name', 'email']);
    expect(table.pagination.value.perPage).toBe(15);
    expect(table.sorting.value).toEqual({ column: 'name', direction: 'asc' });
    expect(table.search.value).toBe('ada');
  });

  it('toggles loading column visibility and sticky columns', () => {
    const table = useTable(tableDefinition());

    table.setLoading(true);
    expect(table.loading.value).toBe(true);

    table.toggleColumnVisibility('email');
    expect(table.isColumnVisible('email')).toBe(true);
    expect(table.visibleColumns.value.map((column) => column.attribute)).toEqual(['name', 'email']);

    table.setColumnVisibility('name', false);
    expect(table.visibleColumns.value.map((column) => column.attribute)).toEqual(['email']);

    expect(table.isColumnSticky('email')).toBe(true);
    table.toggleColumnSticky('email');
    expect(table.isColumnSticky('email')).toBe(false);
  });

  it('syncs when the source table ref changes without mutating the input', async () => {
    const source = ref(tableDefinition());
    const table = useTable(source);

    source.value = tableDefinition({
      rows: [{ id: 2, name: 'Grace' }],
      search: 'grace',
      sorting: { column: null, direction: null }
    });
    await nextTick();

    expect(table.rows.value).toEqual([{ id: 2, name: 'Grace' }]);
    expect(table.search.value).toBe('grace');
    expect(table.sorting.value).toEqual({ column: null, direction: null });
    expect(source.value.columns[0].visible).toBe(true);
  });

  it('applies backend column visibility and sticky state from table state', () => {
    const table = useTable(tableDefinition({
      state: {
        columns: { name: false, email: true },
        sticky: ['name']
      }
    }));

    expect(table.visibleColumns.value.map((column) => column.attribute)).toEqual(['email']);
    expect(table.isColumnSticky('name')).toBe(true);
    expect(table.isColumnSticky('email')).toBe(false);
  });
  it('leaves unknown, non-toggleable, and non-stickable columns unchanged', () => {
    const table = useTable(tableDefinition({
      columns: [{
        attribute: 'locked', label: 'Locked', sortable: false, toggleable: false,
        visible: true, stickable: false, alignment: 'left', meta: {},
      }],
    }));

    expect(table.columns.value.map((column) => column.attribute)).toEqual(['locked']);
    table.setColumnVisibility('locked', false);
    table.toggleColumnVisibility('missing');
    expect(table.isColumnVisible('locked')).toBe(true);

    table.setColumnSticky('locked', true);
    table.setColumnSticky('missing', true);
    table.toggleColumnSticky('missing');
    expect(table.isColumnSticky('locked')).toBe(false);
  });
});
