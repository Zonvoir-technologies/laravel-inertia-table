import { mount } from '@vue/test-utils';
import TableHeader from '../src/components/TableHeader.vue';
import type { TableColumn } from '../src/types/table';

const dropdownStub = {
  props: ['column'],
  emits: ['sort', 'stick', 'hide'],
  template: `<div>
    <button class="sort" @click="$emit('sort', 'asc')"><slot /></button>
    <button class="stick" @click="$emit('stick')">stick</button>
    <button class="hide" @click="$emit('hide')">hide</button>
  </div>`,
};

const columns: TableColumn[] = [
  { attribute: 'name', label: 'Name', sortable: true, toggleable: false, stickable: true, visible: true, alignment: 'right', meta: {}, tooltip: 'Person name' },
  { attribute: 'email', label: 'Email', sortable: false, toggleable: true, visible: true, alignment: 'center', meta: {} },
  { attribute: 'role', label: 'Role', sortable: false, toggleable: false, visible: true, alignment: 'left', meta: {}, tooltip: 'Access role' },
];

describe('TableHeader guards', () => {
  it('forwards only supported sort, stick, and hide actions', async () => {
    const wrapper = mount(TableHeader, {
      props: {
        columns,
        sorting: { column: null, direction: null },
        sticky: false,
        stickyOffsets: {},
        stickySides: {},
        isColumnSticky: () => false,
      },
      global: {
        stubs: {
          TableCell: { template: '<th><slot /></th>' },
          TableHeaderDropdown: dropdownStub,
          CommonTooltip: { props: ['text'], template: '<span :data-tooltip="text"><slot /></span>' },
        },
      },
    });

    const dropdowns = wrapper.findAllComponents(dropdownStub);
    await dropdowns[0].find('.sort').trigger('click');
    await dropdowns[0].find('.stick').trigger('click');
    await dropdowns[0].find('.hide').trigger('click');
    await dropdowns[1].find('.sort').trigger('click');
    await dropdowns[1].find('.stick').trigger('click');
    await dropdowns[1].find('.hide').trigger('click');

    expect(wrapper.emitted('sort')).toEqual([[{ column: columns[0], direction: 'asc' }]]);
    expect(wrapper.emitted('stick')).toEqual([[columns[0]]]);
    expect(wrapper.emitted('hide')).toEqual([[columns[1]]]);
    expect(wrapper.find('[data-tooltip="Access role"]').exists()).toBe(true);
    expect(wrapper.find('thead').classes()).toContain('relative');
  });
});