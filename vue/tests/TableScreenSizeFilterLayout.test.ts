import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Table from '../src/components/Table.vue';
import TableFilterPanel from '../src/components/TableFilterPanel.vue';
import TableFilterDrawer from '../src/components/TableFilterDrawer.vue';
import { setScreenSize, resetScreenSize } from '../src/composables/useScreenSize';

interface ExposedTableVm {
  toggleFilters: () => void;
  isLargeScreen: boolean;
  isFiltersOpen: boolean;
}

describe('Table filter layout based on screen size', () => {
  const tableData = {
    name: 'Users',
    columns: [{ attribute: 'name', label: 'Name' }],
    rows: [],
    hasFilters: true,
    filterLayout: 'drawer',
    filters: [
      { key: 'name', label: 'Name', type: 'text', comparators: [{ key: 'equals', label: 'Equals' }] },
    ],
  };

  beforeEach(() => {
    resetScreenSize();
  });

  afterEach(() => {
    resetScreenSize();
  });

  it('renders TableFilterPanel on large screens when filterLayout is drawer', async () => {
    setScreenSize(1280);

    const wrapper = mount(Table, {
      props: {
        table: tableData,
      },
    });

    const exposed = wrapper.vm as unknown as ExposedTableVm;
    exposed.toggleFilters();
    await wrapper.vm.$nextTick();

    expect(exposed.isLargeScreen).toBe(true);
    expect(wrapper.findComponent(TableFilterPanel).exists()).toBe(true);
    expect(wrapper.findComponent(TableFilterDrawer).exists()).toBe(false);
  });

  it('renders TableFilterDrawer on smaller screens when filterLayout is drawer', async () => {
    setScreenSize(768);

    const wrapper = mount(Table, {
      props: {
        table: tableData,
      },
    });

    const exposed = wrapper.vm as unknown as ExposedTableVm;
    exposed.toggleFilters();
    await wrapper.vm.$nextTick();

    expect(exposed.isLargeScreen).toBe(false);
    expect(wrapper.findComponent(TableFilterPanel).exists()).toBe(false);
    expect(wrapper.findComponent(TableFilterDrawer).exists()).toBe(true);
  });

  it('dynamically switches between TableFilterPanel and TableFilterDrawer when screen size changes', async () => {
    setScreenSize(1200);

    const wrapper = mount(Table, {
      props: {
        table: tableData,
      },
    });

    const exposed = wrapper.vm as unknown as ExposedTableVm;
    exposed.toggleFilters();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(TableFilterPanel).exists()).toBe(true);
    expect(wrapper.findComponent(TableFilterDrawer).exists()).toBe(false);

    // Resize down to mobile / tablet screen
    setScreenSize(600);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(TableFilterPanel).exists()).toBe(false);
    expect(wrapper.findComponent(TableFilterDrawer).exists()).toBe(true);

    // Resize back to desktop screen
    setScreenSize(1400);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(TableFilterPanel).exists()).toBe(true);
    expect(wrapper.findComponent(TableFilterDrawer).exists()).toBe(false);
  });

  it('respects custom filterBreakpoint prop', async () => {
    // 900px is below default 'lg' (1024), but above custom breakpoint 800
    setScreenSize(900);

    const wrapperWithCustomBp = mount(Table, {
      props: {
        table: tableData,
        filterBreakpoint: 800,
      },
    });

    const exposed = wrapperWithCustomBp.vm as unknown as ExposedTableVm;
    exposed.toggleFilters();
    await wrapperWithCustomBp.vm.$nextTick();

    expect(exposed.isLargeScreen).toBe(true);
    expect(wrapperWithCustomBp.findComponent(TableFilterPanel).exists()).toBe(true);
    expect(wrapperWithCustomBp.findComponent(TableFilterDrawer).exists()).toBe(false);
  });

  it('forwards filter-change and close events from responsive filter component', async () => {
    setScreenSize(1200);

    const wrapper = mount(Table, {
      props: {
        table: tableData,
      },
    });

    const exposed = wrapper.vm as unknown as ExposedTableVm;
    exposed.toggleFilters();
    await wrapper.vm.$nextTick();

    const panel = wrapper.findComponent(TableFilterPanel);
    expect(panel.exists()).toBe(true);

    panel.vm.$emit('filter-change', [{ key: 'name', comparator: 'equals', value: 'Bob' }]);
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')?.[0]).toEqual([
      [{ key: 'name', comparator: 'equals', value: 'Bob' }],
    ]);

    panel.vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(exposed.isFiltersOpen).toBe(false);
  });
});
