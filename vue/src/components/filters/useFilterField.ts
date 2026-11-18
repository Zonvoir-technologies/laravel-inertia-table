import { computed } from 'vue';
import type {
  FilterDefinition,
  FilterDraftState,
  FilterScalarValue,
  FilterValue,
} from '../../composables/useTableFilters';

export function useFilterField(
  props: {
    definition: FilterDefinition;
    modelValue?: FilterDraftState;
    compact?: boolean;
  },
  emit: {
    (e: 'update:modelValue', value: FilterDraftState | null): void;
    (e: 'enter'): void;
  },
) {
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

  const multiple = computed(
    () => Boolean(props.definition.multiple) || metadata.value?.maxValues === null,
  );
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
    if (
      props.modelValue?.value === null &&
      nullable.value &&
      ['equals', 'not_equals'].includes(key)
    ) {
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

  return {
    comparator,
    metadata,
    multiple,
    count,
    nullable,
    isNull,
    inputClass,
    canClear,
    isFieldActive,
    displayLabel,
    valueAt,
    update,
    changeComparator,
    updateInput,
  };
}
