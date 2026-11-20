import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { CommonDropdown } from '../src/index';
import TableFilterHeader from '../src/components/TableFilterHeader.vue';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TableFilterHeader.vue', () => {
  const filters = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      comparators: [
        { key: 'equals', label: 'Equals' },
        { key: 'contains', label: 'Contains' },
      ],
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      comparators: [{ key: 'contains', label: 'Contains' }],
    },
  ];

  it('renders header section with filter pills when open is true', () => {
    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    expect(wrapper.find('section').exists()).toBe(true);
    expect(wrapper.find('section').attributes('aria-label')).toBe('Table filters');
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.findAllComponents(CommonDropdown)).toHaveLength(2);
  });

  it('does not render when open is false', () => {
    const wrapper = mount(TableFilterHeader, {
      props: {
        open: false,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    expect(wrapper.find('section').exists()).toBe(false);
  });

  it('displays active comparator and value on active pill and clears on x click', async () => {
    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters,
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
    });

    const pill = wrapper.find('button[aria-label="Filter by Name"]');
    expect(pill.text()).toContain('Equals');
    expect(pill.text()).toContain('John');
    const clearBtn = wrapper.find('span[aria-label=\"Clear filter\"]');
    expect(clearBtn.exists()).toBe(true);

    await clearBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[{}]]);
    expect(wrapper.emitted('apply')).toBeTruthy();
  });

  it('emits clear through the exposed clear-all handler', () => {
    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters,
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
    });

    wrapper.vm.handleClearAll();

    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('emits apply when value is typed and debounced', async () => {
    vi.useFakeTimers();
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    const trigger = wrapper.find('button[aria-label="Filter by Name"]');
    await trigger.trigger('click');

    const input = document.body.querySelector('input[aria-label="Filter value"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    input.value = 'ray';
    input.dispatchEvent(new Event('input'));
    expect(wrapper.emitted('apply')).toBeFalsy();

    vi.advanceTimersByTime(450);
    expect(wrapper.emitted('apply')).toBeTruthy();
    vi.useRealTimers();
    wrapper.unmount();
  });

  it('emits apply when pressing Enter in input', async () => {
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    const trigger = wrapper.find('button[aria-label="Filter by Name"]');
    await trigger.trigger('click');

    const input = document.body.querySelector('input[aria-label="Filter value"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = 'john';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(wrapper.emitted('apply')).toBeTruthy();
    wrapper.unmount();
  });

  it('preserves comparator selection when value is empty and uses it when typing', async () => {
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: {
        open: true,
        filters,
        activeCount: 0,
      },
    });

    const trigger = wrapper.find('button[aria-label="Filter by Name"]');
    // Initially shows default comparator Equals
    expect(trigger.text()).toContain('Equals');

    await trigger.trigger('click');

    const select = document.body.querySelector('select[aria-label="Filter comparator"]') as HTMLSelectElement;
    expect(select).not.toBeNull();

    // User changes comparator to 'contains' while input is empty
    select.value = 'contains';
    select.dispatchEvent(new Event('change'));
    await wrapper.vm.$nextTick();

    // The pill must now display 'Contains' (not revert to 'Equals')
    expect(trigger.text()).toContain('Contains');

    // The select must remain 'contains'
    expect(select.value).toBe('contains');

    // User now types in value
    const input = document.body.querySelector('input[aria-label="Filter value"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();

    // The pill and draft must retain 'contains' (not revert to 'equals')
    expect(trigger.text()).toContain('Contains');
    expect(trigger.text()).toContain('foo');

    wrapper.unmount();
  });

  it('renders custom filter slot #filter(key) with slot props', async () => {
    let capturedProps: { filter: { key: string }; value: unknown; update: (val: unknown) => void; setDisplayValue: (val: string) => void } | null = null;
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
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
    });

    const trigger = wrapper.find('button[aria-label="Filter by Role"]');
    await trigger.trigger('click');

    expect(document.body.innerHTML).toContain('fsdf');
    expect(capturedProps).toBeDefined();
    expect(capturedProps!.filter.key).toBe('role');
    expect(capturedProps!.value).toBe('admin');
    expect(typeof capturedProps!.update).toBe('function');
    expect(typeof capturedProps!.setDisplayValue).toBe('function');

    wrapper.unmount();
  });

  it('resolves filter slot #filter(key) from parent component', async () => {
    const ParentComponent = {
      components: { TableFilterHeader },
      props: ['filters', 'open'],
      template: `
        <div>
          <TableFilterHeader :filters="filters" :open="open" />
        </div>
      `,
    };

    const wrapper = mount(ParentComponent, {
      attachTo: document.body,
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
        'filter(status)': '<div class="custom-status-slot">Custom Status Slot Content</div>',
      },
    });

    const trigger = wrapper.find('button[aria-label="Filter by Status"]');
    await trigger.trigger('click');

    expect(document.body.innerHTML).toContain('Custom Status Slot Content');
    wrapper.unmount();
  });
});

