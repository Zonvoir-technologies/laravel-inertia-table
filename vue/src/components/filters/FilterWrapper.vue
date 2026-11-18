<script setup lang="ts">
import { computed } from 'vue';
import CommonSelect from '../Common/CommonSelect.vue';
import type {
  FilterDefinition,
  FilterDraftState,
  FilterScalarValue,
  FilterValue,
} from '../../composables/useTableFilters';

export type FilterWrapperProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<FilterWrapperProps>(),
  {
    modelValue: undefined,
    compact: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterDraftState | null): void;
  (e: 'enter'): void;
}>();

const comparator = computed(
  () =>
    props.modelValue?.comparator ??
    props.definition.default?.comparator ??
    props.definition.comparators[0]?.key ??
    '',
);

const metadata = computed(() =>
  props.definition.comparators.find((c) => c.key === comparator.value),
);

const multiple = computed(() => metadata.value?.maxValues === null);
const count = computed(() => metadata.value?.maxValues ?? 1);
const nullable = computed(
  () => props.definition.nullable && ['equals', 'not_equals'].includes(comparator.value),
);
const isNull = computed(() => props.modelValue?.value === null);

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs transition-colors focus:border-[var(--zt-primary,#64748b)] focus:outline-none focus:ring-2 focus:ring-[var(--zt-primary,#64748b)]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-[var(--zt-primary,#94a3b8)] dark:focus:ring-2 dark:focus:ring-[var(--zt-primary,#94a3b8)]/20';

const canClear = computed(
  () => props.modelValue && (props.modelValue.active || props.modelValue.value !== ''),
);

const isFieldActive = computed(() =>
  Boolean(
    props.modelValue &&
      (props.modelValue.active ||
        (props.modelValue.value !== '' && props.modelValue.value !== null)),
  ),
);

function humanizeLabel(label: string): string {
  if (!label) return '';
  if (
    label.includes(' ') &&
    !label.includes('.') &&
    !label.includes('_') &&
    label !== label.toUpperCase()
  ) {
    return label;
  }
  return label
    .split('.')
    .map((segment) => segment.replace(/[_-]/g, ' ').trim())
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

const displayLabel = computed(() => humanizeLabel(props.definition.label));

const valueAt = (index: number): FilterScalarValue => {
  const value = props.modelValue?.value;
  return Array.isArray(value) ? (value[index] ?? '') : (value ?? '');
};

const update = (value: FilterValue) =>
  emit('update:modelValue', {
    comparator: comparator.value,
    value,
    ...(value === null ? { active: true } : {}),
  });

const changeComparator = (eventOrKey: Event | string | number | boolean | (string | number | boolean)[]) => {
  const key =
    typeof eventOrKey === 'string'
      ? eventOrKey
      : typeof eventOrKey === 'number' || typeof eventOrKey === 'boolean'
        ? String(eventOrKey)
        : Array.isArray(eventOrKey)
          ? String(eventOrKey[0])
          : ((eventOrKey as Event).target as HTMLSelectElement).value;
  const next = props.definition.comparators.find((c) => c.key === key);
  const previous = metadata.value;
  const sameShape =
    (previous?.maxValues ?? 1) === (next?.maxValues ?? 1) &&
    (previous?.maxValues === null) === (next?.maxValues === null);
  let value: FilterValue = sameShape
    ? (props.modelValue?.value ?? '')
    : next?.maxValues === null
      ? []
      : (next?.maxValues ?? 1) > 1
        ? Array(next?.maxValues).fill('')
        : '';
  if (props.modelValue?.value === null && nullable.value && ['equals', 'not_equals'].includes(key)) {
    value = null;
  }
  emit('update:modelValue', {
    comparator: key,
    value,
    ...(value === null ? { active: true } : {}),
  });
};

const updateInput = (event: Event, index: number) => {
  const val = (event.target as HTMLInputElement).value;
  if (count.value > 1) {
    const values = Array.from({ length: count.value }, (_, i) => valueAt(i));
    values[index] = val;
    update(values);
  } else {
    update(val);
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
        <slot
          :is-null="isNull"
          :comparator="comparator"
          :metadata="metadata"
          :multiple="multiple"
          :count="count"
          :value-at="valueAt"
          :update="update"
          :update-input="updateInput"
          :input-class="inputClass"
          :definition="definition"
          :model-value="modelValue"
          :compact="compact"
        />
      </template>
    </div>
  </div>
</template>
