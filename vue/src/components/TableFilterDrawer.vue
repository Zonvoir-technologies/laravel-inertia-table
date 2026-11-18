<script setup lang="ts">
import { computed, nextTick, ref, watch, getCurrentInstance, onBeforeUnmount, type ComponentInternalInstance } from 'vue';
import CommonIcon from './Common/CommonIcon.vue';
import { twMerge } from 'tailwind-merge';
import { useTableConfiguration, useTableDarkMode } from '../config/tableConfig';
import { usePageScrollLock } from '../composables/usePageScrollLock';
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

export type TableFilterDrawerProps = {
  open?: boolean;
  table?: TableFilterSource | null;
  filters?: FilterDefinition[];
  modelValue?: Record<string, FilterDraftState>;
  activeCount?: number;
  autoVisit?: boolean;
};

const props = withDefaults(
  defineProps<TableFilterDrawerProps>(),
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
  activeCount: computedActiveCount,
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

const drawerClasses = computed(() => {
  const customFilter = tableConfig.value?.classes?.filter;
  const customDrawer = tableConfig.value?.classes?.filterDrawer ?? tableConfig.value?.classes?.filterPanel;
  const baseClasses =
    'w-screen max-w-sm sm:max-w-md bg-white shadow-2xl dark:bg-slate-900 flex flex-col border-l border-slate-200 dark:border-slate-800';
  const darkClasses = isDark.value ? 'bg-slate-900 border-slate-800 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, customFilter, customDrawer);
});

const drawerHeaderClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterDrawerHeader ?? tableConfig.value?.classes?.filterPanelHeader;
  const baseClasses =
    'shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800';
  const darkClasses = isDark.value ? 'border-slate-800 text-slate-100' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const drawerBodyClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterDrawerBody ?? tableConfig.value?.classes?.filterPanelBody;
  const baseClasses =
    'flex-1 overflow-y-auto px-5 py-2 divide-y divide-slate-100 dark:divide-slate-800';
  const darkClasses = isDark.value ? 'divide-slate-800' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const drawerFooterClasses = computed(() => {
  const custom =
    tableConfig.value?.classes?.filterDrawerFooter ?? tableConfig.value?.classes?.filterPanelFooter;
  const baseClasses =
    'shrink-0 flex items-center justify-between border-t border-slate-200 px-5 py-3.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40';
  const darkClasses = isDark.value ? 'border-slate-800 bg-slate-950/40 text-slate-400' : '';
  return twMerge(baseClasses, darkClasses, custom);
});

const filterCloseIcon = computed(() => tableConfig.value?.icons?.filterClose ?? 'heroicons:x-mark');
const filterIcon = computed(() => tableConfig.value?.icons?.filter ?? 'heroicons:funnel');
const filtersLabel = computed(() => tableConfig.value?.labels?.filters ?? 'Filters');
const resetAllLabel = computed(() => tableConfig.value?.labels?.resetAll ?? 'Reset All');
const cancelLabel = computed(() => tableConfig.value?.labels?.cancelButton ?? 'Cancel');
const applyFiltersLabel = computed(() => tableConfig.value?.labels?.applyFilters ?? 'Apply Filters');
const noFiltersLabel = computed(
  () => tableConfig.value?.labels?.noFiltersAvailable ?? 'No filters available for this table.'
);
const hideFiltersLabel = computed(
  () => tableConfig.value?.labels?.closeFiltersDrawer ?? 'Close filters drawer'
);

const isDirty = ref(false);
let wasOpen = false;
const dialogRef = ref<HTMLElement | null>(null);
const instance = getCurrentInstance();
const { lockPageScroll, unlockPageScroll } = usePageScrollLock();

const getFilterSlot = (key: string) => {
  let curr: ComponentInternalInstance | null = instance;
  while (curr) {
    const slot = curr.slots?.[`filter(${key})`] ?? curr.slots?.[`filter-${key}`];
    if (slot) return slot;
    curr = curr.parent;
  }
  return null;
};

// Reconcile draft when drawer opens OR when authoritative server filter state updates while open without unsaved edits
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
  { deep: true, immediate: true }
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

const currentActiveCount = computed<number>(() => {
  if (typeof props.activeCount === 'number') {
    return props.activeCount;
  }
  return computedActiveCount.value;
});

const isApplyDisabled = computed(() =>
  hasInvalidDraft(resolvedFilters.value, resolvedModelValue.value, activeFilters.value),
);

let previousActiveElement: HTMLElement | null = null;

watch(
  () => props.open,
  (open, oldOpen) => {
    if (open) {
      lockPageScroll();
      if (!oldOpen) {
        previousActiveElement = document.activeElement as HTMLElement | null;
      }
      nextTick(() => {
        if (!dialogRef.value?.contains(document.activeElement)) {
          dialogRef.value?.focus();
        }
      });
    } else {
      unlockPageScroll();
      if (previousActiveElement) {
        previousActiveElement.focus();
        previousActiveElement = null;
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unlockPageScroll();
});

const onDialogKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close();
    return;
  }
  if (event.key === 'Tab' && dialogRef.value) {
    const focusable = Array.from(
      dialogRef.value.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.value)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.value)) {
      event.preventDefault();
      first.focus();
    }
  }
};

const close = () => {
  isDirty.value = false;
  unlockPageScroll();
  emit('update:open', false);
  emit('close');
};

const updateFilterValue = (
  key: string,
  val: { comparator: string; value: FilterValue } | null
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

const handleEditFilter = (index: number) => {
  const activeItem = activeFilters.value[index];
  editFilter(index);
  if (activeItem) {
    const root = dialogRef.value ?? document;
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
  close();
};

const handleReset = () => {
  isDirty.value = false;
  if (props.table) {
    runClearFilters();
  }
  emit('clear');
  close();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="zonvoir-table-filter-drawer relative z-[999]"
      :class="[{ [darkClass]: isDark }]"
      :data-dark-mode="isDark ? 'enabled' : undefined"
      aria-labelledby="slide-over-title"
      role="region"
    >
      <!-- Backdrop with fade transition -->
      <Transition
        appear
        enter-active-class="ease-in-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in-out duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          @click="close"
        />
      </Transition>

      <!-- Slide-over panel with slide transition -->
      <div class="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <Transition
          appear
          enter-active-class="transform transition ease-in-out duration-300"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition ease-in-out duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            ref="dialogRef"
            :class="[drawerClasses, { [darkClass]: isDark }]"
            role="dialog"
            aria-modal="true"
            aria-label="Table filters"
            tabindex="-1"
            @keydown="onDialogKeydown"
          >
            <!-- Header -->
            <div :class="drawerHeaderClasses">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--zt-primary-50,#f8fafc)] text-[var(--zt-primary,#0f172a)] dark:bg-[var(--zt-primary-950,#020617)] dark:text-[var(--zt-primary-200,#e2e8f0)]">
                  <CommonIcon :icon="filterIcon" class="h-4 w-4" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-slate-900 dark:text-white">{{ filtersLabel }}</h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Filter records by criteria</p>
                </div>
                <span
                  v-if="currentActiveCount > 0"
                  class="ml-1 inline-flex items-center rounded-full bg-[var(--zt-primary-50,#f8fafc)] px-2 py-0.5 text-xs font-semibold text-[var(--zt-primary-700,#334155)] dark:bg-[var(--zt-primary-950,#020617)] dark:text-[var(--zt-primary-200,#e2e8f0)]"
                >
                  {{ currentActiveCount }} active
                </span>
              </div>
              <button
                type="button"
                :aria-label="hideFiltersLabel"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
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

            <!-- Body (Filter controls list) -->
            <div :class="drawerBodyClasses">
              <template v-if="resolvedFilters.length > 0">
                <template v-for="filter in resolvedFilters" :key="filter.key">
                  <component
                    :is="getFilterSlot(filter.key)"
                    v-if="getFilterSlot(filter.key)"
                    :filter="filter"
                    :value="resolvedModelValue[filter.key]?.value"
                    :update="(val: { comparator: string; value: FilterValue } | null) => updateFilterValue(filter.key, val)"
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
            <div :class="drawerFooterClasses">
              <button
                type="button"
                class="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                @click="handleReset"
              >
                {{ resetAllLabel }}
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  @click="close"
                >
                  {{ cancelLabel }}
                </button>
                <button
                  type="button"
                  :disabled="isApplyDisabled"
                  :class="[
                    'rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors',
                    isApplyDisabled
                      ? 'bg-[var(--zt-primary-400,#94a3b8)] text-[var(--zt-primary-foreground,#ffffff)] cursor-not-allowed opacity-60'
                      : 'bg-[var(--zt-primary,#475569)] text-[var(--zt-primary-foreground,#ffffff)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--zt-primary,#475569)] focus:ring-offset-2 dark:bg-[var(--zt-primary,#334155)] dark:text-[var(--zt-primary-foreground,#ffffff)] dark:focus:ring-[var(--zt-primary,#334155)] dark:focus:ring-offset-slate-900',
                  ]"
                  @click="handleApply"
                >
                  {{ applyFiltersLabel }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>
