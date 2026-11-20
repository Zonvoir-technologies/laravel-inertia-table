import { ref, computed, unref, type MaybeRef } from 'vue';
import { router } from '@inertiajs/vue3';
import type { TableResource, TableDefinition, TableRow, TableFilter, TableState, TableFilterLayout, TableMeta } from '../types/table';

export type FilterScalarValue = string | number | boolean | null;
export type FilterValue = FilterScalarValue | FilterScalarValue[];

export interface FilterComparator {
  key: string;
  label: string;
  minValues?: number;
  maxValues?: number | null;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: string;
  nullable?: boolean;
  options?: { value: string | number; label: string }[];
  comparators: FilterComparator[];
  default?: { comparator: string; value?: FilterValue } | null;
  enableTime?: boolean;
  time24h?: boolean;
  presets?: { label: string; value: string | [string, string] }[];
  timezone?: string;
  browserTimezone?: boolean;
  minDate?: string;
  maxDate?: string;
  numberOfMonths?: number;
  showWeekNumbers?: boolean;
  weekStartsOn?: number;
  clearable?: boolean;
  withoutClause?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  lazy?: boolean;
  optionsLoaded?: boolean;
  component?: string;
  meta?: TableMeta;
}

const customClauseSymbols = ref<Record<string, string>>({});

export function setClauseSymbols(symbols: Record<string, string>): void {
  customClauseSymbols.value = { ...customClauseSymbols.value, ...symbols };
}

export function getClauseSymbol(key: string): string | undefined {
  return customClauseSymbols.value[key];
}

export function resetClauseSymbols(): void {
  customClauseSymbols.value = {};
}

export interface ActiveFilterState {
  key: string;
  comparator: string;
  value: FilterValue;
}

export interface FilterDraftState {
  comparator: string;
  value: FilterValue;
  active?: boolean;
}

export interface TableMetaQueryString {
  filters?: string;
  page?: string;
  cursor?: string;
  search?: string;
  sort?: string;
  [key: string]: string | undefined;
}

export interface TableFilterMeta {
  queryString?: TableMetaQueryString;
}

export interface TableFilterState {
  page?: number;
  perPage?: number;
  cursor?: string | null;
  search?: string | null;
  sort?: string | null;
  direction?: 'asc' | 'desc' | string | null;
  columns?: Record<string, boolean> | string[];
  sticky?: string[];
  filters?: ActiveFilterState[];
}

export type TableFilterSource<T extends TableRow = TableRow> =
  | TableResource<T>
  | TableDefinition<T>
  | (Omit<TableResource<T>, 'state' | 'filters'> & {
      filters?: FilterDefinition[] | TableFilter[];
      state?: TableFilterState | TableState;
      filterLayout?: TableFilterLayout;
      hasFilters?: boolean;
    });

export type ExtensibleTable<T extends TableRow = TableRow> = TableFilterSource<T> & {
  resetAllFilters?: () => ActiveFilterState[];
};

export interface UseTableFiltersOptions {
  autoVisit?: MaybeRef<boolean>;
  onFilterChange?: (filters: ActiveFilterState[]) => void;
}

export function hasFilterContent(val: FilterValue | undefined): boolean {
  if (val === '' || val === null || val === undefined) {
    return false;
  }
  if (Array.isArray(val)) {
    return val.length > 0 && val.some((item) => item !== '' && item !== null && item !== undefined);
  }
  return true;
}

export function useTableFilters(
  tableProp: MaybeRef<TableFilterSource | null | undefined>,
  options?: UseTableFiltersOptions
) {
  const filterDefinitions = computed<FilterDefinition[]>(() => {
    const table = unref(tableProp);
    if (!table || !Array.isArray(table.filters)) {
      return [];
    }
    return table.filters as FilterDefinition[];
  });

  const activeFilters = computed<ActiveFilterState[]>(() => {
    const table = unref(tableProp);
    const filters = table?.state?.filters;
    if (!filters || !Array.isArray(filters)) {
      return [];
    }
    return filters as ActiveFilterState[];
  });

  const draftFilters = ref<Record<string, FilterDraftState>>({});
  const activeKeys = ref<Set<string>>(new Set());
  const extraConditions = ref<ActiveFilterState[]>([]);

  const initDraft = () => {
    const draft: Record<string, FilterDraftState> = {};
    const seenKeys = new Set<string>();
    const extras: ActiveFilterState[] = [];
    const nextActiveKeys = new Set<string>();

    for (const def of filterDefinitions.value) {
      const defaultComp = def.default?.comparator || def.comparators?.[0]?.key || 'equals';
      draft[def.key] = {
        comparator: defaultComp,
        value: '',
      };
    }

    for (const active of activeFilters.value) {
      if (active && active.key) {
        if (!seenKeys.has(active.key)) {
          seenKeys.add(active.key);
          nextActiveKeys.add(active.key);
          draft[active.key] = {
            comparator: active.comparator,
            value: Array.isArray(active.value) ? [...active.value] : active.value,
          };
        } else {
          extras.push({
            key: active.key,
            comparator: active.comparator,
            value: Array.isArray(active.value) ? [...active.value] : active.value,
          });
        }
      }
    }

    draftFilters.value = draft;
    activeKeys.value = nextActiveKeys;
    extraConditions.value = extras;
  };

  // Reuse the primary editor when reopening a repeated server condition.
  const editFilter = (index: number): ActiveFilterState | undefined => {
    const selected = activeFilters.value[index];
    if (!selected) return;
    const sameCondition = (filter: FilterDraftState | undefined) => filter?.comparator === selected.comparator && JSON.stringify(filter.value) === JSON.stringify(selected.value);
    const primary = draftFilters.value[selected.key];
    if (!sameCondition(primary)) {
      const extraIndex = extraConditions.value.findIndex(filter => filter.key === selected.key && sameCondition(filter));
      if (extraIndex >= 0 && primary) extraConditions.value[extraIndex] = { key: selected.key, comparator: primary.comparator, value: primary.value };
      draftFilters.value[selected.key] = { comparator: selected.comparator, value: Array.isArray(selected.value) ? [...selected.value] : selected.value };
    }
    return selected;
  };

  const activeCount = computed(() => {
    return activeFilters.value.length;
  });

  const isFilterActive = (key: string): boolean => {
    const filter = draftFilters.value[key];
    if (filter) {
      if (filter.active !== undefined) {
        return Boolean(filter.active);
      }
      if (activeKeys.value.has(key)) {
        return true;
      }
      return hasFilterContent(filter.value);
    }
    return false;
  };

  const applyFilters = (
    overrideDraft?: Record<string, FilterDraftState> | ActiveFilterState[]
  ): ActiveFilterState[] => {
    const activeList: ActiveFilterState[] = [];
    const sourceDraft = (overrideDraft && !Array.isArray(overrideDraft)) ? overrideDraft : draftFilters.value;

    if (Array.isArray(overrideDraft)) {
      activeList.push(...overrideDraft);
    } else {
      for (const [key, filter] of Object.entries(sourceDraft)) {
        if (!filter) {
          continue;
        }

        let shouldInclude = false;
        if (filter.active !== undefined) {
          shouldInclude = Boolean(filter.active);
        } else {
          shouldInclude = hasFilterContent(filter.value) || activeKeys.value.has(key);
        }

        if (shouldInclude) {
          activeList.push({
            key,
            comparator: filter.comparator,
            value: filter.value,
          });
        }
      }

      // Preserve untouched repeated conditions for keys that are active
      for (const extra of extraConditions.value) {
        const primary = sourceDraft[extra.key];
        let isPrimaryActive = false;
        if (primary) {
          if (primary.active !== undefined) {
            isPrimaryActive = Boolean(primary.active);
          } else {
            isPrimaryActive = hasFilterContent(primary.value) || activeKeys.value.has(extra.key);
          }
        }

        if (isPrimaryActive) {
          activeList.push(extra);
        }
      }
    }

    const table = unref(tableProp);
    if (activeList.some(filter => {
      const definition = filterDefinitions.value.find(item => item.key === filter.key);
      return definition && !isValidFilter(definition, filter);
    })) return activeFilters.value;

    const metaQuery = (table?.meta as TableFilterMeta | undefined)?.queryString;
    const queryKey = (typeof metaQuery === 'object' && metaQuery?.filters)
      ? metaQuery.filters
      : (table?.name ? `${table.name}[filters]` : 'filters');

    const currentUrl = new URL(
      typeof window !== 'undefined' ? window.location.href : 'http://localhost'
    );

    // Replace bracket forms
    Array.from(currentUrl.searchParams.keys())
      .filter((k) => k.startsWith(`${queryKey}[`))
      .forEach((k) => currentUrl.searchParams.delete(k));

    /**
     * IMPORTANT:
     *
     * If filters exist:
     *   ?filters=[{...}]
     *
     * If no filters exist:
     *   remove "filters" completely
     *
     * Do NOT leave:
     *   ?filters=[]
     */
    if (activeList.length > 0) {
      currentUrl.searchParams.set(
        queryKey,
        JSON.stringify(activeList)
      );
    } else {
      currentUrl.searchParams.delete(queryKey);
    }

    // Reset pagination page when filters change
    const pageKey = (typeof metaQuery === 'object' && metaQuery?.page)
      ? metaQuery.page
      : (table?.name ? `${table.name}[page]` : 'page');
    currentUrl.searchParams.delete(pageKey);
    const cursorKey = (typeof metaQuery === 'object' && metaQuery?.cursor)
      ? metaQuery.cursor
      : (table?.name ? `${table.name}[cursor]` : 'cursor');
    currentUrl.searchParams.delete(cursorKey);

    const shouldAutoVisit = options?.autoVisit !== undefined ? unref(options.autoVisit) : true;

    if (shouldAutoVisit) {
      const target = `${currentUrl.pathname}${currentUrl.search}`;
      if (typeof router !== 'undefined' && typeof router.visit === 'function') {
        router.visit(target, {
          preserveState: true,
          preserveScroll: true,
          replace: false,
        });
      }
    }

    options?.onFilterChange?.(activeList);
    if (table && typeof table === 'object') {
      try {
        (table as ExtensibleTable).resetAllFilters = clearFilters;
      } catch {
        // Table might be non-extensible
      }
    }

    return activeList;
  };

  const clearFilters = () => {
    draftFilters.value = {};
    extraConditions.value = [];
    activeKeys.value.clear();
    return applyFilters({});
  };

  const table = unref(tableProp);
  if (table && typeof table === 'object') {
    try {
      (table as ExtensibleTable).resetAllFilters = clearFilters;
    } catch {
      // Table might be non-extensible
    }
  }

  return {
    filterDefinitions,
    activeFilters,
    draftFilters,
    extraConditions,
    activeCount,
    isFilterActive,
    initDraft,
    editFilter,
    applyFilters,
    clearFilters,
    resetAllFilters: clearFilters,
  };
}

/** Check draft completeness; the server remains authoritative. */
export function isValidFilter(definition: FilterDefinition, filter: FilterDraftState): boolean {
  const comparator = definition.comparators.find(c => c.key === filter.comparator);
  if (!comparator) return false;
  if (comparator.key === 'is_set' || comparator.key === 'is_not_set' || comparator.maxValues === 0) {
    return true;
  }
  const max = comparator.maxValues === undefined ? 1 : comparator.maxValues;
  const min = comparator.minValues ?? 1;
  const value = filter.value;
  if (value === null) return !!definition.nullable && ['equals', 'not_equals'].includes(comparator.key);
  const values = max === 1 ? [value] : value;
  if (!Array.isArray(values) || values.length < min || (max !== null && values.length > max)) return false;
  if (!values.every(item => {
    if (Array.isArray(item) || item === null || item === undefined) return false;
    if (definition.type === 'numeric') return typeof item !== 'boolean' && /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(String(item).trim()) && Number.isFinite(Number(item));
    if (definition.type === 'date') {
      if (typeof item !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item) || item.startsWith('0000')) return false;
      const date = new Date(`${item}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === item;
    }
    if (definition.type === 'boolean') return typeof item === 'boolean';
    if (definition.type === 'set') return (typeof item === 'string' || typeof item === 'number') && !!definition.options?.some(option => String(option.value) === String(item));
    return max === 1 || item !== '';
  })) return false;
  if (max === 2 && values.length === 2) {
    return definition.type === 'numeric' ? Number(values[0]) <= Number(values[1]) : String(values[0]) <= String(values[1]);
  }
  return true;
}

export function hasInvalidDraft(definitions: FilterDefinition[], draft: Record<string, FilterDraftState>, active: ActiveFilterState[] = []): boolean {
  return definitions.some(definition => {
    const filter = draft[definition.key];
    return filter && filter.active !== false && (filter.active || filter.value === null || Array.isArray(filter.value) || hasFilterContent(filter.value) || active.some(item => item.key === definition.key)) && !isValidFilter(definition, filter);
  });
}

export function formatFilterValue(definition: FilterDefinition, value: FilterValue): string {
  const display = (item: FilterScalarValue): string => {
    if (item === null) return 'Null';
    if (definition.type === 'boolean') return item === true ? 'Yes' : 'No';
    if (definition.type === 'set') return definition.options?.find(option => String(option.value) === String(item))?.label ?? String(item);
    return String(item);
  };
  return Array.isArray(value) ? value.map(display).join(definition.type === 'set' ? ', ' : ' \u2013 ') : display(value);
}
