<script setup lang="ts">
import { computed } from 'vue';
import { useFilterField } from './useFilterField';
import CommonSelect from '../Common/CommonSelect.vue';
import CommonDatepicker from '../Common/CommonDatepicker.vue';
import CommonDateRangePicker from '../Common/CommonDateRangePicker.vue';
import type { FilterDefinition, FilterDraftState } from '../../composables/useTableFilters';

export type DateFilterProps = {
  definition: FilterDefinition;
  modelValue?: FilterDraftState;
  compact?: boolean;
};

const props = withDefaults(
  defineProps<DateFilterProps>(),
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
  count,
  nullable,
  isNull,
  canClear,
  isFieldActive,
  displayLabel,
  valueAt,
  update,
  changeComparator,
} = useFilterField(props, emit);

const isTimeEnabled = computed(
  () => props.definition.type === 'datetime' || Boolean(props.definition.enableTime),
);

const updateDatepickerValue = (val: string | Event, index: number) => {
  const strVal = typeof val === 'string' ? val : (val.target as HTMLInputElement).value;
  if (count.value > 1) {
    const values = Array.from({ length: count.value }, (_, i) => String(valueAt(i) ?? ''));
    values[index] = strVal;
    update(values);
  } else {
    update(strVal);
  }
};

const updateDateRangeValue = (val: [string, string] | Event) => {
  if (Array.isArray(val)) {
    update([val[0], val[1]]);
  }
};

const handlePresetSelect = (preset: { label: string; value: string | [string, string] }) => {
  if (Array.isArray(preset.value) && preset.value.length === 2) {
    const betweenComp = props.definition.comparators.find((c) => c.key === 'between');
    if (betweenComp) {
      emit('update:modelValue', {
        comparator: 'between',
        value: [preset.value[0], preset.value[1]],
      });
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
        <div class="flex flex-col gap-2">
          <CommonDateRangePicker
            v-if="count === 2"
            :model-value="[String(valueAt(0) ?? ''), String(valueAt(1) ?? '')]"
            :enable-time="isTimeEnabled"
            :time24h="definition.time24h"
            :presets="definition.presets"
            :min-date="definition.minDate"
            :max-date="definition.maxDate"
            :number-of-months="definition.numberOfMonths ?? 2"
            :show-week-numbers="definition.showWeekNumbers"
            :week-starts-on="definition.weekStartsOn"
            :clearable="definition.clearable ?? true"
            :compact="compact"
            aria-label-start="Filter value 1"
            aria-label-end="Filter value 2"
            placeholder="Select date range..."
            @update:model-value="updateDateRangeValue"
            @change="updateDateRangeValue"
            @preset-select="handlePresetSelect"
            @keydown.enter.stop="emit('enter')"
          />
          <template v-else>
            <CommonDatepicker
              v-for="(_, index) in count"
              :key="index"
              :model-value="String(valueAt(index) ?? '')"
              :enable-time="isTimeEnabled"
              :time24h="definition.time24h"
              :presets="definition.presets"
              :min-date="definition.minDate"
              :max-date="definition.maxDate"
              :number-of-months="definition.numberOfMonths"
              :show-week-numbers="definition.showWeekNumbers"
              :week-starts-on="definition.weekStartsOn"
              :clearable="definition.clearable ?? true"
              :compact="compact"
              :aria-label="count > 1 ? `Filter value ${index + 1}` : 'Filter value'"
              :placeholder="count > 1 ? (index === 0 ? 'From date...' : 'To date...') : `Filter ${definition.label.toLowerCase()}...`"
              @update:model-value="updateDatepickerValue($event, index)"
              @change="updateDatepickerValue($event, index)"
              @preset-select="handlePresetSelect"
              @keydown.enter.stop="emit('enter')"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
