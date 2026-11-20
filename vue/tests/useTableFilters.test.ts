import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useTableFilters } from '../src/composables/useTableFilters';
import { router } from './stubs/inertia';

describe('useTableFilters composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('reads filter definitions and active state correctly', () => {
    const table = ref({
      name: 'users',
      hasFilters: true,
      filters: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          comparators: [
            { key: 'equals', label: 'Equals', minValues: 1, maxValues: 1 },
            { key: 'contains', label: 'Contains', minValues: 1, maxValues: 1 },
          ],
        },
        {
          key: 'email',
          label: 'Email',
          type: 'text',
          comparators: [
            { key: 'equals', label: 'Equals', minValues: 1, maxValues: 1 },
          ],
        },
      ],
      state: {
        filters: [
          { key: 'name', comparator: 'contains', value: 'John' },
        ],
      },
    });

    const { filterDefinitions, activeFilters, activeCount, initDraft, draftFilters } =
      useTableFilters(table);

    expect(filterDefinitions.value).toHaveLength(2);
    expect(activeFilters.value).toHaveLength(1);
    expect(activeCount.value).toBe(1);

    initDraft();
    expect(draftFilters.value['name']).toEqual({
      comparator: 'contains',
      value: 'John',
    });
    expect(draftFilters.value['email']).toEqual({
      comparator: 'equals',
      value: '',
    });
  });

  it('calls router.visit with serialized JSON filters on apply', () => {
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          comparators: [{ key: 'contains', label: 'Contains' }],
        },
      ],
      state: { filters: [] },
      meta: { queryString: { filters: 'users[filters]' } },
    });

    const { initDraft, draftFilters, applyFilters } = useTableFilters(table);
    initDraft();

    draftFilters.value['name'] = { comparator: 'contains', value: 'Jane' };
    applyFilters();

    expect(router.visit).toHaveBeenCalledTimes(1);
    const visitedUrl = vi.mocked(router.visit).mock.calls[0][0];
    expect(visitedUrl).toContain('users%5Bfilters%5D=%5B%7B%22key%22%3A%22name%22%2C%22comparator%22%3A%22contains%22%2C%22value%22%3A%22Jane%22%7D%5D');
  });

  it('sends an explicit empty list on clearFilters', () => {
    const table = ref({
      name: 'users',
      filters: [],
      state: { filters: [] },
      meta: { queryString: { filters: 'filters' } },
    });

    const { clearFilters } = useTableFilters(table);
    clearFilters();

    expect(router.visit).toHaveBeenCalledTimes(1);
    const visitedUrl = vi.mocked(router.visit).mock.calls[0][0];
    expect(new URL(String(visitedUrl), window.location.origin).searchParams.has('filters')).toBe(false);
  });
  it.each([{ filters: [] }, { filters: [{ key: 'email', comparator: 'equals', value: 'jane@example.com' }] }])(
    'does not restore definition defaults missing from server state: %j',
    ({ filters }) => {
      const table = ref({
        filters: [{ key: 'name', label: 'Name', type: 'text',
          comparators: [{ key: 'equals', label: 'Equals' }],
          default: { comparator: 'equals', value: 'John' } }],
        state: { filters },
        meta: { queryString: { filters: 'filters' } },
      });
      const api = useTableFilters(table);
      api.initDraft();
      expect(api.draftFilters.value.name.value).toBe('');
      api.applyFilters();
      const url = new URL(String(vi.mocked(router.visit).mock.calls[0][0]), window.location.origin);
      const filtersParam = url.searchParams.get('filters');
      expect(filtersParam ? JSON.parse(filtersParam) : []).toEqual(filters);
    }
  );

  it.each(['', 'people'])('resets pagination and replaces bracket filters for namespace %s', (namespace) => {
    const key = (field: string) => namespace ? namespace + '[' + field + ']' : field;
    const url = new URL(window.location.href);
    url.searchParams.set(key('cursor'), 'old-cursor');
    url.searchParams.set(key('page'), '3');
    url.searchParams.set(key('filters') + '[0][key]', 'name');
    url.searchParams.set(key('filters') + '[0][comparator]', 'equals');
    url.searchParams.set(key('filters') + '[0][value]', 'John');
    url.searchParams.set('other[cursor]', 'keep-me');
    window.history.replaceState({}, '', url);
    const api = useTableFilters(ref({
      meta: { queryString: { filters: key('filters'), page: key('page'), cursor: key('cursor') } },
    }));
    api.draftFilters.value.name = { comparator: 'equals', value: 'Jane' };
    api.applyFilters();
    const target = new URL(String(vi.mocked(router.visit).mock.calls[0][0]), window.location.origin);
    expect(target.searchParams.has(key('cursor'))).toBe(false);
    expect(target.searchParams.has(key('page'))).toBe(false);
    expect(target.searchParams.get('other[cursor]')).toBe('keep-me');
    expect(Array.from(target.searchParams.keys()).some((param) => param.startsWith(key('filters') + '['))).toBe(false);
    expect(JSON.parse(target.searchParams.get(key('filters'))!)).toEqual([
      { key: 'name', comparator: 'equals', value: 'Jane' },
    ]);
    api.clearFilters();
    const cleared = new URL(String(vi.mocked(router.visit).mock.calls[1][0]), window.location.origin);
    expect(cleared.searchParams.has(key('filters'))).toBe(false);
    expect(cleared.searchParams.has(key('cursor'))).toBe(false);
  });

  it('preserves null and empty-string filter values through initDraft and applyFilters', () => {
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'status',
          label: 'Status',
          type: 'text',
          nullable: true,
          comparators: [{ key: 'equals', label: 'Equals' }],
        },
        {
          key: 'notes',
          label: 'Notes',
          type: 'text',
          comparators: [{ key: 'equals', label: 'Equals' }],
        },
      ],
      state: {
        filters: [
          { key: 'status', comparator: 'equals', value: null },
          { key: 'notes', comparator: 'equals', value: '' },
        ],
      },
    });

    const { activeCount, isFilterActive, initDraft, draftFilters, applyFilters } =
      useTableFilters(table);

    expect(activeCount.value).toBe(2);
    initDraft();
    expect(isFilterActive('status')).toBe(true);
    expect(isFilterActive('notes')).toBe(true);
    expect(draftFilters.value['status'].value).toBeNull();
    expect(draftFilters.value['notes'].value).toBe('');

    applyFilters();

    expect(router.visit).toHaveBeenCalledTimes(1);
    const visitedUrl = vi.mocked(router.visit).mock.calls[0][0];
    const url = new URL(String(visitedUrl), window.location.origin);
    const filtersParam = JSON.parse(url.searchParams.get('users[filters]')!);

    expect(filtersParam).toEqual([
      { key: 'status', comparator: 'equals', value: null },
      { key: 'notes', comparator: 'equals', value: '' },
    ]);
  });

  it('preserves repeated filter conditions for the same key', () => {
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          comparators: [{ key: 'contains', label: 'Contains' }],
        },
      ],
      state: {
        filters: [
          { key: 'name', comparator: 'contains', value: 'John' },
          { key: 'name', comparator: 'contains', value: 'Doe' },
        ],
      },
    });

    const { activeCount, initDraft, applyFilters } = useTableFilters(table);
    expect(activeCount.value).toBe(2);

    initDraft();
    applyFilters();

    expect(router.visit).toHaveBeenCalledTimes(1);
    const visitedUrl = vi.mocked(router.visit).mock.calls[0][0];
    const url = new URL(String(visitedUrl), window.location.origin);
    const filtersParam = JSON.parse(url.searchParams.get('users[filters]')!);

    expect(filtersParam).toEqual([
      { key: 'name', comparator: 'contains', value: 'John' },
      { key: 'name', comparator: 'contains', value: 'Doe' },
    ]);
  });

  it('respects autoVisit=false without triggering router.visit and triggers onFilterChange', () => {
    const onFilterChange = vi.fn();
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'role',
          label: 'Role',
          type: 'text',
          comparators: [{ key: 'equals', label: 'Equals' }],
        },
      ],
      state: { filters: [] },
    });

    const { initDraft, draftFilters, applyFilters } = useTableFilters(table, {
      autoVisit: false,
      onFilterChange,
    });

    initDraft();
    draftFilters.value['role'] = { comparator: 'equals', value: 'admin' };
    const applied = applyFilters();

    expect(router.visit).not.toHaveBeenCalled();
    expect(applied).toEqual([{ key: 'role', comparator: 'equals', value: 'admin' }]);
    expect(onFilterChange).toHaveBeenCalledWith([{ key: 'role', comparator: 'equals', value: 'admin' }]);
  });

  it('omits filter with explicit active: false even if value is populated and handles deleted drafts', () => {
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          comparators: [{ key: 'equals', label: 'Equals' }],
        },
      ],
      state: {
        filters: [{ key: 'name', comparator: 'equals', value: 'John' }],
      },
    });

    const { isFilterActive, initDraft, draftFilters, applyFilters } = useTableFilters(table, {
      autoVisit: false,
    });

    initDraft();
    expect(isFilterActive('name')).toBe(true);

    // 1. Explicitly mark active: false
    draftFilters.value['name'] = { comparator: 'equals', value: 'John', active: false };
    expect(isFilterActive('name')).toBe(false);
    let applied = applyFilters();
    expect(applied).toEqual([]);

    // 2. Delete key from draftFilters
    delete draftFilters.value['name'];
    expect(isFilterActive('name')).toBe(false);
    applied = applyFilters();
    expect(applied).toEqual([]);
  });

  it('correctly treats empty array values as inactive for between comparator', () => {
    const table = ref({
      name: 'users',
      filters: [
        {
          key: 'created_at',
          label: 'Created At',
          type: 'text',
          comparators: [{ key: 'between', label: 'Between', minValues: 2, maxValues: 2 }],
        },
      ],
      state: { filters: [] },
    });

    const { isFilterActive, initDraft, draftFilters, applyFilters } = useTableFilters(table, {
      autoVisit: false,
    });

    initDraft();

    // 1. Array with empty strings should be inactive
    draftFilters.value['created_at'] = { comparator: 'between', value: ['', ''] };
    expect(isFilterActive('created_at')).toBe(false);
    expect(applyFilters()).toEqual([]);

    // 2. Array with at least one non-empty value should be active
    draftFilters.value['created_at'] = { comparator: 'between', value: ['2024-01-01', ''] };
    expect(isFilterActive('created_at')).toBe(true);
    expect(applyFilters()).toEqual([]);
    expect(router.visit).not.toHaveBeenCalled();
  });
});

