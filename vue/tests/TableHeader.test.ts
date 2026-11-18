import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableHeader from '../src/components/TableHeader.vue';
import type { TableColumn, TableSorting } from '../src/types/table';

const sampleColumns: TableColumn[] = [
  {
    attribute: 'id',
    label: 'ID',
    sortable: true,
    toggleable: true,
    visible: true,
    alignment: 'left',
    meta: {},
  },
  {
    attribute: 'name',
    label: 'Name',
    sortable: true,
    toggleable: true,
    visible: true,
    alignment: 'left',
    meta: {},
  },
  {
    attribute: 'status',
    label: 'Status',
    sortable: true,
    toggleable: true,
    visible: true,
    alignment: 'left',
    meta: {},
  },
];

const sampleSorting: TableSorting = {
  column: null,
  direction: null,
};

describe('TableHeader.vue column reordering', () => {
  it('does not make headers draggable when reordering is disabled', () => {
    const wrapper = mount(TableHeader, {
      props: {
        columns: sampleColumns,
        sorting: sampleSorting,
        stickyOffsets: {},
        stickySides: {},
        isColumnSticky: () => false,
      },
    });

    const ths = wrapper.findAll('th');
    expect(ths.length).toBe(3);
    expect(ths[0].attributes('draggable')).toBeUndefined();
    expect(ths[1].attributes('draggable')).toBeUndefined();
    expect(ths[2].attributes('draggable')).toBeUndefined();
  });

  it('renders table headers with draggable attribute when reorderable is true', () => {
    const wrapper = mount(TableHeader, {
      props: {
        columns: sampleColumns,
        sorting: sampleSorting,
        stickyOffsets: {},
        stickySides: {},
        isColumnSticky: () => false,
        reorderable: true,
      },
    });

    const ths = wrapper.findAll('th');
    expect(ths.length).toBe(3);
    expect(ths[0].attributes('draggable')).toBe('true');
    expect(ths[1].attributes('draggable')).toBe('true');
    expect(ths[2].attributes('draggable')).toBe('true');
  });

  it('renders table headers with draggable when table has reorderable meta', () => {
    const wrapper = mount(TableHeader, {
      props: {
        columns: sampleColumns,
        sorting: sampleSorting,
        stickyOffsets: {},
        stickySides: {},
        isColumnSticky: () => false,
        table: {
          name: 'users',
          meta: { reorderable: true },
        },
      },
    });

    const ths = wrapper.findAll('th');
    expect(ths[0].attributes('draggable')).toBe('true');
  });

  it('reorders columns when dragging a header over another and dropping', async () => {
    const reorderMock = vi.fn();
    const wrapper = mount(TableHeader, {
      props: {
        columns: sampleColumns,
        sorting: sampleSorting,
        stickyOffsets: {},
        stickySides: {},
        isColumnSticky: () => false,
        reorderable: true,
        tableApi: {
          reorderColumns: reorderMock,
        },
        table: {
          name: 'test-table',
          meta: {},
        },
      },
    });

    const ths = wrapper.findAll('th');

    // Drag header 0 ('id')
    await ths[0].trigger('dragstart', {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    });

    // Drop onto header 2 ('status')
    await ths[2].trigger('drop');

    expect(wrapper.emitted('reorder')).toBeTruthy();
    const emittedOrder = wrapper.emitted('reorder')?.[0][0];
    expect(emittedOrder).toEqual(['name', 'status', 'id']);
    expect(reorderMock).toHaveBeenCalledWith(['name', 'status', 'id']);
  });
});
