import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TableFilterPanel from '../src/components/TableFilterPanel.vue';

describe('TableFilterPanel.vue', () => {
  const filters = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      comparators: [{ key: 'equals', label: 'Equals' }],
    },
  ];

  it('renders inline panel when open is true', () => {
    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    expect(wrapper.find('aside').exists()).toBe(true);
    expect(wrapper.text()).toContain('Filters');
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.find('button[aria-label="Close filters panel"]').exists()).toBe(true);
  });

  it('emits clear and update:open false when Reset All is clicked', async () => {
    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 1,
      },
    });

    const resetButton = wrapper.findAll('button').find((b) => b.text() === 'Reset All');
    expect(resetButton).toBeDefined();
    await resetButton!.trigger('click');

    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('emits apply when Apply Filters is clicked', async () => {
    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        filters,
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
    });

    const applyButton = wrapper.findAll('button').find((b) => b.text() === 'Apply Filters');
    expect(applyButton).toBeDefined();
    await applyButton!.trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
  });

  it('reconciles draft when server filter state updates while open', async () => {
    const table = {
      name: 'users',
      filters,
      state: {
        filters: [{ key: 'name', comparator: 'equals', value: 'John' }],
      },
    };

    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        table,
      },
    });

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('John');

    // Server state updates while panel remains open
    await wrapper.setProps({
      table: {
        name: 'users',
        filters,
        state: {
          filters: [{ key: 'name', comparator: 'equals', value: 'Jane' }],
        },
      },
    });

    expect((input.element as HTMLInputElement).value).toBe('Jane');
  });

  it('submits controlled modelValue when provided alongside table prop', async () => {
    const table = {
      name: 'users',
      filters,
      state: {
        filters: [{ key: 'name', comparator: 'equals', value: 'John' }],
      },
    };

    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        table,
        autoVisit: false,
        modelValue: {
          name: { comparator: 'equals', value: 'Jane' },
        },
      },
    });

    const applyButton = wrapper.findAll('button').find((b) => b.text() === 'Apply Filters');
    await applyButton!.trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
    const filterChangeEvents = wrapper.emitted('filter-change');
    expect(filterChangeEvents).toBeTruthy();
    expect(filterChangeEvents![0][0]).toEqual([
      { key: 'name', comparator: 'equals', value: 'Jane' },
    ]);
  });

  it('renders a sticky inner container with scrollable body and pinned footer', () => {
    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        filters,
        modelValue: {},
        activeCount: 0,
      },
    });

    const stickyContainer = wrapper.find('.zonvoir-table-filter-panel-sticky');
    expect(stickyContainer.exists()).toBe(true);
    expect(stickyContainer.classes()).toContain('sticky');
    expect(stickyContainer.classes()).toContain('top-0');

    // Body should be flex-1 min-h-0 overflow-y-auto so footer stays pinned at the bottom on all screens
    const body = stickyContainer.find('.overflow-y-auto');
    expect(body.exists()).toBe(true);
    expect(body.classes()).toContain('flex-1');
    expect(body.classes()).toContain('min-h-0');

    // Footer should be shrink-0 and mt-auto so buttons are pinned at bottom of viewport
    const footer = stickyContainer.findAll('div').find((d) => d.classes().includes('border-t'));
    expect(footer?.exists()).toBe(true);
    expect(footer?.classes()).toContain('shrink-0');
    expect(footer?.classes()).toContain('mt-auto');
    expect(footer?.text()).toContain('Reset All');
    expect(footer?.text()).toContain('Apply Filters');
  });
});

