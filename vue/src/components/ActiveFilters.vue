<script setup lang="ts">
import { computed } from 'vue';
import CommonIcon from './Common/CommonIcon.vue';
import { useTableConfiguration } from '../config/tableConfig';
import { twMerge } from 'tailwind-merge';
import {
  formatFilterValue,
  type ActiveFilterState,
  type FilterDefinition,
} from '../composables/useTableFilters';

export type ActiveFiltersProps = {
  definitions?: FilterDefinition[];
  filters?: ActiveFilterState[];
};

const props = withDefaults(
  defineProps<ActiveFiltersProps>(),
  {
    definitions: (): FilterDefinition[] => [],
    filters: (): ActiveFilterState[] => [],
  },
);

defineEmits<{
  (e: 'edit', index: number): void;
  (e: 'remove', index: number): void;
}>();

const tableConfig = useTableConfiguration();

const filterRemoveIcon = computed(
  () =>
    tableConfig.value?.icons?.filterRemove ??
    tableConfig.value?.icons?.filterClose ??
    'heroicons:x-mark'
);

const activeFiltersClass = computed(() => {
  return twMerge(
    'flex flex-wrap gap-2 px-5 py-3',
    tableConfig.value?.classes?.activeFilters
  );
});

const activeFilterTagClass = computed(() => {
  return twMerge(
    'inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-200',
    tableConfig.value?.classes?.activeFilterTag
  );
});

const getDefinition = (filter: ActiveFilterState) => {
  return props.definitions.find((item) => item.key === filter.key);
};

const getLabel = (filter: ActiveFilterState) => {
  return getDefinition(filter)?.label ?? filter.key;
};

const getComparator = (filter: ActiveFilterState) => {
  const definition = getDefinition(filter);

  return (
    definition?.comparators.find(
      (item) => item.key === filter.comparator
    )?.label ?? filter.comparator
  );
};

const getValue = (filter: ActiveFilterState) => {
  const definition = getDefinition(filter);

  if (!definition) {
    return String(filter.value ?? '');
  }

  return formatFilterValue(definition, filter.value);
};

const description = (filter: ActiveFilterState) => {
  return `${getLabel(filter)} ${getComparator(filter)} ${getValue(filter)}`;
};
</script>

<template>
  <div
    v-if="props.filters.length"
    aria-label="Active filters"
    :class="activeFiltersClass"
  >
    <div
      v-for="(filter, index) in filters"
      :key="`${filter.key}-${filter.comparator}-${index}`"
      :class="activeFilterTagClass"
    >
      <button
        type="button"
        :aria-label="`Edit ${description(filter)}`"
        class="flex min-w-0 items-center gap-1 truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--zt-primary,#64748b)] dark:focus-visible:outline-[var(--zt-primary,#94a3b8)]"
        @click="$emit('edit', index)"
      >
        <span class="truncate font-semibold text-slate-500 dark:text-slate-400">{{ getLabel(filter) }}</span>
        <span class="truncate font-semibold text-slate-800 dark:text-slate-100">{{ ' ' + getComparator(filter) }}</span>
        <span class="truncate text-slate-600 dark:text-slate-300">{{ ' ' + getValue(filter) }}</span>
      </button>

      <button
        type="button"
        :aria-label="`Remove ${description(filter)}`"
        class="cursor-pointer shrink-0 rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--zt-primary,#64748b)] dark:focus-visible:outline-[var(--zt-primary,#94a3b8)]"
        @click="$emit('remove', index)"
      >
        <CommonIcon :icon="filterRemoveIcon" class="h-3 w-3" />
      </button>
    </div>
  </div>
</template>
