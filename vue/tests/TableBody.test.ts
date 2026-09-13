import { mount } from '@vue/test-utils';
import TableBody from '../src/components/TableBody.vue';
import { makeTableColumn } from './tableTestUtils';

describe('TableBody', () => {
  it('renders serial values and emits the clicked column', async () => {
    const wrapper = mount(TableBody, {
      props: {
        columns: [
          makeTableColumn({ attribute: 'serial', label: '#', type: 'serial-number' }),
          makeTableColumn({ attribute: 'name', label: 'Name' }),
        ],
        rows: [{ id: 1, name: 'Ada' }],
        stickyOffsets: {},
        stickySides: {},
        rowNumberStart: 4,
      },
      global: {
        stubs: {
          TableRowComponent: {
            props: ['row'],
            emits: ['click'],
            template: '<tr @click="$emit(\'click\', { row, event: $event })"><slot /></tr>',
          },
          TableCell: {
            props: ['column', 'row', 'value'],
            emits: ['click'],
            template: '<td :data-column="column.attribute" @click="$emit(\'click\', { row, column, value, event: $event })"><slot /></td>',
          },
          CellValue: {
            props: ['column', 'row', 'rowIndex', 'rowNumberStart'],
            template: '<span>{{ column.type === \'serial-number\' ? rowNumberStart + rowIndex : row[column.attribute] }}</span>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('4');
    await wrapper.find('[data-column="name"]').trigger('click');
    expect(wrapper.emitted('cellClick')?.[0]?.[0]).toMatchObject({ value: 'Ada', column: { attribute: 'name' } });
    expect(wrapper.emitted('rowClick')?.[0]?.[1]).toMatchObject({ attribute: 'name' });
  });
});