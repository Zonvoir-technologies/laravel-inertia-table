import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TableFilterDrawer from '../src/components/TableFilterDrawer.vue';

describe('TableFilterDrawer.vue', () => {
  const filters = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      comparators: [{ key: 'equals', label: 'Equals' }],
    },
  ];

  it('renders drawer when open is true', () => {
    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    expect(wrapper.text()).toContain('Filters');
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.find('button[aria-label="Close filters drawer"]').exists()).toBe(true);
  });

  it('emits clear and update:open false when Reset All is clicked', async () => {
    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 1,
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    const resetButton = wrapper.findAll('button').find((b) => b.text() === 'Reset All');
    expect(resetButton).toBeDefined();
    await resetButton!.trigger('click');

    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('emits apply and update:open false when Apply Filters is clicked', async () => {
    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        filters,
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    const applyButton = wrapper.findAll('button').find((b) => b.text() === 'Apply Filters');
    expect(applyButton).toBeDefined();
    await applyButton!.trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('supports table prop integration with useTableFilters', () => {
    const table = {
      name: 'users',
      filters,
      state: {
        filters: [{ key: 'name', comparator: 'equals', value: 'Jane' }],
      },
    };

    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        table,
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    expect(wrapper.find('div[role="dialog"]').exists()).toBe(true);
    expect(wrapper.find('div[role="dialog"]').attributes('aria-modal')).toBe('true');
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('Jane');
  });

  it('renders custom filter slot #filter(key) with slot props in drawer', () => {
    let capturedProps: { filter: { key: string }; value: unknown; update: (val: unknown) => void } | null = null;
    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        filters: [
          {
            key: 'role',
            label: 'Role',
            type: 'text',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
        modelValue: { role: { comparator: 'equals', value: 'admin' } },
        activeCount: 1,
      },
      slots: {
        'filter(role)': (props) => {
          capturedProps = props as unknown as typeof capturedProps;
          return 'fsdf';
        },
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    expect(wrapper.text()).toContain('fsdf');
    expect(capturedProps).toBeDefined();
    expect(capturedProps!.filter.key).toBe('role');
    expect(capturedProps!.value).toBe('admin');
    expect(typeof capturedProps!.update).toBe('function');
  });

  it('resolves filter slot #filter(key) from parent component in drawer', () => {
    const ParentComponent = {
      components: { TableFilterDrawer },
      props: ['filters', 'open'],
      template: `
        <div>
          <TableFilterDrawer :filters="filters" :open="open" />
        </div>
      `,
    };

    const wrapper = mount(ParentComponent, {
      props: {
        open: true,
        filters: [
          {
            key: 'status',
            label: 'Status',
            type: 'text',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
      },
      slots: {
        'filter(status)': '<div class="custom-status-drawer">Custom Status Drawer Slot Content</div>',
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
    });

    expect(wrapper.text()).toContain('Custom Status Drawer Slot Content');
  });
});

