import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import FilterInput from '../src/components/filters/FilterInput.vue';
import TableFilterPanel from '../src/components/TableFilterPanel.vue';
import TableFilterDrawer from '../src/components/TableFilterDrawer.vue';
import TableFilterHeader from '../src/components/TableFilterHeader.vue';
import {
  isValidFilter,
  useTableFilters,
  type FilterDefinition,
  type FilterDraftState,
} from '../src/composables/useTableFilters';
import { router } from './stubs/inertia';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllTimers();
  vi.useRealTimers();
});

const scalar = { key: 'equals', label: 'Equals', minValues: 1, maxValues: 1 };
const between = { key: 'between', label: 'Between', minValues: 2, maxValues: 2 };
const definitions: FilterDefinition[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    nullable: true,
    comparators: [scalar, { ...scalar, key: 'contains', label: 'Contains' }],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean', nullable: true, comparators: [scalar] },
  {
    key: 'joined_at',
    label: 'Joined',
    type: 'date',
    nullable: true,
    comparators: [scalar, between],
  },
  { key: 'score', label: 'Score', type: 'numeric', nullable: true, comparators: [scalar, between] },
  {
    key: 'status',
    label: 'Status',
    type: 'set',
    nullable: true,
    comparators: [scalar, { key: 'in', label: 'In', minValues: 1, maxValues: null }],
    options: [
      { value: 'active', label: 'Active' },
      { value: 'on_leave', label: 'On Leave' },
      { value: 0, label: 'Zero' },
    ],
  },
];
const editor = (
  definition: FilterDefinition,
  modelValue: FilterDraftState = { comparator: 'equals', value: '' },
) => {
  const wrapper = mount(FilterInput, {
    props: {
      definition,
      modelValue,
      'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value ?? undefined }),
    },
  });
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
});
afterEach(() => {
  vi.useRealTimers();
});

describe('metadata driven filter editor', () => {
  it.each([
    [0, 'text', 'Alice'],
    [2, 'date', '2026-09-01'],
    [3, 'number', '12.5'],
  ] as const)('edits %s with native %s controls', async (index, type, value) => {
    const wrapper = editor(definitions[index]);
    const input = wrapper.get(`input[type="${type}"]`);
    await input.setValue(value);
    expect(wrapper.props('modelValue')?.value).toBe(value);
    wrapper.unmount();
  });

  it('uses only supplied comparators and resets incompatible value shapes', async () => {
    const wrapper = editor(definitions[3], { comparator: 'equals', value: '12' });
    expect(
      wrapper
        .get('select')
        .findAll('option')
        .map((option) => option.text()),
    ).toEqual(['Equals', 'Between']);
    await wrapper.get('select').setValue('between');
    expect(wrapper.props('modelValue')).toEqual({ comparator: 'between', value: ['', ''] });
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(2);
    await wrapper.get('[aria-label="Filter value 1"]').setValue('10');
    await wrapper.get('[aria-label="Filter value 2"]').setValue('20');
    expect(wrapper.props('modelValue')?.value).toEqual(['10', '20']);
    await wrapper.get('select').setValue('equals');
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(1);
    expect(wrapper.props('modelValue')?.value).toBe('');
    wrapper.unmount();
  });

  it('renders two date controls for between', () => {
    const wrapper = editor(definitions[2], {
      comparator: 'between',
      value: ['2026-09-01', '2026-09-02'],
    });
    expect(wrapper.findAll('input[type="date"]')).toHaveLength(2);
    expect(wrapper.get('[aria-label="Filter value 2"]').element).toHaveProperty(
      'value',
      '2026-09-02',
    );
    wrapper.unmount();
  });

  it('preserves false as a boolean value', async () => {
    const wrapper = editor(definitions[1]);
    await wrapper.get('[aria-label="Filter value"]').setValue('false');
    expect(wrapper.props('modelValue')?.value).toBe(false);
    await wrapper.get('[aria-label="Filter value"]').setValue('true');
    expect(wrapper.props('modelValue')?.value).toBe(true);
    wrapper.unmount();
  });

  it('uses one boolean value select without a comparator select', async () => {
    const definition: FilterDefinition = {
      ...definitions[1],
      comparators: [
        scalar,
        { ...scalar, key: 'not_equals', label: 'Not Equals' },
      ],
    };
    const wrapper = editor(definition);

    expect(wrapper.find('[aria-label="Filter comparator"]').exists()).toBe(false);
    const select = wrapper.get('[aria-label="Filter value"]');
    expect(select.findAll('option').map((option) => option.text())).toEqual([
      'Yes',
      'No',
      'Is null',
      'Is not null',
    ]);

    await select.setValue('null');
    expect(wrapper.props('modelValue')).toEqual({
      comparator: 'equals',
      value: null,
      active: true,
    });

    await select.setValue('not_null');
    expect(wrapper.props('modelValue')).toEqual({
      comparator: 'not_equals',
      value: null,
      active: true,
    });
    wrapper.unmount();
  });

  it('selects single and multiple set options with typed keys', async () => {
    const wrapper = editor(definitions[4]);
    await wrapper.get('[aria-label="Filter value"]').setValue('2');
    expect(wrapper.props('modelValue')?.value).toBe(0);
    await wrapper.get('[aria-label="Filter comparator"]').setValue('in');
    await wrapper.get('[aria-label="Filter values"]').setValue(['0', '1']);
    expect(wrapper.props('modelValue')?.value).toEqual(['active', 'on_leave']);
    wrapper.unmount();
  });

  it.each(definitions.filter((definition) => definition.type !== 'boolean'))('supports explicit null for $type', async (definition) => {
    const wrapper = editor(definition);
    await wrapper.get('input[type="checkbox"]').setValue(true);
    expect(wrapper.props('modelValue')).toEqual({
      comparator: 'equals',
      value: null,
      active: true,
    });
    expect(wrapper.find('[aria-label="Filter value"]').exists()).toBe(false);
    await wrapper.get('input[type="checkbox"]').setValue(false);
    expect(wrapper.props('modelValue')?.value).toBe('');
    wrapper.unmount();
  });

  it.each([
    [3, 'between', ['1', '']],
    [3, 'between', ['2', '1']],
    [3, 'equals', 'NaN'],
    [3, 'equals', '0x10'],
    [2, 'equals', '2026-02-30'],
    [2, 'between', ['2026-09-01']],
    [4, 'in', []],
    [4, 'in', ['unknown']],
    [1, 'equals', 'false'],
    [0, 'unknown', 'Alice'],
    [3, 'between', [null, 2]],
  ] as const)('blocks invalid draft %j %s %j', (index, comparator, value) => {
    expect(
      isValidFilter(definitions[index], {
        comparator,
        value: Array.isArray(value) ? [...value] : value,
      } as FilterDraftState),
    ).toBe(false);
  });
});

describe('filter layouts', () => {
  it.each([TableFilterPanel, TableFilterDrawer])(
    'applies edits, removes, clears and reconciles authoritative state',
    async (component) => {
      const table = {
        name: 'people',
        filters: definitions,
        state: { filters: [{ key: 'enabled', comparator: 'equals', value: false }] },
      };
      const wrapper = mount(component, {
        attachTo: document.body,
        props: { open: true, table },
        global: { stubs: { teleport: true } },
      });
      expect(wrapper.get('[aria-label="Active filters"]').text()).toContain('Enabled Equals No');
      const score = wrapper.get('[data-filter-key="score"]');
      await score.get('[aria-label="Filter comparator"]').setValue('between');
      await score.get('[aria-label="Filter value 1"]').setValue('1');
      let apply = wrapper.findAll('button').find((button) => button.text() === 'Apply Filters')!;
      expect(apply.attributes('disabled')).toBeDefined();
      await apply.trigger('click');
      expect(router.visit).not.toHaveBeenCalled();
      await score.get('[aria-label="Filter value 2"]').setValue('20');
      apply = wrapper.findAll('button').find((button) => button.text() === 'Apply Filters')!;
      await apply.trigger('click');
      let url = new URL(String(vi.mocked(router.visit).mock.calls[0][0]), window.location.origin);
      expect(JSON.parse(url.searchParams.get('people[filters]')!)).toEqual([
        { key: 'enabled', comparator: 'equals', value: false },
        { key: 'score', comparator: 'between', value: ['1', '20'] },
      ]);
      await wrapper.setProps({ open: false });
      await wrapper.setProps({
        open: true,
        table: {
          ...table,
          state: { filters: [{ key: 'enabled', comparator: 'equals', value: true }] },
        },
      });
      expect(wrapper.get('[aria-label="Active filters"]').text()).toContain('Yes');
      await wrapper.get('button[aria-label^="Edit Enabled"]').trigger('click');
      expect(
        document.activeElement === wrapper.get('[data-filter-key="enabled"] select').element ||
        wrapper.get('[data-filter-key="enabled"]').element.contains(document.activeElement)
      ).toBe(true);
      await wrapper.get('button[aria-label^="Remove Enabled"]').trigger('click');
      url = new URL(String(vi.mocked(router.visit).mock.calls.at(-1)![0]), window.location.origin);
      expect(url.searchParams.has('people[filters]')).toBe(false);
      await wrapper
        .findAll('button')
        .find((button) => button.text() === 'Reset All')!
        .trigger('click');
      expect(wrapper.emitted('clear')).toBeTruthy();
      wrapper.unmount();
    },
  );

  it('opens dropdowns, displays set labels, applies, edits and clears', async () => {
    vi.useFakeTimers();
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: {
        open: true,
        table: {
          name: 'people',
          filters: definitions,
          state: { filters: [{ key: 'status', comparator: 'in', value: ['active', 'on_leave'] }] },
        },
      },
    });
    const trigger = wrapper.get('[aria-label="Filter by Status"]');
    expect(trigger.text()).toContain('Active, On Leave');
    await trigger.trigger('click');
    await nextTick();
    const select = document.body.querySelector<HTMLSelectElement>(
      'select[aria-label="Filter values"]',
    )!;
    expect(select.multiple).toBe(true);
    for (const option of select.options) option.selected = option.value === '2';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await nextTick();
    vi.advanceTimersByTime(450);
    await nextTick();
    expect(router.visit).toHaveBeenCalledTimes(1);
    expect(vi.mocked(router.visit).mock.calls[0][1]).toMatchObject({
      replace: false,
      preserveState: true,
    });
    const url = new URL(String(vi.mocked(router.visit).mock.calls[0][0]), window.location.origin);
    expect(JSON.parse(url.searchParams.get('people[filters]')!)).toEqual([
      { key: 'status', comparator: 'in', value: [0] },
    ]);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear all filters')!
      .trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
    wrapper.unmount();
  });

  it('does not auto-submit an incomplete range from a dropdown', async () => {
    vi.useFakeTimers();
    const wrapper = mount(TableFilterHeader, {
      attachTo: document.body,
      props: { open: true, table: { filters: definitions, state: { filters: [] } } },
    });
    await wrapper.get('[aria-label="Filter by Score"]').trigger('click');
    const comparator = document.body.querySelector<HTMLSelectElement>(
      '[aria-label="Filter comparator"]',
    )!;
    comparator.value = 'between';
    comparator.dispatchEvent(new Event('change'));
    await nextTick();
    const input = document.body.querySelector<HTMLInputElement>('[aria-label="Filter value 1"]')!;
    input.value = '10';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    vi.advanceTimersByTime(450);
    expect(router.visit).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});

it('preserves sorting search and other tables, resets pagination, and restores server state after navigation', () => {
  window.history.replaceState(
    {},
    '',
    '/?people[page]=4&people[cursor]=old&people[sort]=name&people[search]=Alice&other[page]=7&other[filters]=%5B%5D',
  );
  const table = ref({
    name: 'people',
    filters: definitions,
    state: { filters: [{ key: 'enabled', comparator: 'equals', value: false }] },
  });
  const api = useTableFilters(table);
  api.initDraft();
  api.applyFilters();
  const url = new URL(String(vi.mocked(router.visit).mock.calls[0][0]), window.location.origin);
  expect(url.searchParams.has('people[page]')).toBe(false);
  expect(url.searchParams.has('people[cursor]')).toBe(false);
  expect(url.searchParams.get('people[sort]')).toBe('name');
  expect(url.searchParams.get('people[search]')).toBe('Alice');
  expect(url.searchParams.get('other[page]')).toBe('7');
  expect(url.searchParams.get('other[filters]')).toBe('[]');
  table.value.state.filters = [{ key: 'enabled', comparator: 'equals', value: true }];
  api.initDraft();
  expect(api.draftFilters.value.enabled.value).toBe(true);
});

it('does not resurrect repeated conditions when their filter is removed', () => {
  const api = useTableFilters(
    ref({
      filters: definitions,
      state: {
        filters: [
          { key: 'score', comparator: 'equals', value: 10 },
          { key: 'score', comparator: 'equals', value: 20 },
        ],
      },
    }),
    { autoVisit: false },
  );
  api.initDraft();
  api.editFilter(1);
  expect(api.draftFilters.value.score.value).toBe(20);
  expect(api.extraConditions.value[0].value).toBe(10);
  api.editFilter(0);
  expect(api.draftFilters.value.score.value).toBe(10);
  expect(api.extraConditions.value[0].value).toBe(20);
  expect(api.applyFilters({})).toEqual([]);
});

it('reconciles open editors with server state after browser navigation even with unsaved changes', async () => {
  const table = {
    filters: definitions,
    state: { filters: [{ key: 'score', comparator: 'equals', value: 10 }] },
  };
  const wrapper = mount(TableFilterPanel, { props: { open: true, table } });
  await wrapper.get('input[type="number"]').setValue('15');
  await wrapper.setProps({
    table: { ...table, state: { filters: [{ key: 'score', comparator: 'equals', value: 20 }] } },
  });
  expect(wrapper.get('input[type="number"]').element).toHaveProperty('value', '20');
  wrapper.unmount();
});

it('keeps keyboard focus in the drawer and restores it on close', async () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const wrapper = mount(TableFilterDrawer, {
    attachTo: document.body,
    props: { open: true, filters: definitions },
    global: { stubs: { teleport: true } },
  });
  await nextTick();
  const dialog = wrapper.get('[role="dialog"]');
  expect(document.activeElement).toBe(dialog.element);
  await dialog.trigger('keydown', { key: 'Tab', shiftKey: true });
  expect(document.activeElement?.textContent?.trim()).toBe('Apply Filters');
  await dialog.trigger('keydown', { key: 'Tab' });
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Close filters drawer');
  await dialog.trigger('keydown', { key: 'Escape' });
  expect(wrapper.emitted('update:open')).toEqual([[false]]);
  await wrapper.setProps({ open: false });
  expect(document.activeElement).toBe(trigger);
  wrapper.unmount();
  trigger.remove();
});
