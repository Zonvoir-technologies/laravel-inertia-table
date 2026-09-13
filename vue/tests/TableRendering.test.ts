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
    expect(badge.attributes('data-color')).toBe('neutral');
    expect(badge.classes()).toContain('bg-neutral-500');
  });
});
