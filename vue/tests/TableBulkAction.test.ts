import { DOMWrapper, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import { Table } from '../src';
import TableBulkActions from '../src/components/TableBulkActions.vue';
import { installTableTestHooks, makeTableDefinition } from './tableTestUtils';
installTableTestHooks();
const table = makeTableDefinition({ meta: { table: 'UsersTable' }, rowSelectionKey: 'id' });
const menuItem = (index: number): DOMWrapper<HTMLElement> => new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[index]);
const open = async (wrapper: ReturnType<typeof mount>): Promise<void> => { await wrapper.find('button').trigger('click'); await nextTick(); };
describe('TableBulkActions', () => {
  it('forwards bulk actions through the table with the current selection', async () => {
    const onCustomAction = vi.fn();
    const wrapper = mount(Table, { attachTo: document.body, props: { onCustomAction, table: {
      columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }],
      actions: [{ key: 'preview', label: 'Preview', type: 'custom', bulk: true }], hasBulkActions: true
    } } });
    await wrapper.get('tbody input[aria-label="Select row"]').setValue(true);
    await wrapper.get('.zt-table-bulk-actions button').trigger('click');
    await nextTick();
    await menuItem(0).trigger('click');
    expect(onCustomAction).toHaveBeenCalledWith(expect.objectContaining({ key: 'preview' }), [1], expect.any(Function));
    onCustomAction.mock.calls[0][2]();
    expect(router.visit).not.toHaveBeenCalled();
  });

  it('passes selected keys to custom handlers and finishes only on callback', async () => {
    const onCustomAction = vi.fn();
    const wrapper = mount(TableBulkActions, { attachTo: document.body, props: {
      table, selectedKeys: [1, 2], onCustomAction,
      actions: [{ key: 'preview', label: 'Preview', type: 'custom' }]
    } });
    await open(wrapper);
    await menuItem(0).trigger('click');
    expect(onCustomAction).toHaveBeenCalledWith(expect.objectContaining({ key: 'preview' }), [1, 2], expect.any(Function));
    expect(wrapper.emitted('executed')).toBeUndefined();
    expect(router.visit).not.toHaveBeenCalled();
    onCustomAction.mock.calls[0][2]();
    expect(wrapper.emitted('executed')).toHaveLength(1);
  });

  it('executes custom, external and endpoint bulk actions', async () => {
    const opened = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mount(TableBulkActions, { attachTo: document.body, props: { table, selectedKeys: [1], selectionMode: 'all', actions: [{ key: 'custom', label: 'Custom', type: 'custom' }, { key: 'link', label: 'Link', type: 'link', url: { url: 'https://example.test', target: '_blank' } }, { key: 'post', label: 'Post', type: 'action', endpoint: '/bulk' }] } });
    await open(wrapper); await menuItem(0).trigger('click');
    expect(wrapper.emitted('executed')).toBeTruthy();
    await open(wrapper); await menuItem(1).trigger('click');
    expect(opened).toHaveBeenCalledWith('https://example.test', '_blank');
    await open(wrapper); await menuItem(2).trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/bulk', expect.objectContaining({ data: expect.objectContaining({ keys: [1], selectionMode: 'all' }) }));
  });
});
  it('uses the row selection key and completes endpoint actions', async () => {
    const wrapper = mount(TableBulkActions, {
      attachTo: document.body,
      props: {
        table,
        row: { id: 7 },
        selectedKeys: [1, 2],
        actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/bulk/archive', data: { reason: 'stale' } }],
      },
    });

    await open(wrapper);
    await menuItem(0).trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/bulk/archive', expect.objectContaining({
      data: expect.objectContaining({ keys: [7], data: { reason: 'stale' } }),
    }));
    const options = vi.mocked(router.visit).mock.calls[0][1] as { onFinish: () => void };
    options.onFinish();
    expect(wrapper.emitted('executed')?.[0]?.[0]).toMatchObject({ action: { key: 'archive' } });
  });

  it('visits same-tab URLs and keeps disabled or hidden actions unavailable', async () => {
    const wrapper = mount(TableBulkActions, {
      attachTo: document.body,
      props: {
        table,
        selectedKeys: [1],
        actions: [
          { key: 'same-tab', label: 'Same tab', type: 'link', url: { url: '/users', method: 'put', preserveState: false } },
          { key: 'disabled', label: 'Disabled', type: 'custom', disabled: true },
        ],
      },
    });

    await open(wrapper);
    await menuItem(0).trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'put', preserveState: false }));
    await open(wrapper);
    expect(menuItem(1).attributes('disabled')).toBeDefined();

    const hidden = mount(TableBulkActions, {
      props: { table, actions: [{ key: 'hidden', label: 'Hidden', type: 'custom', hidden: true }] },
    });
    expect(hidden.find('button').exists()).toBe(false);
  });
