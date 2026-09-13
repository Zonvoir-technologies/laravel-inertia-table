import { mount } from '@vue/test-utils';
import BooleanColumn from '../src/components/Column/BooleanColumn.vue';
import NumberColumn from '../src/components/Column/NumberColumn.vue';
import DateColumn from '../src/components/Column/DateColumn.vue';
import DateTimeColumn from '../src/components/Column/DateTimeColumn.vue';
import type { TableColumn, TableMeta, TableRow } from '../src/types/table';

const column = (attribute: string, meta: TableMeta = {}, cellClass: string | null = null): TableColumn => ({
  attribute,
  label: attribute,
  sortable: false,
  toggleable: false,
  visible: true,
  alignment: 'left',
  meta,
  cellClass
});

const row = (value: unknown, attribute = 'value'): TableRow => ({ id: 1, [attribute]: value } as TableRow);

describe('column components', () => {
  it.each([
    [null, '-', {}],
    ['', 'Missing', { placeholder: 'Missing' }],
    ['1,234.5', '$1,234,50 USD', { precision: 2, thousandsSeparator: ',', decimalSeparator: ',', prefix: '$', suffix: ' USD' }],
    [-1000, '-1 000', { thousandsSeparator: ' ' }],
    ['not a number', 'not a number', {}],
    [Infinity, 'Infinity', {}]
  ])('formats numeric value %p', (value, expected, meta) => {
    expect(mount(NumberColumn, { props: { column: column('value', meta), row: row(value) } }).text()).toBe(expected);
  });

  it('renders boolean labels across value types', () => {
    expect(mount(BooleanColumn, { props: { column: column('value', { trueLabel: 'Active' }), row: row('yes') } }).text()).toBe('Active');
    expect(mount(BooleanColumn, { props: { column: column('value', { falseLabel: 'Inactive' }), row: row(0) } }).text()).toBe('Inactive');
    expect(mount(BooleanColumn, { props: { column: column('value'), row: row({}) } }).text()).toBe('Yes');
    expect(mount(BooleanColumn, { props: { column: column('value'), row: row(null) } }).text()).toBe('No');
  });

  it('renders boolean icons with configured and default icon values', () => {
    const icon = mount(BooleanColumn, {
      props: { column: column('value', { displayAs: 'icon', trueIcon: 'custom-check' }, 'extra-class'), row: row(true) },
      global: { stubs: { CommonIcon: { props: ['icon'], template: '<i :data-icon="icon" />' } } }
    });
    const fallback = mount(BooleanColumn, {
      props: { column: column('value', { displayAs: 'icon', falseIcon: '' }), row: row('false') },
      global: { stubs: { CommonIcon: { props: ['icon'], template: '<i :data-icon="icon" />' } } }
    });

    expect(icon.find('i').attributes('data-icon')).toBe('custom-check');
    expect(icon.classes()).toContain('bg-green-100');
    expect(fallback.find('i').attributes('data-icon')).toBe('basil:cross-solid');
    expect(fallback.classes()).toContain('bg-red-100');
  });

  it('renders date-only and date-time values', () => {
    const dateColumn = column('value', { format: 'yyyy-MM-dd', timezone: 'UTC' });
    const dateTimeColumn = column('value', { format: 'yyyy-MM-dd HH:mm', timezone: 'UTC' });

    expect(mount(DateColumn, { props: { column: dateColumn, row: row('2024-01-02T03:04:05Z') } }).text()).not.toBe('');
    expect(mount(DateTimeColumn, { props: { column: dateTimeColumn, row: row('2024-01-02T03:04:05Z') } }).text()).not.toBe('');
  });

});