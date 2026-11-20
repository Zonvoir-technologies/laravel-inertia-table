import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import TableFilterHeader from '../src/components/TableFilterHeader.vue';
import SetFilter from '../src/components/filters/SetFilter.vue';
import FilterEditor from '../src/components/filters/FilterEditor.vue';
import {
  setClauseSymbols,
  resetClauseSymbols,
  getClauseSymbol,
  useTableFilters,
} from '../src/composables/useTableFilters';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Inertia UI compatibility features', () => {
  beforeEach(() => {
    resetClauseSymbols();
  });

  it('allows customizing clause symbols via setClauseSymbols', () => {
    setClauseSymbols({
      contains: '~',
      equals: '=',
      not_equals: '!=',
      starts_with: '^',
    });

    expect(getClauseSymbol('contains')).toBe('~');
    expect(getClauseSymbol('equals')).toBe('=');
    expect(getClauseSymbol('not_equals')).toBe('!=');
    expect(getClauseSymbol('starts_with')).toBe('^');
    expect(getClauseSymbol('ends_with')).toBeUndefined();
  });

  it('displays custom clause symbols in TableFilterHeader pills', () => {
    setClauseSymbols({
      contains: '~',
      equals: '=',
    });

    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            comparators: [
              { key: 'equals', label: 'Equals' },
              { key: 'contains', label: 'Contains' },
            ],
          },
        ],
        modelValue: {},
      },
    });

    const pill = wrapper.find('button[aria-label="Filter by Name"]');
    expect(pill.text()).toContain('=');
  });

  it('hides comparator label on pill when withoutClause is true', () => {
    const wrapper = mount(TableFilterHeader, {
      props: {
        open: true,
        filters: [
          {
            key: 'role',
            label: 'Role',
            type: 'set',
            withoutClause: true,
            comparators: [{ key: 'equals', label: 'Equals' }],
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
            ],
          },
        ],
        modelValue: { role: { comparator: 'equals', value: 'admin' } },
        activeCount: 1,
      },
    });

    const pill = wrapper.find('button[aria-label="Filter by Role"]');
    expect(pill.text()).toContain('Role');
    expect(pill.text()).toContain('Admin');
    expect(pill.text()).not.toContain('Equals');
  });

  it('hides comparator select in SetFilter when withoutClause is true', () => {
    const wrapper = mount(SetFilter, {
      props: {
        definition: {
          key: 'role',
          label: 'Role',
          type: 'set',
          withoutClause: true,
          comparators: [{ key: 'equals', label: 'Equals' }],
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
          ],
        },
        modelValue: { comparator: 'equals', value: 'admin' },
      },
    });

    const select = wrapper.find('select[aria-label="Filter comparator"]');
    expect(select.exists()).toBe(false);

    const valueSelect = wrapper.find('select[aria-label="Filter value"]');
    expect(valueSelect.exists()).toBe(true);
  });

  it('supports multiple mode on SetFilter when multiple is true', () => {
    const wrapper = mount(SetFilter, {
      props: {
        definition: {
          key: 'role',
          label: 'Role',
          type: 'set',
          multiple: true,
          comparators: [{ key: 'equals', label: 'Equals' }],
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
          ],
        },
        modelValue: { comparator: 'equals', value: ['admin'] },
      },
    });

    const valueSelect = wrapper.find('select[aria-label="Filter values"]');
    expect(valueSelect.exists()).toBe(true);
    expect(valueSelect.attributes('multiple')).toBeDefined();
  });

  it('enables value search when SetFilter is searchable', async () => {
    const wrapper = mount(SetFilter, {
      props: {
        definition: {
          key: 'role',
          label: 'Role',
          type: 'set',
          searchable: true,
          comparators: [{ key: 'equals', label: 'Equals' }],
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
          ],
        },
        modelValue: { comparator: 'equals', value: '' },
      },
    });

    const valueSelect = wrapper.find('select[aria-label="Filter value"]');
    const commonSelect = valueSelect.element.parentElement;
    const trigger = commonSelect?.querySelector<HTMLElement>('[role="combobox"]');
    trigger?.click();
    await wrapper.vm.$nextTick();

    expect(commonSelect?.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('supports custom filter slot with update, setDisplayValue, and table.resetAllFilters', async () => {
    let capturedSlotProps: { value?: unknown; update: (val: unknown) => void; setDisplayValue: (val: string) => void; table: { resetAllFilters: () => void } } | null = null;

    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: {
        open: true,
        filters: [
          {
            key: 'status',
            label: 'Status',
            type: 'custom',
            comparators: [{ key: 'equals', label: 'Equals' }],
          },
        ],
        modelValue: { status: { comparator: 'equals', value: 'custom_val' } },
        activeCount: 1,
      },
      slots: {
        'filter(status)': (slotProps) => {
          capturedSlotProps = slotProps as typeof capturedSlotProps;
          return h('div', { class: 'custom-slot-content' }, [
            h('input', {
              class: 'custom-input',
              value: slotProps.value,
              onInput: (e: Event) => slotProps.update((e.target as HTMLInputElement).value),
            }),
            h('button', {
              class: 'custom-set-display',
              onClick: () => slotProps.setDisplayValue('Custom Pill Text'),
            }, 'Set Display'),
            h('button', {
              class: 'custom-reset-btn',
              onClick: () => slotProps.table.resetAllFilters(),
            }, 'Reset All'),
          ]);
        },
      },
    });

    const trigger = wrapper.find('button[aria-label="Filter by Status"]');
    await trigger.trigger('click');

    const slotEl = document.body.querySelector('.custom-slot-content');
    expect(slotEl).not.toBeNull();
    expect(capturedSlotProps).not.toBeNull();
    expect(capturedSlotProps!.value).toBe('custom_val');
    expect(typeof capturedSlotProps!.update).toBe('function');
    expect(typeof capturedSlotProps!.setDisplayValue).toBe('function');
    expect(typeof capturedSlotProps!.table.resetAllFilters).toBe('function');

    // Trigger update
    capturedSlotProps!.update('new_value');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();

    // Trigger setDisplayValue
    const setDisplayBtn = document.body.querySelector('.custom-set-display') as HTMLButtonElement;
    setDisplayBtn.click();
    await wrapper.vm.$nextTick();
    const pill = wrapper.find('button[aria-label="Filter by Status"]');
    expect(pill.text()).toContain('Custom Pill Text');

    // Trigger table.resetAllFilters()
    const resetBtn = document.body.querySelector('.custom-reset-btn') as HTMLButtonElement;
    resetBtn.click();
    expect(wrapper.emitted('clear')).toBeTruthy();

    wrapper.unmount();
  });

  it('exposes resetAllFilters on TableFilterHeader component instance', () => {
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
        modelValue: { name: { comparator: 'equals', value: 'John' } },
        activeCount: 1,
      },
    });

    expect(typeof wrapper.vm.resetAllFilters).toBe('function');
    wrapper.vm.resetAllFilters();
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('exposes resetAllFilters on useTableFilters composable', () => {
    const { resetAllFilters, clearFilters } = useTableFilters(null);
    expect(typeof resetAllFilters).toBe('function');
    expect(resetAllFilters).toBe(clearFilters);
  });

  it('renders custom component in FilterEditor when definition.component is provided', () => {
    const CustomFilterComponent = defineComponent({
      name: 'CustomSpecialFilter',
      props: ['definition', 'modelValue'],
      setup(props) {
        return () => h('div', { class: 'my-custom-filter' }, props.definition.label);
      },
    });

    const wrapper = mount(FilterEditor, {
      global: {
        components: {
          CustomSpecialFilter: CustomFilterComponent,
        },
      },
      props: {
        definition: {
          key: 'special',
          label: 'Special Field',
          type: 'text',
          component: 'CustomSpecialFilter',
          comparators: [{ key: 'equals', label: 'Equals' }],
        },
        modelValue: { comparator: 'equals', value: 'foo' },
      },
    });

    expect(wrapper.find('.my-custom-filter').exists()).toBe(true);
    expect(wrapper.text()).toContain('Special Field');
  });
});
