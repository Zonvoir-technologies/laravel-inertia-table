import { DOMWrapper, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import { Table } from '../src';
import TableActions from '../src/components/TableActions.vue';
import { installTableTestHooks, makeTableDefinition } from './tableTestUtils';

installTableTestHooks();

describe('Table Actions', () => {
  it('renders icon-only row action buttons while preserving action labels for accessibility', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'actions', label: 'Actions', type: 'action' }],
          rows: [{
            id: 1,
            _actions: [{ key: 'delete', label: 'Delete', type: 'custom', icon: 'heroicons:trash', showLabel: false }]
          }]
        }
      }
    });

    const button = wrapper.find('tbody td[data-column="actions"] button[aria-label="Delete"]');

    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('');
    expect(button.classes()).toContain('w-8');
  });

  it('uses action labels inside row action dropdowns even when buttons are configured icon-only', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'actions', label: 'Actions', type: 'action', meta: { dropdown: true } }],
          rows: [{
            id: 1,
            _actions: [{ key: 'delete', label: 'Delete', type: 'custom', icon: 'heroicons:trash', showLabel: false }]
          }]
        }
      }
    });

    await wrapper.find('tbody td[data-column="actions"] button[aria-label="Row actions"]').trigger('click');
    await nextTick();

    expect(new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).text()).toBe('Delete');
  });

  it('submits row actions with confirmation only after the user confirms', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        selectable: false,
        table: {
          name: 'Users',
          rowSelectionKey: 'uuid',
          columns: [{ attribute: 'actions', label: 'Actions', type: 'action' }],
          rows: [
            {
              id: 1,
              uuid: 'uuid-a',
              _actions: [
                {
                  key: 'delete',
                  label: 'Delete',
                  type: 'action',
                  endpoint: '/table/actions',
                  confirm: {
                    title: 'Delete Ada?',
                    message: 'This removes the user.',
                    confirmButton: 'Delete user',
                    cancelButton: 'Keep user'
                  },
                  data: { reason: 'duplicate' }
                }
              ]
            }
          ],
          meta: { table: 'UsersTable' }
        }
      }
    });

    await wrapper.find('tbody td[data-column="actions"] button[aria-label="Delete"]').trigger('click');
    await nextTick();

    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('Delete Ada?');
    expect(router.visit).not.toHaveBeenCalled();

    const dialogButtons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button'));
    await new DOMWrapper(dialogButtons.find((button) => button.textContent?.includes('Keep user'))!).trigger('click');
    await nextTick();

    expect(router.visit).not.toHaveBeenCalled();

    await wrapper.find('tbody td[data-column="actions"] button[aria-label="Delete"]').trigger('click');
    await nextTick();

    const confirmButtons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button'));
    await new DOMWrapper(confirmButtons.find((button) => button.textContent?.includes('Delete user'))!).trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/table/actions', expect.objectContaining({
      method: 'post',
      data: {
        table: 'UsersTable',
        action: 'delete',
        keys: ['uuid-a'],
        selectionMode: 'page',
        data: { reason: 'duplicate' }
      },
      preserveScroll: true,
      preserveState: false
    }));
  });

  it('does not execute disabled row actions', async () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'actions', label: 'Actions', type: 'action' }],
          rows: [
            {
              id: 1,
              _actions: [{ key: 'delete', label: 'Delete', type: 'action', endpoint: '/table/actions', disabled: true }]
            }
          ],
          meta: { table: 'UsersTable' }
        }
      }
    });

    const button = wrapper.find('tbody td[data-column="actions"] button[aria-label="Delete"]');

    expect(button.attributes('disabled')).toBeDefined();
    expect(button.attributes('aria-disabled')).toBe('true');

    await button.trigger('click');

    expect(router.visit).not.toHaveBeenCalled();
  });

  it('submits bulk actions with the selected page keys and selection mode', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }],
          pagination: {
            enabled: true,
            currentPage: 1,
            perPage: 15,
            defaultPerPage: 15,
            perPageOptions: [15],
            total: 42
          },
          meta: { table: 'UsersTable' },
          actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/bulk/archive', bulk: true }],
          hasBulkActions: true
        }
      }
    });

    await wrapper.find('thead input[aria-label="Select all rows"]').setValue(true);
    await wrapper.find('.zt-table-bulk-actions button:last-child').trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/bulk/archive', expect.objectContaining({
      method: 'post',
      data: expect.objectContaining({
        table: 'UsersTable',
        action: 'archive',
        keys: [1, 2],
        selectionMode: 'page',
        data: {}
      })
    }));
  });

  it('closes dropdown menus on Escape and outside pointer interaction', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }]
        }
      }
    });

    await wrapper.find('button[aria-haspopup="menu"]').trigger('click');
    await nextTick();

    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await wrapper.find('button[aria-haspopup="menu"]').trigger('click');
    await nextTick();

    document.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();

    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });
});

const buttonStub = {
  props: ['disabled'],
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
};

describe('TableActions remaining paths', () => {
  it('visits same-window URLs and emits actions with no endpoint', async () => {
    const wrapper = mount(TableActions, {
      props: {
        actions: [
          { key: 'show', label: '', tooltip: 'Show user', type: 'link', url: { url: '/users/1', method: 'patch', preserveScroll: false, preserveState: true } },
          { key: 'local', label: 'Local', type: 'action' },
        ],
      },
      global: { stubs: { CommonButton: buttonStub, CommonTooltip: { template: '<slot />' }, CommonIcon: true } },
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/users/1', expect.objectContaining({ method: 'patch', preserveScroll: false, preserveState: true }));
    await buttons[1].trigger('click');
    expect(wrapper.emitted('executed')?.[0]?.[0]).toMatchObject({ action: { key: 'local' } });
  });

  it('uses a dropdown action menu and does not render hidden actions', async () => {
    const wrapper = mount(TableActions, {

      attachTo: document.body,
      props: { dropdown: true, actions: [{ key: 'hidden', label: 'Hidden', type: 'custom', hidden: true }, { key: 'custom', label: 'Custom', type: 'custom', icon: 'user' }] },
    });
    await wrapper.find('button[aria-label="Row actions"]').trigger('click');
    expect(document.body.querySelector('[role="menuitem"]')?.textContent).toContain('Custom');
    expect(document.body.textContent).not.toContain('Hidden');
  });
});

describe('TableActions remaining dispatch paths', () => {
  it('visits same-window action links with their configured options', async () => {
    const wrapper = mount(TableActions, {
      props: { actions: [{
        key: 'details', label: '', tooltip: 'View details', type: 'link',
        url: { url: '/users/1', method: 'patch', preserveScroll: false, preserveState: false },
      }] },
      global: { stubs: { CommonButton: buttonStub, CommonTooltip: { template: '<slot />' } } },
    });

    await wrapper.find('button').trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/users/1', {
      method: 'patch', preserveScroll: false, preserveState: false,
    });
    expect(wrapper.emitted('executed')).toBeUndefined();
  });

  it('uses selected keys for endpoint actions without a row and clears loading on finish', async () => {
    const wrapper = mount(TableActions, {
      props: {
        actions: [{ key: 'archive', label: 'Archive', type: 'action', endpoint: '/archive' }],
        table: makeTableDefinition({ name: 'Users', rowSelectionKey: 'id', meta: { table: 'UsersTable' } }),
        selectedKeys: [1, 2], selectionMode: 'all',
      },
      global: { stubs: { CommonButton: buttonStub, CommonTooltip: { template: '<slot />' } } },
    });

    await wrapper.find('button').trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/archive', expect.objectContaining({ data: expect.objectContaining({ keys: [1, 2], selectionMode: 'all' }) }));
    const options = vi.mocked(router.visit).mock.calls[0][1] as { onFinish: () => void };
    options.onFinish();
    expect(wrapper.emitted('executed')?.[0]?.[0]).toMatchObject({ action: { key: 'archive' } });
  });
});

const actions = [
  { key: 'custom', label: 'Custom', type: 'custom' as const },
  { key: 'external', label: 'External', type: 'link' as const, url: { url: 'https://example.test', target: '_blank' } },
  { key: 'archive', label: 'Archive', type: 'action' as const, endpoint: '/users/archive', data: { source: 'table' } },
];

const dispatchButtonStub = {
  props: ['disabled'],
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
};

describe('TableActions dispatch', () => {
  it('dispatches custom, external, and endpoint actions for a row', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mount(TableActions, {
      props: {
        actions,
        table: makeTableDefinition({ name: 'Users', rowSelectionKey: 'uuid', meta: { table: 'UsersTable' } }),
        row: { uuid: 'user-a' },
      },
      global: {
        stubs: {
          CommonButton: dispatchButtonStub,
          CommonTooltip: { template: '<slot />' },
          CommonIcon: true,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    expect(wrapper.emitted('executed')?.[0]?.[0]).toMatchObject({ action: { key: 'custom' } });

    await buttons[1].trigger('click');
    expect(open).toHaveBeenCalledWith('https://example.test', '_blank');

    await buttons[2].trigger('click');
    expect(router.visit).toHaveBeenCalledWith('/users/archive', expect.objectContaining({
      method: 'post',
      data: expect.objectContaining({ keys: ['user-a'], data: { source: 'table' } }),
    }));
    const options = vi.mocked(router.visit).mock.calls[0][1] as { onFinish: () => void };
    options.onFinish();
    expect(wrapper.emitted('executed')?.[1]?.[0]).toMatchObject({ action: { key: 'external' } });
    expect(wrapper.emitted('executed')?.[2]?.[0]).toMatchObject({ action: { key: 'archive' } });
  });

  it('does not render hidden actions and disables endpoint actions without a table', () => {
    const wrapper = mount(TableActions, {
      props: { actions: [{ key: 'hidden', label: 'Hidden', type: 'custom', hidden: true }, actions[2]] },
      global: {
        stubs: {
          CommonButton: dispatchButtonStub,
          CommonTooltip: { template: '<slot />' },
        },
      },
    });

    expect(wrapper.text()).not.toContain('Hidden');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
