import { mount } from '@vue/test-utils';
import { Table } from '../src';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

describe('Table Slots', () => {
  it('renders custom toolbar table and empty-state slots with useful slot props', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          emptyState: { title: 'No users' }
        }
      },
      slots: {
        toolbar: '<template #default="{ table }"><div data-test="custom-toolbar">{{ table.name }}</div></template>',
        table: '<template #default="{ columns, rows }"><div data-test="custom-table">{{ columns.length }} columns/{{ rows.length }} rows</div></template>',
        emptyState: '<template #default="{ emptyState }"><div data-test="custom-empty">{{ emptyState.title }}</div></template>'
      }
    });

    expect(wrapper.find('[data-test="custom-toolbar"]').text()).toBe('Users');
    expect(wrapper.find('[data-test="custom-table"]').text()).toBe('1 columns/0 rows');
    expect(wrapper.find('[data-test="custom-empty"]').exists()).toBe(false);
  });

  it('renders custom empty-state content when the default table slot is used', () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [],
          emptyState: { title: 'No users' }
        }
      },
      slots: {
        emptyState: '<template #default="{ emptyState, columns, rows }"><div data-test="custom-empty">{{ emptyState.title }}: {{ columns.length }}/{{ rows.length }}</div></template>'
      }
    });

    expect(wrapper.find('[data-test="custom-empty"]').text()).toBe('No users: 1/0');
    expect(wrapper.text()).not.toContain('No rows found.');
  });

  it('uses the existing cell slot for custom image rendering', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'avatar', label: 'Avatar' }],
          rows: [{
            id: 1,
            avatar: '/avatars/ada.png',
            name: 'Ada'
          }]
        }
      },
      slots: {
        'cell(avatar)': '<template #default="{ row }"><strong data-test="custom-avatar">{{ row.name }}: {{ row.avatar }}</strong></template>'
      }
    });

    expect(wrapper.find('[data-test="custom-avatar"]').text()).toBe('Ada: /avatars/ada.png');
    expect(wrapper.find('[data-test="table-image"]').exists()).toBe(false);
  });
  it('forwards column-specific header slots before the shared header slot', () => {
    const wrapper = mount(Table, {
      props: { table: { name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }] } },
      slots: {
        'header(name)': '<template #default="{ column }"><span data-test="named-header">Named {{ column.attribute }}</span></template>',
        header: '<template #default="{ column }"><span data-test="default-header">Default {{ column.attribute }}</span></template>',
      },
    });

    expect(wrapper.find('[data-test="named-header"]').text()).toBe('Named name');
    expect(wrapper.find('[data-test="default-header"]').exists()).toBe(false);
  });
  it('uses the shared header slot when a column-specific slot is absent', () => {
    const wrapper = mount(Table, {
      props: { table: { name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }] } },
      slots: { header: '<template #default="{ column }"><span data-test="default-header">Default {{ column.attribute }}</span></template>' },
    });

    expect(wrapper.find('[data-test="default-header"]').text()).toBe('Default name');
  });
});
