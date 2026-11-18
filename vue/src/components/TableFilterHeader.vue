<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, getCurrentInstance, type ComponentInternalInstance, type ComponentPublicInstance } from 'vue';
import CommonButton from './Common/CommonButton.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import CommonIcon from './Common/CommonIcon.vue';
import { twMerge } from 'tailwind-merge';
import { useTableConfiguration, useTableDarkMode } from '../config/tableConfig';
import FilterEditor from './filters/FilterEditor.vue';
import {
  useTableFilters,
  hasFilterContent,
  hasInvalidDraft,
  formatFilterValue,
  getClauseSymbol,
  type FilterDefinition,
  type ActiveFilterState,
  type TableFilterSource,
  type FilterDraftState,
  type FilterValue,
} from '../composables/useTableFilters';

export type TableFilterHeaderProps = {
  open?: boolean;
  table?: TableFilterSource | null;
  filters?: FilterDefinition[];
  modelValue?: Record<string, FilterDraftState>;
  activeCount?: number;
  autoVisit?: boolean;
};

const props = withDefaults(
  defineProps<TableFilterHeaderProps>(),
  {
    open: false,
    table: null,
    filters: (): FilterDefinition[] => [],
    modelValue: undefined,
    activeCount: undefined,
    autoVisit: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, FilterDraftState>): void;
  (e: 'apply'): void;
  (e: 'clear'): void;
  (e: 'close'): void;
  (e: 'filter-change', filters: ActiveFilterState[]): void;
}>();

const {
  filterDefinitions,
  activeFilters,
  draftFilters,
  activeCount: computedActiveCount,
  initDraft,
  applyFilters: runApplyFilters,
  clearFilters: runClearFilters,
} = useTableFilters(computed(() => props.table), {
  autoVisit: computed(() => props.autoVisit),
  onFilterChange: (filters) => emit('filter-change', filters),
});

const tableConfig = useTableConfiguration();
const { isDark, darkClass } = useTableDarkMode(tableConfig);

const headerClasses = computed(() => {
  const customFilter = tableConfig.value?.classes?.filter;
  const customHeader = tableConfig.value?.classes?.filterHeader;
  const baseClasses = 'zonvoir-table-filter-header border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900';
  const darkClasses = isDark.value ? 'bg-slate-900 border-slate-800 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, customFilter, customHeader);
});

const filterChevronIcon = computed(() => tableConfig.value?.icons?.filterChevron ?? 'heroicons:chevron-down');
const filterCloseIcon = computed(() => tableConfig.value?.icons?.filterClose ?? 'heroicons:x-mark');
const clearFilterLabel = computed(() => tableConfig.value?.labels?.clearFilter ?? 'Clear filter');
const clearAllFiltersLabel = computed(() => tableConfig.value?.labels?.clearAllFilters ?? 'Clear all filters');
const noFiltersLabel = computed(() => tableConfig.value?.labels?.noFiltersAvailable ?? 'No filters available');
const getFilterByLabel = (label: string) => {
  const fn = tableConfig.value?.labels?.filterBy;
  if (typeof fn === 'function') {
    return fn(label);
  }
  return `Filter by ${label}`;
};

const isDirty = ref(false);
const customDisplayValues = ref<Record<string, string>>({});
const instance = getCurrentInstance();

const getFilterSlot = (key: string) => {
  let curr: ComponentInternalInstance | null = instance;
  while (curr) {
    const slot = curr.slots?.[`filter(${key})`] ?? curr.slots?.[`filter-${key}`];
    if (slot) return slot;
    curr = curr.parent;
  }
  return null;
};

const setCustomDisplayValue = (key: string, val: string) => {
  customDisplayValues.value[key] = val;
};
let wasOpen = false;

// Reconcile draft when header opens OR when authoritative server filter state updates while open without unsaved edits
watch(
  () => [props.open, activeFilters.value],
  ([isOpen]) => {
    if (!isOpen) {
      wasOpen = false;
      isDirty.value = false;
      return;
    }
    if (!wasOpen) {
      wasOpen = true;
      isDirty.value = false;
      if (props.table) {
        initDraft();
      }
      return;
    }
    if (props.table && !isDirty.value) {
      initDraft();
    }
  },
  { immediate: true, deep: true },
);

const resolvedFilters = computed<FilterDefinition[]>(() => {
  if (props.filters && props.filters.length > 0) {
    return props.filters;
  }
  return filterDefinitions.value;
});

const resolvedModelValue = computed({
  get: () => {
    if (props.modelValue !== undefined) {
      return props.modelValue;
    }
    return draftFilters.value;
  },
  set: (val) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      draftFilters.value = val;
    }
  },
});

const currentActiveCount = computed<number>(() => {
  if (typeof props.activeCount === 'number') {
    return props.activeCount;
  }
  return computedActiveCount.value;
});

const isFilterActive = (key: string): boolean => {
  const current = resolvedModelValue.value[key] as FilterDraftState | undefined;
  if (current) {
    if (current.active !== undefined) {
      return Boolean(current.active);
    }
    if (current.comparator === 'is_set' || current.comparator === 'is_not_set') {
      return true;
    }
    return hasFilterContent(current.value);
  }
  return false;
};

/** Comparator label is shown on the pill, active or not (e.g. "Name  Contains"). Hidden if withoutClause is true. */
const getComparatorLabel = (filter: FilterDefinition): string => {
  if (filter.withoutClause) {
    return '';
  }
  const current = resolvedModelValue.value[filter.key];
  const key = current?.comparator || filter.default?.comparator || filter.comparators[0]?.key || 'equals';
  const customSymbol = getClauseSymbol(key);
  if (customSymbol !== undefined) {
    return customSymbol;
  }
  const comp = filter.comparators.find((c) => c.key === key);
  return comp ? comp.label : key;
};

const getFilterDisplayValue = (key: string): string => {
  if (customDisplayValues.value[key] !== undefined) {
    return customDisplayValues.value[key];
  }
  const current = resolvedModelValue.value[key];
  if (!current) return '';
  if (current.comparator === 'is_set' || current.comparator === 'is_not_set') {
    return '';
  }
  if (current.value === null && current.active) {
    return 'Null';
  }
  if (current.value == null || current.value === '') {
    return '';
  }
  const definition = resolvedFilters.value.find((f) => f.key === key);
  if (definition) {
    return formatFilterValue(definition, current.value);
  }
  if (Array.isArray(current.value)) {
    const from = current.value[0] != null ? String(current.value[0]) : '';
    const to = current.value[1] != null ? String(current.value[1]) : '';
    if (from && to) return `${from} – ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return '';
  }
  return String(current.value);
};

const updateFilterValue = (
  key: string,
  val: FilterDraftState | null,
): Record<string, FilterDraftState> => {
  isDirty.value = true;
  const updated = { ...resolvedModelValue.value };
  if (!val) {
    delete updated[key];
  } else {
    updated[key] = val;
  }
  resolvedModelValue.value = updated;
  return updated;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const applyDebounced = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    if (hasInvalidDraft(resolvedFilters.value, resolvedModelValue.value, activeFilters.value)) {
      return;
    }
    if (props.table) {
      runApplyFilters(resolvedModelValue.value);
    }
    isDirty.value = false;
    emit('apply');
  }, 400);
};

const onFilterUpdate = (
  key: string,
  val: FilterDraftState | null,
) => {
  if (!val) {
    updateFilterValue(key, null);
    applyDebounced();
    return;
  }

  const hasContent = hasFilterContent(val.value) || val.active === true;
  const wasActive = isFilterActive(key);

  const draftState: FilterDraftState = {
    ...val,
    active: hasContent ? (val.active ?? true) : false,
  };

  updateFilterValue(key, draftState);

  if (hasContent || wasActive) {
    applyDebounced();
  }
};

const handleEnter = (close?: () => void) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (hasInvalidDraft(resolvedFilters.value, resolvedModelValue.value, activeFilters.value)) {
    return;
  }
  if (props.table) {
    runApplyFilters(resolvedModelValue.value);
  }
  isDirty.value = false;
  emit('apply');
  if (close) {
    close();
  }
};

const clearSingleFilter = (key: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  delete customDisplayValues.value[key];
  const updated = updateFilterValue(key, null);
  if (props.table) {
    runApplyFilters(updated);
  }
  isDirty.value = false;
  emit('apply');
};

const handleClearAll = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  customDisplayValues.value = {};
  if (props.table) {
    runClearFilters();
  }
  emit('clear');
};

const onCustomFilterUpdate = (filter: FilterDefinition, rawVal: FilterValue | FilterDraftState | null) => {
  if (rawVal === null || rawVal === undefined || rawVal === '') {
    onFilterUpdate(filter.key, null);
    return;
  }
  if (typeof rawVal === 'object' && rawVal !== null && !Array.isArray(rawVal) && 'value' in rawVal) {
    onFilterUpdate(filter.key, rawVal);
    return;
  }
  const defaultComp = filter.default?.comparator || filter.comparators[0]?.key || 'equals';
  const currentComp = resolvedModelValue.value[filter.key]?.comparator || defaultComp;
  onFilterUpdate(filter.key, {
    comparator: currentComp,
    value: rawVal,
    active: true,
  });
};

const tableWithHelpers = computed(() => {
  const tbl = props.table;
  if (!tbl || typeof tbl !== 'object') {
    return {
      resetAllFilters: () => handleClearAll(),
    };
  }
  return new Proxy(tbl as object, {
    get(target, prop, receiver) {
      if (prop === 'resetAllFilters') {
        return () => handleClearAll();
      }
      return Reflect.get(target, prop, receiver);
    },
  });
});

const getSlotProps = (filter: FilterDefinition, closeDropdown?: () => void) => ({
  filter,
  value: resolvedModelValue.value[filter.key]?.value,
  comparator: resolvedModelValue.value[filter.key]?.comparator,
  draft: resolvedModelValue.value[filter.key],
  update: (val: FilterValue | FilterDraftState | null) => onCustomFilterUpdate(filter, val),
  setDisplayValue: (val: string) => setCustomDisplayValue(filter.key, val),
  table: tableWithHelpers.value,
  close: closeDropdown,
});

const setupDropdownOverflow = (el: Element | ComponentPublicInstance | null) => {
  const domNode = el && '$el' in el ? (el.$el as Element | null) : el;
  if (domNode && domNode instanceof HTMLElement) {
    const dropdown = domNode.closest<HTMLElement>('.zt-dropdown');
    if (dropdown) {
      dropdown.style.overflow = 'visible';
      if (isDark.value) {
        dropdown.classList.add(darkClass.value);
      } else {
        dropdown.classList.remove(darkClass.value);
      }
    }
  }
};

defineExpose({
  handleClearAll,
  resetAllFilters: handleClearAll,
  currentActiveCount,
});

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

console.log('TableFilter', props.filters)
</script>

<template>
  <section
    v-if="open"
    aria-label="Table filters"
    :class="[headerClasses, { [darkClass]: isDark }]"
    :data-dark-mode="isDark ? 'enabled' : undefined"
  >
    <!-- Single scrollable row of pills -->
    <div
      class="flex flex-nowrap items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <template v-if="resolvedFilters.length > 0">
        <CommonDropdown
          v-for="filter in resolvedFilters"
          :key="filter.key"
          :width="260"
          :offset="8"
          align="start"
        >
          <template #trigger="{ toggle, open: isOpen }">
            <div
              :class="[
                'rounded-lg inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border px-3 py-1.5 text-xs transition-colors select-none',
                isFilterActive(filter.key)
                  ? 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ring-0'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
                isOpen ? 'border-[var(--zt-primary,#64748b)] ring-0 dark:border-[var(--zt-primary,#94a3b8)]' : '',
              ]"
            >
              <button
                type="button"
                :aria-label="getFilterByLabel(filter.label)"
                class="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                @click="toggle"
              >
                <!-- Column label: muted -->
                <span class="text-slate-500 dark:text-slate-400 font-semibold">{{ filter.label }}</span>

                <!-- Comparator: visible unless withoutClause, bold -->
                <span
                  v-if="!filter.withoutClause && getComparatorLabel(filter)"
                  class="font-semibold text-slate-800 dark:text-slate-100"
                >
                  {{ getComparatorLabel(filter) }}
                </span>

                <!-- Value, only when set -->
                <span
                  v-if="isFilterActive(filter.key) && getFilterDisplayValue(filter.key)"
                  class="max-w-[140px] truncate text-slate-600 dark:text-slate-300"
                >
                  {{ getFilterDisplayValue(filter.key) }}
                </span>

                <CommonIcon
                  v-if="!isFilterActive(filter.key) || !getFilterDisplayValue(filter.key)"
                  :icon="filterChevronIcon"
                  class="h-3 w-3 text-slate-400 dark:text-slate-500"
                />
              </button>

              <!-- Clear (X) when active -->
              <span
                v-if="isFilterActive(filter.key) && getFilterDisplayValue(filter.key)"
                role="button"
                tabindex="0"
                :aria-label="clearFilterLabel"
                class="-mr-1 ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200 cursor-pointer inline-flex items-center justify-center"
                @click.stop="clearSingleFilter(filter.key)"
                @keydown.enter.stop.prevent="clearSingleFilter(filter.key)"
                @keydown.space.stop.prevent="clearSingleFilter(filter.key)"
              >
                <CommonIcon
                  :icon="filterCloseIcon"
                  class="h-3 w-3"
                />
              </span>
            </div>
          </template>

          <!-- Popover: filter component -->
          <template #default="{ close: closeDropdown }">
            <div
              :ref="setupDropdownOverflow"
              class="zonvoir-filter-popover"
              :class="[{ [darkClass]: isDark }]"
              :data-dark-mode="isDark ? 'enabled' : undefined"
            >
              <component
                :is="getFilterSlot(filter.key)"
                v-if="getFilterSlot(filter.key)"
                v-bind="getSlotProps(filter, closeDropdown)"
              />
              <FilterEditor
                v-else
                :definition="filter"
                :model-value="resolvedModelValue[filter.key]"
                compact
                @update:model-value="(val) => onFilterUpdate(filter.key, val)"
                @enter="handleEnter(closeDropdown)"
              />
            </div>
          </template>
        </CommonDropdown>

        <CommonButton v-if="currentActiveCount > 0" variant="outline" size="sm" class="ml-2" @click="handleClearAll">
          {{ clearAllFiltersLabel }}
        </CommonButton>
      </template>

      <div v-else class="py-1 text-xs text-slate-400 dark:text-slate-500">
        {{ noFiltersLabel }}
      </div>
    </div>
  </section>
</template>
