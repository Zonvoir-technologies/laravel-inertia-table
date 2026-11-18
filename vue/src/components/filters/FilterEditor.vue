<script setup lang="ts">
import { computed, type Component } from 'vue';
import type { FilterDefinition, FilterDraftState } from '../../composables/useTableFilters';
import TextFilter from './TextFilter.vue';
import BooleanFilter from './BooleanFilter.vue';
import DateFilter from './DateFilter.vue';
import NumericFilter from './NumericFilter.vue';
import SetFilter from './SetFilter.vue';

export type FilterEditorProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<FilterEditorProps>(),
  {
    modelValue: undefined,
    compact: false,
  },
);

defineEmits<{
  (e: 'update:modelValue', value: FilterDraftState | null): void;
  (e: 'enter'): void;
}>();

const components: Record<string, Component> = {
  text: TextFilter,
  boolean: BooleanFilter,
  date: DateFilter,
  datetime: DateFilter,
  numeric: NumericFilter,
  set: SetFilter,
};

const editor = computed(() => {
  if (props.definition.component) {
    return props.definition.component;
  }
  return components[props.definition.type] ?? TextFilter;
});
</script>

<template>
  <component
    :is="editor"
    :definition="definition"
    :model-value="modelValue"
    :compact="compact"
    @update:model-value="$emit('update:modelValue', $event)"
    @enter="$emit('enter')"
  />
</template>
