<script setup lang="ts">
import { computed } from 'vue';
import { useFilterField } from './useFilterField';
import CommonSelect from '../Common/CommonSelect.vue';
import type {
  FilterDefinition,
  FilterDraftState,
  FilterValue,
} from '../../composables/useTableFilters';

export type SetFilterProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<SetFilterProps>(),
  {
    modelValue: undefined,
    compact: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterDraftState | null): void;
  (e: 'enter'): void;
}>();

const {
  comparator,
  multiple,
  nullable,
  isNull,
  canClear,
  isFieldActive,
  displayLabel,
  update,
  changeComparator,
} = useFilterField(props, emit);

const filterSelectValue = computed(() => {
  const val = props.modelValue?.value;
  if (multiple.value) {
    if (Array.isArray(val)) return val as (string | number | boolean)[];
    if (val !== undefined && val !== null && val !== '') return [val as string | number | boolean];
    return [];
  }
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
});

const onSetFilterChange = (val: string | number | boolean | (string | number | boolean)[]) => {
  if (!multiple.value && val === '') {
    emit('update:modelValue', { comparator: comparator.value, value: '', active: true });
  } else {
    update(val as FilterValue);
  }
};
</script>

<template>
  <div
    :class="
      compact
        ? 'zonvoir-filter-item p-3 flex flex-col gap-2.5'
        : 'zonvoir-filter-item py-3.5 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 transition-colors'
    "
    :data-filter-key="definition.key"
  >
    <div v-if="!compact" class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5">
        <span
          v-if="isFieldActive"
          class="h-1.5 w-1.5 rounded-full bg-[var(--zt-primary,#0f172a)] ring-2 ring-[var(--zt-primary,#0f172a)]/20 dark:bg-[var(--zt-primary,#f8fafc)] dark:ring-[var(--zt-primary,#f8fafc)]/20"
          aria-hidden="true"
        />
        <label
          class="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-tight"
        >{{ displayLabel }}</label>
      </div>
      <button
        v-if="canClear"
        type="button"
        class="text-[11px] font-medium text-slate-400 hover:text-[var(--zt-primary,#0f172a)] dark:text-slate-500 dark:hover:text-[var(--zt-primary,#f8fafc)] transition-colors"
        @click="emit('update:modelValue', null)"
      >
        Clear
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <CommonSelect
        v-if="!definition.withoutClause"
        :model-value="comparator"
        :options="definition.comparators"
        aria-label="Filter comparator"
        :compact="compact"
        @update:model-value="changeComparator"
        @change="changeComparator"
      />
      <label
        v-if="nullable"
        class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
      >
        <input
          type="checkbox"
          :checked="isNull"
          :aria-label="`${definition.label} is null`"
          @change="update(($event.target as HTMLInputElement).checked ? null : '')"
        />
        Null value
      </label>
      <template v-if="!isNull">
        <CommonSelect
          :model-value="filterSelectValue"
          :options="definition.options ?? []"
          :multiple="multiple"
          :searchable="definition.searchable"
          :use-index-value="true"
          :aria-label="multiple ? 'Filter values' : 'Filter value'"
          :placeholder="multiple ? 'Select values...' : 'Select a value'"
          :compact="compact"
          @update:model-value="onSetFilterChange"
        />
      </template>
    </div>
  </div>
</template>
