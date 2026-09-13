import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { router } from '@inertiajs/vue3';
import { Table } from '../src';
import TableHeader from '../src/components/TableHeader.vue';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

interface TableExposedApi {
  search: string;
  sorting: { column: string | null; direction?: string | null };
  visibleColumns: { attribute: string }[];
  selectedItems: unknown[];
  hasBulkActions?: boolean;
  setSearch: (value: string) => void;
  setPerPage: (value: number) => void;
  setSort: (column: string, direction?: 'asc' | 'desc' | null) => void;
  toggleColumn: (attribute: string) => void;
  makeSticky: (attribute: string) => Promise<void>;
  removeSticky: (attribute: string) => Promise<void>;
  setColumnSticky: (attribute: string, sticky: boolean) => Promise<void>;
  toggleItem: (key: unknown) => void;
  putState: (state: Record<string, unknown>) => void;
  clearSelection: () => void;
  performAction: (action: unknown, keys?: unknown[], selectionMode?: unknown) => void;
}

describe('Table exposed API', () => {
  it('updates local table state without visiting when autoVisit is disabled', async () => {
    const wrapper = mount(Table, {
      props: {
        autoVisit: false,
        table: {
          name: 'Users',
          rowSelectionKey: 'id',
          selectable: true,
          perPageOptions: [10, 25, 50],
          columns: [
            { attribute: 'name', label: 'Name', sortable: true, stickable: true },
            { attribute: 'email', label: 'Email', toggleable: true },
          ],
          rows: [{ id: 1, name: 'Ada', email: 'ada@example.test' }],
        },
      },
    });
    const api = wrapper.vm as unknown as TableExposedApi;

    api.setSearch('ada');
    api.setPerPage(50);
    api.setSort('name', 'desc');
    api.toggleColumn('email');
    await api.makeSticky('name');
    await api.removeSticky('name');
    api.toggleItem('*');
    expect(api.selectedItems).toEqual([1]);

    api.putState({
      search: 'grace',
      perPage: 25,
      sort: null,
      columns: { email: true },
      sticky: ['name'],
    });
    await nextTick();

    expect(api.search).toBe('grace');
    expect(api.sorting).toMatchObject({ column: null });
    expect(api.visibleColumns.map((column: { attribute: string }) => column.attribute)).toContain('email');
    api.clearSelection();
    expect(api.selectedItems).toEqual([]);
    expect(router.visit).not.toHaveBeenCalled();
  });
  it('visits query state through exposed sorting, sticky, selection, and action APIs', async () => {
    window.history.pushState({}, '', '/employees?employees%5Bsticky%5D%5B0%5D=name');
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'employees', rowSelectionKey: 'id',
          columns: [{ attribute: 'name', label: 'Name', sortable: true, stickable: true }],
          rows: [{ id: 1, name: 'Ada' }, { id: null, name: 'No key' }],
          meta: { table: 'EmployeesTable', queryString: { sticky: 'sticky', sort: 'sort', direction: 'direction', page: 'page', cursor: 'cursor' } },
          actions: [{ key: 'archive', label: 'Archive', type: 'custom', bulk: true }], hasBulkActions: true,
        },
      },
    });
    const api = wrapper.vm as unknown as TableExposedApi;

    api.setSort('name', 'desc');
    await api.setColumnSticky('name', false);
    api.putState({ sticky: [] });
    api.toggleItem(1);
    api.toggleItem(1);
    api.toggleItem(999);
    api.toggleItem(null);
    const header = wrapper.findComponent(TableHeader);
    header.vm.$emit('hide', { attribute: 'name' });
    await nextTick();
    header.vm.$emit('hide', { attribute: 'name' });
    await nextTick();
    api.performAction({ key: 'archive', label: 'Archive', type: 'custom' }, [1]);

    expect(api.selectedItems).toEqual([]);
    expect(api.hasBulkActions).toBe(true);
    expect(router.visit).toHaveBeenCalled();
  });
});
