import { DOMWrapper, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import TableBulkActions from '../src/components/TableBulkActions.vue';
import { installTableTestHooks, makeTableDefinition } from './tableTestUtils';
installTableTestHooks();
const table = makeTableDefinition({ meta: { table: 'UsersTable' }, rowSelectionKey: 'id' });
const menuItem = (index: number): DOMWrapper<HTMLElement> => new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[index]);
const open = async (wrapper: ReturnType<typeof mount>): Promise<void> => { await wrapper.find('button').trigger('click'); await nextTick(); };
describe('TableBulkActions', () => {
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
