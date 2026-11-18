<script setup lang="ts">
import { computed } from 'vue';
import { useFilterField } from './useFilterField';
import CommonSelect, { type SelectOption } from '../Common/CommonSelect.vue';
import type {
  FilterDefinition,
  FilterDraftState,
  FilterValue,
} from '../../composables/useTableFilters';

export type BooleanFilterProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<BooleanFilterProps>(),
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
  canClear,
  isFieldActive,
  displayLabel,
} = useFilterField(props, emit);

const hasEquals = computed(() =>
  props.definition.comparators.some((item) => item.key === 'equals'),
);

const hasNotEquals = computed(() =>
  props.definition.comparators.some((item) => item.key === 'not_equals'),
);

const valueOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [];

  if (hasEquals.value || hasNotEquals.value) {
    options.push(
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    );
  }

  if (props.definition.nullable && hasEquals.value) {
    options.push({ value: 'null', label: 'Is null' });
  }

  if (props.definition.nullable && hasNotEquals.value) {
    options.push({ value: 'not_null', label: 'Is not null' });
  }

  return options;
});

const selectedChoice = computed(() => {
  const value = props.modelValue?.value;
  const comparator = props.modelValue?.comparator;

  if (value === null) {
    return comparator === 'not_equals' ? 'not_null' : 'null';
  }

  if (typeof value !== 'boolean') return '';
  return value ? 'true' : 'false';
});

const emitChoice = (comparator: string, value: FilterValue) => {
  emit('update:modelValue', {
    comparator,
    value,
    ...(value === null ? { active: true } : {}),
  });
};

const changeValue = (
  selected: string | number | boolean | (string | number | boolean)[],
) => {
  const choice = String(Array.isArray(selected) ? selected[0] : selected);

  if (choice === 'null' && hasEquals.value) {
    emitChoice('equals', null);
  } else if (choice === 'not_null' && hasNotEquals.value) {
    emitChoice('not_equals', null);
  } else if (choice === 'true') {
    if (hasEquals.value) {
      emitChoice('equals', true);
    } else {
      emitChoice('not_equals', false);
    }
  } else if (choice === 'false') {
    if (hasEquals.value) {
      emitChoice('equals', false);
    } else {
      emitChoice('not_equals', true);
    }
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
        :model-value="selectedChoice"
        :options="valueOptions"
        aria-label="Filter value"
        placeholder="Select a value"
        :compact="compact"
        @update:model-value="changeValue"
      />
    </div>
  </div>
</template>
