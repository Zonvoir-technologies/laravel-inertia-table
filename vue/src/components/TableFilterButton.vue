<script setup lang="ts">
import { computed } from 'vue';
import CommonButton from './Common/CommonButton.vue';
import CommonBadge from './Common/CommonBadge.vue';
import { twMerge } from 'tailwind-merge';
import { useTableConfiguration, useTableDarkMode } from '../config/tableConfig';
import { useTableFilters, type TableFilterSource } from '../composables/useTableFilters';

export type TableFilterButtonProps = {
  open?: boolean;
  table?: TableFilterSource | null;
  activeCount?: number;
};

const props = withDefaults(
  defineProps<TableFilterButtonProps>(),
  {
    open: false,
    table: undefined,
    activeCount: undefined,
  },
);

defineEmits<{
  (e: 'toggle'): void;
}>();

const tableConfig = useTableConfiguration();
const { isDark, darkClass } = useTableDarkMode(tableConfig);

const buttonClasses = computed(() => {
  const customBtn = tableConfig.value?.classes?.filterButton;
  return twMerge('zonvoir-table-filter-btn', customBtn);
});

const tableRef = computed(() => props.table);
const { activeCount: computedActiveCount } = useTableFilters(tableRef);

const count = computed(() => {
  if (typeof props.activeCount === 'number') {
    return props.activeCount;
  }
  return computedActiveCount.value;
});

const label = computed(() => {
  if (props.open) {
    return tableConfig.value?.labels?.hideFilters ?? 'Hide filters';
  }
  return tableConfig.value?.labels?.filters ?? 'Filters';
});
</script>

<template>
  <CommonButton
    type="button"
    variant="outline"
    aria-label="Toggle table filters"
    :aria-expanded="open"
    :class="[
      buttonClasses,
      { 'bg-slate-100 dark:bg-slate-700/60 border-slate-400 dark:border-slate-600': open, [darkClass]: isDark }
    ]"
    :data-dark-mode="isDark ? 'enabled' : undefined"
    leading-icon="filter"
    @click="$emit('toggle')"
  >
    <span>{{ label }}</span>
    <CommonBadge
      v-if="count > 0"
      variant="solid"
      color="primary"
      size="xs"
      round
      class="h-4 min-w-4 px-1 text-[10px] font-semibold leading-none"
    >
      {{ count }}
    </CommonBadge>
  </CommonButton>
</template>
