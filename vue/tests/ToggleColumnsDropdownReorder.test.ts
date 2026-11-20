import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ToggleColumnsDropdown from '../src/components/ToggleColumnsDropdown.vue';
import type { TableColumn } from '../src/types/table';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

describe('ToggleColumnsDropdown column reordering', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without drag handles or draggable attributes when reorderable is false', async () => {
    const wrapper = mount(ToggleColumnsDropdown, {
      attachTo: document.body,
      props: {
        columns: sampleColumns,
        isColumnVisible: (attr: string) => attr !== 'status',
        reorderable: false,
      },
    });

    await wrapper.find('button').trigger('click');
    await nextTick();

    const items = document.body.querySelectorAll('[role="menuitemcheckbox"]');
    expect(items.length).toBe(3);
    expect(items[0].getAttribute('draggable')).toBeNull();
    expect(document.body.querySelector('button.w-full')).toBeNull();
  });

  it('renders all columns with drag items when reorderable is true', async () => {
    const wrapper = mount(ToggleColumnsDropdown, {
      attachTo: document.body,
      props: {
        columns: sampleColumns,
        isColumnVisible: (attr: string) => attr !== 'status',
        reorderable: true,
      },
    });

    await wrapper.find('button').trigger('click');
    await nextTick();

    const items = document.body.querySelectorAll('[role="menuitemcheckbox"]');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('ID');
    expect(items[1].textContent).toContain('Name');
    expect(items[2].textContent).toContain('Status');
    expect(items[0].getAttribute('draggable')).toBe('true');
  });

  it('reorders columns on drag and drop', async () => {
    const reorderMock = vi.fn();
    const wrapper = mount(ToggleColumnsDropdown, {
      attachTo: document.body,
      props: {
        columns: sampleColumns,
        isColumnVisible: () => true,
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

    await wrapper.find('button').trigger('click');
    await nextTick();

    const items = document.body.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');

    // Drag item 0 ('id')
    const dragStartEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: { effectAllowed: '', setData: vi.fn() },
    });
    items[0].dispatchEvent(dragStartEvent);

    // Drop onto item 2 ('status')
    const dropEvent = new Event('drop', { bubbles: true });
    items[2].dispatchEvent(dropEvent);
    await nextTick();

    expect(wrapper.emitted('reorder')).toBeTruthy();
    const emittedOrder = wrapper.emitted('reorder')?.[0][0];
    expect(emittedOrder).toEqual(['name', 'status', 'id']);
    expect(reorderMock).toHaveBeenCalledWith(['name', 'status', 'id']);
  });
});
