<script setup lang="ts">
import { computed, ref, watch, getCurrentInstance, onMounted, onUnmounted, nextTick, type ComponentInternalInstance } from 'vue';
import CommonButton from './Common/CommonButton.vue';
import CommonIcon from './Common/CommonIcon.vue';
import { twMerge } from 'tailwind-merge';
import { useTableConfiguration, useTableDarkMode } from '../config/tableConfig';
import {
  useTableFilters,
  hasInvalidDraft,
  type FilterDefinition,
  type ActiveFilterState,
  type TableFilterSource,
  type FilterDraftState,
  type FilterValue,
} from '../composables/useTableFilters';
import FilterEditor from './filters/FilterEditor.vue';
import ActiveFilters from './ActiveFilters.vue';

export type TableFilterPanelProps = {
  open?: boolean;
  table?: TableFilterSource | null;
  filters?: FilterDefinition[];
  modelValue?: Record<string, FilterDraftState>;
  activeCount?: number;
  autoVisit?: boolean;
};

const props = withDefaults(
  defineProps<TableFilterPanelProps>(),
  {
    open: false,
    table: undefined,
    filters: undefined,
    modelValue: undefined,
    activeCount: undefined,
    autoVisit: true,
  },
);

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'update:modelValue', val: Record<string, FilterDraftState>): void;
  (e: 'apply'): void;
  (e: 'clear'): void;
  (e: 'close'): void;
  (e: 'filter-change', val: ActiveFilterState[]): void;
}>();

const tableRef = computed(() => props.table);
const {
  filterDefinitions: tableFilterDefinitions,
  draftFilters,
  activeFilters,
  initDraft,
  editFilter,
  applyFilters: runApplyFilters,
  clearFilters: runClearFilters,
} = useTableFilters(tableRef, {
  autoVisit: computed(() => props.autoVisit),
  onFilterChange: (filters) => emit('filter-change', filters),
});

const tableConfig = useTableConfiguration();
const { isDark, darkClass } = useTableDarkMode(tableConfig);

const panelClasses = computed(() => {
  const customFilter = tableConfig.value?.classes?.filter;
  const customPanel = tableConfig.value?.classes?.filterPanel || tableConfig.value?.classes?.filterDrawer;
  const baseClasses =
    'zonvoir-table-filter-panel relative rounded-lg flex w-72 h-full sm:w-80 shrink-0 flex-col self-stretch border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';
  const darkClasses = isDark.value ? 'bg-slate-900 border-slate-800 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, customFilter, customPanel);
});

const panelStickyClasses = computed(() => {
  const customFilter = tableConfig.value?.classes?.filter;
  const customPanel = tableConfig.value?.classes?.filterPanel || tableConfig.value?.classes?.filterDrawer;
  const baseClasses =
    'zonvoir-table-filter-panel-sticky rounded-lg sticky top-0 flex flex-col w-full bg-white dark:bg-slate-900';
  const darkClasses = isDark.value ? 'bg-slate-900 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, customFilter, customPanel);
});

const panelHeaderClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterPanelHeader || tableConfig.value?.classes?.filterDrawerHeader;
  const baseClasses =
    'shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800';
  const darkClasses = isDark.value ? 'border-slate-800 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const panelBodyClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterPanelBody || tableConfig.value?.classes?.filterDrawerBody;
  const baseClasses =
    'flex-1 min-h-0 overflow-y-auto px-5 py-2 divide-y divide-slate-100 dark:divide-slate-800';
  const darkClasses = isDark.value ? 'divide-slate-800' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const panelFooterClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterPanelFooter || tableConfig.value?.classes?.filterDrawerFooter;
  const baseClasses =
    'rounded-b-lg shrink-0 mt-auto flex items-center justify-between border-t border-slate-200 px-5 py-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40';
  const darkClasses = isDark.value ? 'border-slate-800 bg-slate-950/40 text-slate-400' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const filterCloseIcon = computed(() => tableConfig.value?.icons?.filterClose ?? 'heroicons:x-mark');
const filtersLabel = computed(() => tableConfig.value?.labels?.filters ?? 'Filters');
const resetAllLabel = computed(() => tableConfig.value?.labels?.resetAll ?? 'Reset All');
const applyFiltersLabel = computed(() => tableConfig.value?.labels?.applyFilters ?? 'Apply Filters');
const noFiltersLabel = computed(
  () => tableConfig.value?.labels?.noFiltersAvailable ?? 'No filters available.'
);
const hideFiltersLabel = computed(
  () => tableConfig.value?.labels?.closeFiltersPanel ?? 'Close filters panel'
);

const isDirty = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const instance = getCurrentInstance();
const availableHeight = ref<string>('calc(100dvh - 1rem)');

const updateAvailableHeight = () => {
  if (typeof window === 'undefined' || !panelRef.value) return;
  const rect = panelRef.value.getBoundingClientRect();
  const topOffset = Math.max(0, rect.top);
  const vh = window.innerHeight;
  // Available height from top of panel to bottom of viewport
  const safeAvailable = Math.max(200, vh - topOffset);
  availableHeight.value = `${safeAvailable}px`;
};

let rAF: number | null = null;
const onScrollOrResize = () => {
  if (rAF !== null) return;
  rAF = window.requestAnimationFrame(() => {
    updateAvailableHeight();
    rAF = null;
  });
};

onMounted(() => {
  updateAvailableHeight();
  window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
});

onUnmounted(() => {
  if (rAF !== null) {
    window.cancelAnimationFrame(rAF);
    rAF = null;
  }
  window.removeEventListener('scroll', onScrollOrResize, { capture: true });
  window.removeEventListener('resize', onScrollOrResize);
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        updateAvailableHeight();
      });
    }
  },
);

const getFilterSlot = (key: string) => {
  let curr: ComponentInternalInstance | null = instance;
  while (curr) {
    const slot = curr.slots?.[`filter(${key})`] ?? curr.slots?.[`filter-${key}`];
    if (slot) return slot;
    curr = curr.parent;
  }
  return null;
};

// Reconcile draft when panel opens OR when authoritative server filter state updates while open even with unsaved edits
watch(
  () => [props.open, activeFilters.value],
  ([isOpen]) => {
    if (!isOpen) {
      isDirty.value = false;
      return;
    }
    isDirty.value = false;
    if (props.table) {
      initDraft();
    }
  },
  { deep: true, immediate: true },
);

const resolvedFilters = computed<FilterDefinition[]>(() => {
  if (Array.isArray(props.filters)) {
    return props.filters;
  }
  return tableFilterDefinitions.value;
});

const resolvedModelValue = computed<Record<string, FilterDraftState>>({
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

const isApplyDisabled = computed(() =>
  hasInvalidDraft(resolvedFilters.value, resolvedModelValue.value, activeFilters.value),
);

const close = () => {
  isDirty.value = false;
  emit('update:open', false);
  emit('close');
};

const updateFilterValue = (
  key: string,
  val: { comparator: string; value: FilterValue } | null,
) => {
  isDirty.value = true;
  const updated = { ...resolvedModelValue.value };
  if (!val) {
    delete updated[key];
  } else {
    updated[key] = val;
  }
  resolvedModelValue.value = updated;
};

const createFilterUpdater = (key: string) =>
  (val: { comparator: string; value: FilterValue } | null) => {
    updateFilterValue(key, val);
  };

const handleEditFilter = (index: number) => {
  const activeItem = activeFilters.value[index];
  editFilter(index);
  if (activeItem) {
    const root = panelRef.value ?? document;
    const el = root.querySelector<HTMLElement>(
      `[data-filter-key="${activeItem.key}"] select, [data-filter-key="${activeItem.key}"] input`,
    );
    el?.focus();
  }
};

const handleRemoveFilter = (index: number) => {
  const activeItem = activeFilters.value[index];
  if (!activeItem) return;
  const remaining = activeFilters.value.filter((_, i) => i !== index);
  const updated = { ...resolvedModelValue.value };
  delete updated[activeItem.key];
  resolvedModelValue.value = updated;
  if (props.table) {
    runApplyFilters(remaining);
  }
  emit('apply');
};

const handleApply = () => {
  if (isApplyDisabled.value) {
    return;
  }
  isDirty.value = false;
  if (props.table) {
    runApplyFilters(resolvedModelValue.value);
  }
  emit('apply');
};

const handleReset = () => {
  isDirty.value = false;
  if (props.table) {
    runClearFilters();
  }
  emit('clear');
};
</script>

<template>
  <aside
    v-if="open"
    ref="panelRef"
    :class="[panelClasses, { [darkClass]: isDark }]"
    :data-dark-mode="isDark ? 'enabled' : undefined"
  >
    <div
      :class="panelStickyClasses"
      :style="{ height: availableHeight, minHeight: availableHeight, maxHeight: availableHeight }"
    >
      <!-- Header -->
      <div :class="panelHeaderClasses">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ filtersLabel }}</h3>
        </div>
        <button
          type="button"
          :aria-label="hideFiltersLabel"
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          @click="close"
        >
          <CommonIcon :icon="filterCloseIcon" class="h-4 w-4" />
        </button>
      </div>

      <!-- Active Filters Summary -->
      <ActiveFilters
        class="shrink-0"
        :definitions="resolvedFilters"
        :filters="activeFilters"
        @edit="handleEditFilter"
        @remove="handleRemoveFilter"
      />

      <!-- Body -->
      <div :class="panelBodyClasses">
        <template v-if="resolvedFilters.length > 0">
          <template v-for="filter in resolvedFilters" :key="filter.key">
            <component
              :is="getFilterSlot(filter.key)"
              v-if="getFilterSlot(filter.key)"
              :filter="filter"
              :value="resolvedModelValue[filter.key]?.value"
              :update="createFilterUpdater(filter.key)"
              :table="props.table"
              :close="close"
            />
            <FilterEditor
              v-else
              :definition="filter"
              :model-value="resolvedModelValue[filter.key]"
              @update:model-value="(val) => updateFilterValue(filter.key, val)"
            />
          </template>
        </template>
        <div v-else class="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
          {{ noFiltersLabel }}
        </div>
      </div>

      <!-- Footer -->
      <div :class="panelFooterClasses">
        <CommonButton
          size="sm"
          variant="ghost"
          @click="handleReset"
        >
          {{ resetAllLabel }}
        </CommonButton>
        <CommonButton
          size="sm"
          :disabled="isApplyDisabled"
          @click="handleApply"
        >
          {{applyFiltersLabel}}
        </CommonButton>
      </div>
    </div>
  </aside>
</template>
