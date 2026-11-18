<script setup lang="ts">
import FilterEditor from './FilterEditor.vue';
import type { FilterDefinition, FilterDraftState } from '../../composables/useTableFilters';

export type FilterInputProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<FilterInputProps>(),
  {
    modelValue: undefined,
    compact: false,
  },
);
void props;

defineEmits<{
  (e: 'update:modelValue', value: FilterDraftState | null): void;
  (e: 'enter'): void;
}>();
</script>

<template>
  <FilterEditor
    :definition="definition"
    :model-value="modelValue"
    :compact="compact"
    @update:model-value="$emit('update:modelValue', $event)"
    @enter="$emit('enter')"
  />
</template>
