<script setup lang="ts">
import { computed, type Component, type ComputedRef } from 'vue';
import { Icon } from '@iconify/vue';
import { useTableConfiguration, type TableIcon } from '../../config/tableConfig';

type IconProps = {
  icon: TableIcon;
}

const props = defineProps<IconProps>();
const tableConfig = useTableConfiguration();

const resolvedIcon: ComputedRef<TableIcon | null> = computed((): TableIcon | null => {
  if (typeof props.icon !== 'string') {
    return props.icon;
  }

  return tableConfig.value.icons[props.icon] ?? props.icon;
});

const isComponentIcon: ComputedRef<boolean> = computed((): boolean =>
  resolvedIcon.value !== null && typeof resolvedIcon.value !== 'string'
);
</script>

<template>
  <component
    v-if="isComponentIcon"
    :is="resolvedIcon as Component"
  />
  <Icon
    v-else-if="resolvedIcon"
    :icon="resolvedIcon as string"
    :ssr="false"
  />
</template>
