import { DOMWrapper, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { Table } from '../src';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

describe('Table Selection', () => {
  it('uses id as the default row selection key for bulk action payloads', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          meta: { table: 'UsersTable' },
          actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
          hasBulkActions: true,
          pagination: true
        }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    const actionButtons = wrapper.findAll('.zt-table-bulk-actions button');
    await actionButtons[actionButtons.length - 1].trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/actions', expect.objectContaining({
      data: expect.objectContaining({ keys: [1], selectionMode: 'page' })
    }));
  });

  it('uses a custom row selection key without falling back to id', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'Users',
          rowSelectionKey: 'uuid',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [
            { id: 1, uuid: 'uuid-a', name: 'Ada' },
            { id: 2, uuid: null, name: 'No UUID' }
          ],
          meta: { table: 'UsersTable' },
          actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
          hasBulkActions: true,
          pagination: true
        }
      }
    });

    const checkboxes = wrapper.findAll('tbody input[aria-label="Select row"]');
    expect(checkboxes[1].attributes('disabled')).toBeDefined();

    await checkboxes[0].setValue(true);
    const actionButtons = wrapper.findAll('.zt-table-bulk-actions button');
    await actionButtons[actionButtons.length - 1].trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/actions', expect.objectContaining({
      data: expect.objectContaining({ keys: ['uuid-a'] })
    }));
  });

  it('supports numeric and string custom selection keys', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Orders',
          rowSelectionKey: 'reference',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [
            { reference: 1001, name: 'Numeric' },
            { reference: 'ref-1002', name: 'String' }
          ],
          pagination: true
        }
      }
    });

    const checkboxes = wrapper.findAll('tbody input[aria-label="Select row"]');
    await checkboxes[0].setValue(true);
    await checkboxes[1].setValue(true);

    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('2 rows selected');
  });

  it('persists selected keys across page changes, sorting, searching, and clear when enabled', async () => {
    const wrapper = mount(Table, {
      props: {
        autoVisit: false,
        table: {
          name: 'Users',
          rowSelectionKey: 'uuid',
          persistRowSelectionAcrossPages: true,
          columns: [{ attribute: 'name', label: 'Name', sortable: true }],
          rows: [{ uuid: 'uuid-a', name: 'Ada' }],
          meta: { table: 'UsersTable' },
          actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
          hasBulkActions: true,
          pagination: true,
          state: { perPage: 15 }
        }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('1 row selected');

    await wrapper.setProps({
      table: {
        name: 'Users',
        rowSelectionKey: 'uuid',
        persistRowSelectionAcrossPages: true,
        columns: [{ attribute: 'name', label: 'Name', sortable: true }],
        rows: [{ uuid: 'uuid-b', name: 'Grace' }],
        meta: { table: 'UsersTable' },
        actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
        hasBulkActions: true,
        pagination: true,
        state: { perPage: 15, sort: 'name', search: 'grace' }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('2 rows selected');

    await wrapper.setProps({
      table: {
        name: 'Users',
        rowSelectionKey: 'uuid',
        persistRowSelectionAcrossPages: true,
        columns: [{ attribute: 'name', label: 'Name', sortable: true }],
        rows: [{ uuid: 'uuid-a', name: 'Ada' }],
        meta: { table: 'UsersTable' },
        actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
        hasBulkActions: true,
        pagination: true,
        state: { perPage: 15 }
      }
    });

    expect((wrapper.find('tbody input[aria-label="Select row"]').element as HTMLInputElement).checked).toBe(true);
  });

  it('selects and unselects only current page keys when persistence is enabled', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          rowSelectionKey: 'uuid',
          persistRowSelectionAcrossPages: true,
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ uuid: 'uuid-a', name: 'Ada' }, { uuid: 'uuid-b', name: 'Grace' }],
          meta: { table: 'UsersTable' },
          actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
          hasBulkActions: true,
          pagination: true
        }
      }
    });

    await wrapper.find('thead input[aria-label="Select all rows"]').setValue(true);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('2 rows selected');

    await wrapper.setProps({
      table: {
        name: 'Users',
        rowSelectionKey: 'uuid',
        persistRowSelectionAcrossPages: true,
        columns: [{ attribute: 'name', label: 'Name' }],
        rows: [{ uuid: 'uuid-c', name: 'Katherine' }],
        meta: { table: 'UsersTable' },
        actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/actions', bulk: true }],
        hasBulkActions: true,
        pagination: true
      }
    });

    await wrapper.find('thead input[aria-label="Select all rows"]').setValue(true);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('3 rows selected');

    await wrapper.find('thead input[aria-label="Select all rows"]').setValue(false);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('2 rows selected');
  });

  it('clears selection on page changes when persistence is disabled', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          rowSelectionKey: 'uuid',
          persistRowSelectionAcrossPages: false,
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ uuid: 'uuid-a', name: 'Ada' }],
          pagination: true
        }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    expect(wrapper.find('[data-test="selected-row-count"]').text()).toBe('1 row selected');

    await wrapper.setProps({
      table: {
        name: 'Users',
        rowSelectionKey: 'uuid',
        persistRowSelectionAcrossPages: false,
        columns: [{ attribute: 'name', label: 'Name' }],
        rows: [{ uuid: 'uuid-b', name: 'Grace' }],
        pagination: true
      }
    });

    expect(wrapper.find('[data-test="selected-row-count"]').exists()).toBe(false);
  });
});
