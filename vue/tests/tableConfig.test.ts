import { computed, defineComponent, h, type Component } from 'vue';
import { mount } from '@vue/test-utils';
import {
  configureTable,
  defaultTableConfiguration,
  iconFor,
  provideTableConfiguration,
  resetTableConfiguration,
  resolveTableConfiguration,
  tableClass,
  tableLabel,
  useTableConfiguration,
  useTableDarkMode,
} from '../src/config/tableConfig';
import {
  Table,
  TableFilterButton,
  TableFilterHeader,
  TableFilterDrawer,
  TableFilterPanel,
  ActiveFilters,
  normalizeTable,
  type TableResource,
} from '../src/index';

afterEach(() => resetTableConfiguration());

describe('table configuration', () => {
  it('merges overrides, deduplicates classes, and enables the dark theme', () => {
    const configuration = configureTable({
      icons: { search: 'custom-search' },
      classes: { root: 'zt-table custom custom', toolbar: '' },
      labels: { search: 'Find rows' },
      darkMode: true,
    });

    expect(configuration.icons.search).toBe('custom-search');
    expect(configuration.labels.search).toBe('Find rows');
    expect(configuration.classes.root.split(' ').filter((token) => token === 'custom')).toHaveLength(1);
    expect(configuration.classes.rootDark).toContain('dark');
    expect(configuration.classes.toolbar).toContain('dark:bg-slate-900');
  });

  it('accepts object dark-mode settings and raw Vue icon components', () => {
    const Icon = defineComponent({ render: () => h('svg') });
    const configuration = resolveTableConfiguration({
      icons: { retry: Icon as Component },
      darkMode: { enabled: true, class: 'theme-dark', attribute: 'data-theme' },
    });

    expect(configuration.darkMode).toMatchObject({ enabled: true, class: 'theme-dark', attribute: 'data-theme' });
    expect(configuration.icons.retry).toBe(Icon);
  });

  it('provides configuration to descendants and resolves classes and icons', () => {
    const Child = defineComponent({
      setup() {
        const configuration = useTableConfiguration();
        return () => h('output', {
          'data-class': tableClass('root', ['extra', false, 'extra']),
          'data-search-icon': String(iconFor('search')),
          'data-fallback-icon': String(iconFor('unconfigured-icon')),
          'data-label': configuration.value.labels.search,
        });
      },
    });
    const Parent = defineComponent({
      setup() {
        provideTableConfiguration(computed(() => ({
          icons: { search: 'provided-search' },
          labels: { search: 'Provided search' },
        })));
        return () => h(Child);
      },
    });

    const output = mount(Parent).find('output');

    expect(output.attributes('data-class')).toContain('extra');
    expect(output.attributes('data-search-icon')).toBe('provided-search');
    expect(output.attributes('data-fallback-icon')).toBe('unconfigured-icon');
    expect(output.attributes('data-label')).toBe('Provided search');
  });

  it('uses the global configuration when no provider is present', () => {
    configureTable({ labels: { search: 'Global search' }, darkMode: false });
    expect(resolveTableConfiguration().labels.search).toBe('Global search');
    expect(resolveTableConfiguration().darkMode.enabled).toBe(false);
  });

  const createTableData = (extra = {}) =>
    normalizeTable({
      name: 'Users',
      columns: [
        { attribute: 'name', label: 'Name', sortable: true },
        { attribute: 'role', label: 'Role', sortable: true },
      ],
      rows: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'editor' },
      ],
      filters: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          comparators: [
            { key: 'equals', label: 'Equals', value: 'equals' },
            { key: 'contains', label: 'Contains', value: 'contains' },
          ],
        },
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 2,
      },
      sorting: {},
      hasFilters: true,
      ...extra,
    }) as unknown as TableResource;

  it('exposes default filter and reordering labels, icons, and classes', () => {
    expect(defaultTableConfiguration.labels.applyFilters).toBe('Apply Filters');
    expect(defaultTableConfiguration.labels.resetAll).toBe('Reset All');
    expect(defaultTableConfiguration.labels.noFiltersAvailable).toBe('No filters available for this table.');
    expect(defaultTableConfiguration.icons.filterChevron).toBe('heroicons:chevron-down');
    expect(defaultTableConfiguration.icons.filterClose).toBe('heroicons:x-mark');
    expect(defaultTableConfiguration.classes.filterButton).toBe('zonvoir-table-filter-btn');

    // Reordering configuration
    expect(defaultTableConfiguration.labels.dragToReorder).toBe('Drag to reorder');
    expect(defaultTableConfiguration.labels.resetOrder).toBe('Reset to default order');
    expect(defaultTableConfiguration.icons.dragHandle).toBe('akar-icons:drag-vertical');
    expect(defaultTableConfiguration.classes.dragHandle).toContain('pointer-events-none');
    expect(defaultTableConfiguration.classes.reorderResetButton).toContain('font-medium');
    expect(defaultTableConfiguration.classes.reorderableHeaderCell).toContain('cursor-grab');
    expect(defaultTableConfiguration.classes.reorderDropTargetLeft).toContain('border-l-4');
  });

  it('supports tableLabel helper with string and dynamic functions', () => {
    expect(tableLabel('applyFilters')).toBe('Apply Filters');
    expect(tableLabel('filterBy', 'Status')).toBe('Filter by Status');
    expect(tableLabel('nonExistentKey')).toBe('nonExistentKey');
  });

  it('allows global customization of filter labels via configureTable', async () => {
    configureTable({
      labels: {
        applyFilters: 'Appliquer les filtres',
        resetAll: 'Tout réinitialiser',
        filters: 'Filtres',
      },
    });

    const wrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        table: createTableData({ filterLayout: 'drawer' }),
      },
      global: {
        stubs: {
          teleport: true,
          transition: false,
        },
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain('Filtres');
    expect(wrapper.text()).toContain('Tout réinitialiser');
    expect(wrapper.text()).toContain('Appliquer les filtres');

    wrapper.unmount();
  });

  it('allows per-table customization of filter labels and classes via :config prop', async () => {
    const tableData = createTableData({ filterLayout: 'drawer' });

    const wrapper = mount(Table, {
      props: {
        table: tableData,
        config: {
          labels: {
            filters: 'Custom Filter Title',
            applyFilters: 'Save Filters',
            resetAll: 'Clear Everything',
          },
          classes: {
            filterButton: 'my-custom-filter-button',
          },
        },
      },
      attachTo: document.body,
    });

    const filterBtn = wrapper.findComponent(TableFilterButton);
    expect(filterBtn.exists()).toBe(true);
    expect(filterBtn.classes()).toContain('my-custom-filter-button');
    expect(filterBtn.text()).toContain('Custom Filter Title');

    const drawerWrapper = mount(TableFilterDrawer, {
      props: {
        open: true,
        table: tableData as unknown as TableResource,
      },
      global: {
        provide: (wrapper.vm as unknown as { $: { provides: Record<string, unknown> } }).$?.provides,
        stubs: {
          teleport: true,
          transition: false,
        },
      },
      attachTo: document.body,
    });

    expect(drawerWrapper.text()).toContain('Custom Filter Title');
    expect(drawerWrapper.text()).toContain('Clear Everything');
    expect(drawerWrapper.text()).toContain('Save Filters');

    drawerWrapper.unmount();
    wrapper.unmount();
  });

  it('applies custom filter labels and icons in TableFilterHeader', async () => {
    const tableData = createTableData({
      filterLayout: 'header',
    });

    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        table: tableData as unknown as TableResource,
        filters: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
    });

    expect(wrapper.text()).toContain('Clear all filters');
    const clearBtn = wrapper.find('span[aria-label="Clear filter"]');
    expect(clearBtn.exists()).toBe(true);

    wrapper.unmount();
  });

  it('allows overriding custom icons in filter components', async () => {
    configureTable({
      icons: {
        filterClose: 'lucide:x',
        filterChevron: 'lucide:chevron-down',
      },
    });

    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
        modelValue: {},
      },
    });

    const icon = wrapper.findComponent({ name: 'CommonIcon' });
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('lucide:chevron-down');

    wrapper.unmount();
  });

  it('renders ActiveFilters with custom classes and custom remove icon', () => {
    configureTable({
      icons: {
        filterRemove: 'custom:trash-icon',
      },
      classes: {
        activeFilterTag: 'my-active-tag-class',
      },
    });

    const wrapper = mount(ActiveFilters, {
      props: {
        definitions: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
        filters: [{ key: 'name', comparator: 'equals', value: 'Alice' }],
      },
    });

    expect(wrapper.find('.my-active-tag-class').exists()).toBe(true);
    const removeIcon = wrapper.findComponent({ name: 'CommonIcon' });
    expect(removeIcon.props('icon')).toBe('custom:trash-icon');

    wrapper.unmount();
  });

  it('renders TableFilterPanel with customized labels', () => {
    configureTable({
      labels: {
        filters: 'Side Filters',
        applyFilters: 'Run Query',
        resetAll: 'Wipe All',
      },
    });

    const wrapper = mount(TableFilterPanel, {
      props: {
        open: true,
        table: createTableData({ filterLayout: 'panel' }),
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain('Side Filters');
    expect(wrapper.text()).toContain('Wipe All');
    expect(wrapper.text()).toContain('Run Query');

    wrapper.unmount();
  });

  it('correctly resolves dark mode state via useTableDarkMode', () => {
    configureTable({
      darkMode: true,
    });

    const { isDark, darkClass } = useTableDarkMode();
    expect(isDark.value).toBe(true);
    expect(darkClass.value).toBe('dark');

    configureTable({
      darkMode: {
        enabled: true,
        class: 'theme-dark',
      },
    });

    const { isDark: customDark, darkClass: customClass } = useTableDarkMode();
    expect(customDark.value).toBe(true);
    expect(customClass.value).toBe('theme-dark');

    configureTable({
      darkMode: false,
    });

    const { isDark: disabledDark } = useTableDarkMode();
    expect(disabledDark.value).toBe(false);
  });
});
