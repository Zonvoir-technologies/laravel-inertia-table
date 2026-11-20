import { mount } from '@vue/test-utils';
import { normalizeTable, Table } from '../src';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

describe('Table Rendering', () => {
  it('renders a table definition', () => {
    const table = normalizeTable({
      name: 'Users',
      columns: [
        { attribute: 'name', label: 'Name' },
        { attribute: 'email', label: 'Email' }
      ],
      rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }]
    });

    const wrapper = mount(Table, {
      props: {
        table
      }
    });

    expect(wrapper.text()).toContain('Users');
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.text()).toContain('Ada');
  });

  it('renders from a backend table payload prop', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [
            { attribute: 'name', label: 'Name' },
            { attribute: 'email', label: 'Email' }
          ],
          rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }]
        }
      }
    });

    expect(wrapper.find('[data-test="zonvoir-table"]').exists()).toBe(true);
    expect(wrapper.find('input[type="search"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.text()).toContain('Ada');
  });

  it('handles a table payload arriving after initial render', async () => {
    const wrapper = mount(Table, {
      props: {}
    });

    expect(wrapper.text()).toContain('Unable to load table');

    await wrapper.setProps({
      table: {
        name: 'Employees',
        columns: [{ attribute: 'name', label: 'Name' }],
        rows: [{ id: 1, name: 'Ada' }]
      }
    });

    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('Ada');
  });

  it('applies sticky header classes from a backend payload', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          stickyHeader: true,
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }]
        }
      }
    });

    expect(wrapper.find('thead').classes()).toContain('sticky');
    expect(wrapper.find('thead').classes()).toContain('top-0');
  });

  it('renders the empty state', () => {
    const table = normalizeTable({
      name: 'Users',
      columns: [{ attribute: 'name', label: 'Name' }],
      rows: [],
      emptyState: 'Nothing to show yet.'
    });

    const wrapper = mount(Table, {
      props: {
        table
      }
    });

    expect(wrapper.text()).toContain('Nothing to show yet.');
  });

  it('renders the loading state', () => {
    const table = normalizeTable({
      name: 'Users',
      columns: [{ attribute: 'name', label: 'Name' }],
      rows: []
    });

    const wrapper = mount(Table, {
      props: {
        table,
        loading: true
      }
    });

    expect(wrapper.text()).toContain('Loading rows...');
    expect(wrapper.text()).not.toContain('No rows found.');
  });

  it('renders badge cells with customization hooks', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [
            {
              attribute: 'status',
              label: 'Status',
              type: 'badge',
              meta: {
                colors: {
                  active: 'blue'
                },
                icons: {
                  active: 'heroicons:check-circle'
                }
              }
            }
          ],
          rows: [{ id: 1, status: 'Active' }]
        }
      }
    });

    const badge = wrapper.find('tbody td[data-column="status"] .zt-badge');

    expect(badge.text()).toBe('Active');
    expect(badge.attributes('data-variant')).toBe('outline');
    expect(badge.attributes('data-color')).toBe('blue');
    expect(badge.classes()).toContain('zt-badge');
    expect(badge.find('[data-icon="heroicons:check-circle"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="zonvoir-table"]').classes()).toContain('zt-table');
    expect(wrapper.find('thead').classes()).toContain('zt-table-head');
    expect(wrapper.find('tbody').classes()).toContain('zt-table-body');
    expect(wrapper.find('tbody tr').classes()).toContain('zt-table-row');
    expect(wrapper.find('tbody td[data-column="status"]').classes()).toContain('zt-table-cell');
  });

  it('renders solid badge cells when configured', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [
            {
              attribute: 'status',
              label: 'Status',
              type: 'badge',
              meta: {
                variant: 'solid',
                colors: {
                  active: 'green'
                }
              }
            }
          ],
          rows: [{ id: 1, status: 'Active' }]
        }
      }
    });

    const badge = wrapper.find('tbody td[data-column="status"] .zt-badge');

    expect(badge.attributes('data-variant')).toBe('solid');
    expect(badge.attributes('data-color')).toBe('green');
    expect(badge.classes()).toContain('bg-green-500');
    expect(badge.classes()).toContain('text-white');
  });

  it('uses neutral as the default badge color when no color mapping matches', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [
            {
              attribute: 'status',
              label: 'Status',
              type: 'badge',
              meta: {
                variant: 'solid',
                colors: {
                  active: 'green'
                }
              }
            }
          ],
          rows: [{ id: 1, status: 'Inactive' }]
        }
      }
    });

    const badge = wrapper.find('tbody td[data-column="status"] .zt-badge');

    expect(badge.attributes('data-variant')).toBe('solid');
    expect(badge.attributes('data-color')).toBe('primary');
    expect(badge.classes()).toContain('bg-[var(--zt-primary,#0f172a)]');
  });

  it('renders TableFilterHeader when filterLayout is header and TableFilterPanel when panel', async () => {
    const { TableFilterHeader, TableFilterPanel } = await import('../src/index');

    const wrapperHeader = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: true,
          filterLayout: 'header',
          filters: [{ key: 'name', label: 'Name', type: 'text', comparators: [{ key: 'equals', label: 'Equals' }] }],
        }
      }
    });

    const exposedHeader = wrapperHeader.vm as unknown as { toggleFilters: () => void };
    exposedHeader.toggleFilters();
    await wrapperHeader.vm.$nextTick();

    expect(wrapperHeader.findComponent(TableFilterHeader).exists()).toBe(true);
    expect(wrapperHeader.findComponent(TableFilterPanel).exists()).toBe(false);

    const wrapperPanel = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: true,
          filterLayout: 'panel',
          filters: [{ key: 'name', label: 'Name', type: 'text', comparators: [{ key: 'equals', label: 'Equals' }] }],
        }
      }
    });

    const exposedPanel = wrapperPanel.vm as unknown as { toggleFilters: () => void };
    exposedPanel.toggleFilters();
    await wrapperPanel.vm.$nextTick();

    expect(wrapperPanel.findComponent(TableFilterPanel).exists()).toBe(true);
    expect(wrapperPanel.findComponent(TableFilterHeader).exists()).toBe(false);
  });

  it('emits filter-change when filter emits filter-change', async () => {
    const { TableFilterHeader } = await import('../src/index');

    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: true,
          filterLayout: 'header',
          filters: [{ key: 'name', label: 'Name', type: 'text', comparators: [{ key: 'equals', label: 'Equals' }] }],
        }
      }
    });

    const exposed = wrapper.vm as unknown as { toggleFilters: () => void };
    exposed.toggleFilters();
    await wrapper.vm.$nextTick();

    const header = wrapper.findComponent(TableFilterHeader);
    expect(header.exists()).toBe(true);
    header.vm.$emit('filter-change', [{ key: 'name', comparator: 'equals', value: 'Alice' }]);
    expect(wrapper.emitted('filter-change')).toBeTruthy();
    expect(wrapper.emitted('filter-change')?.[0]).toEqual([[{ key: 'name', comparator: 'equals', value: 'Alice' }]]);
  });

  it('automatically enables filter button when hasFilters is true', async () => {
    const { TableFilterButton } = await import('../src/index');

    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: true,
          filters: [
            { key: 'name', label: 'Name', type: 'text', comparators: [{ key: 'equals', label: 'Equals' }] }
          ],
        },
      },
    });

    expect(wrapper.findComponent(TableFilterButton).exists()).toBe(true);
  });

  it('does not render filter button when hasFilters is false and no filters exist', async () => {
    const { TableFilterButton } = await import('../src/index');

    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: false,
        },
      },
    });

    expect(wrapper.findComponent(TableFilterButton).exists()).toBe(false);
  });

  it('allows replacing the entire filter panel section via #filter-panel or #filters slot', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          hasFilters: true,
          filterLayout: 'panel',
        },
      },
      slots: {
        'filter-panel': '<template #default="{ table }"><div data-test="custom-sidebar">Custom Filter Sidebar for {{ table.name }}</div></template>',
      },
    });

    expect(wrapper.find('[data-test="custom-sidebar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="custom-sidebar"]').text()).toBe('Custom Filter Sidebar for Users');
  });

  it('preserves header cell vertical padding when selectable is disabled', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          selectable: false,
          columns: [
            { attribute: 'name', label: 'Name' },
            { attribute: 'email', label: 'Email' }
          ],
          rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }]
        }
      }
    });

    const headerCells = wrapper.findAll('thead th');
    expect(headerCells).toHaveLength(2);
    expect(headerCells[0].classes()).toContain('py-3');
    expect(headerCells[0].classes()).toContain('px-4');
    expect(headerCells[1].classes()).toContain('py-3');
  });
});

