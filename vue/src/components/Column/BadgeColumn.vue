<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useDisplayValue, resolveMeta } from '../../composables/useCellValue';
import type { TableColumn, TableRow } from '../../types/table';
import CommonBadge from "../Common/CommonBadge.vue";

interface BadgeColumnProps {
  column: TableColumn;
  row: TableRow;
}

const props = defineProps<BadgeColumnProps>();
const displayValue: ComputedRef<string> = useDisplayValue(props.column, props.row);

const badgeColor: ComputedRef<string> = computed((): string => {
  const value: string = displayValue.value;

  return resolveMeta(props.column.meta.colors, value) ?? 'neutral';
});

const badgeVariant: ComputedRef<string> = computed((): string => {
  return typeof props.column.meta.variant === 'string' ? props.column.meta.variant : 'outline';
});

const badgeIcon: ComputedRef<string> = computed((): string => {
  const mappedIcon: string | undefined = resolveMeta(props.column.meta.icons, displayValue.value);

  if (mappedIcon) {
    return mappedIcon;
  }

  return typeof props.column.meta.icon === 'string' ? props.column.meta.icon : '';
});
</script>

<template>
  <CommonBadge :variant="badgeVariant" :color="badgeColor" :icon="badgeIcon">
    {{ displayValue }}
  </CommonBadge>
</template>
