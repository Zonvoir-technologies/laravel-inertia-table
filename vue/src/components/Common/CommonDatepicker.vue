<script setup lang="ts">
import { ref, computed, watch, type ComputedRef } from 'vue';
import { useFloatingPopover } from '../../composables/useFloatingPopover';
import { useTableConfiguration, useTableDarkMode } from '../../config/tableConfig';

export interface PresetItem {
  label: string;
  value: string | [string, string];
}

export type PresetInput =
  | PresetItem[]
  | Record<string, string | [string, string]>;

export type CommonDatepickerProps = {
  modelValue?: string | null;
  enableTime?: boolean;
  time24h?: boolean;
  presets?: PresetInput;
  minDate?: string;
  maxDate?: string;
  numberOfMonths?: number;
  showWeekNumbers?: boolean;
  weekStartsOn?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  clearable?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  name?: string;
  id?: string;
  teleport?: boolean;
};

const props = withDefaults(
  defineProps<CommonDatepickerProps>(),
  {
    modelValue: '',
    enableTime: false,
    time24h: false,
    presets: (): PresetInput => [],
    minDate: undefined,
    maxDate: undefined,
    numberOfMonths: 1,
    showWeekNumbers: false,
    weekStartsOn: 0,
    clearable: true,
    placeholder: undefined,
    ariaLabel: 'Date picker',
    disabled: false,
    compact: false,
    name: undefined,
    id: undefined,
    teleport: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string | Event): void;
  (e: 'presetSelect', preset: { label: string; value: string | [string, string] }): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const nativeInputRef = ref<HTMLInputElement | null>(null);

const tableConfig = useTableConfiguration();
const { isDark: tableIsDark, darkClass } = useTableDarkMode(tableConfig);

const {
  windowWidth,
  floatingStyle,
  isDark,
} = useFloatingPopover({
  triggerRef,
  popoverRef,
  containerRef,
  isOpen,
  defaultWidth: 280,
  defaultHeight: 330,
  onClose: () => {
    isOpen.value = false;
  },
});

const isEffectiveDark: ComputedRef<boolean> = computed((): boolean => Boolean(tableIsDark.value || isDark.value));
const effectiveDarkClass: ComputedRef<string> = computed((): string => darkClass.value || 'dark');

// Active viewing date for calendar navigation
const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth()); // 0-11

// Time state
const selectedHour = ref(now.getHours());
const selectedMinute = ref(now.getMinutes());
const isAm = ref(now.getHours() < 12);

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const shortWeekdayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Ordered weekday letters based on weekStartsOn
const orderedWeekdayLetters = computed(() => {
  const start = ((props.weekStartsOn % 7) + 7) % 7;
  const letters: string[] = [];
  for (let i = 0; i < 7; i++) {
    letters.push(shortWeekdayLetters[(start + i) % 7]);
  }
  return letters;
});

// Year options for dropdown: from minDate/1970 to maxDate/2100
const yearOptions = computed(() => {
  let startYear = 1970;
  let endYear = 2050;
  if (props.minDate) {
    const minY = parseInt(props.minDate.substring(0, 4), 10);
    if (!isNaN(minY)) startYear = Math.min(startYear, minY);
  }
  if (props.maxDate) {
    const maxY = parseInt(props.maxDate.substring(0, 4), 10);
    if (!isNaN(maxY)) endYear = Math.max(endYear, maxY);
  }
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
});

// Parse modelValue into date parts
const parsedDate = computed<{
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
} | null>(() => {
  if (!props.modelValue) return null;
  const str = String(props.modelValue).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hour = match[4] !== undefined ? parseInt(match[4], 10) : 0;
  const minute = match[5] !== undefined ? parseInt(match[5], 10) : 0;
  return {
    year,
    month,
    day,
    hour,
    minute,
    hasTime: match[4] !== undefined,
  };
});

// Sync view when modelValue changes
watch(
  () => props.modelValue,
  () => {
    if (parsedDate.value) {
      viewYear.value = parsedDate.value.year;
      viewMonth.value = parsedDate.value.month;
      selectedHour.value = parsedDate.value.hour;
      selectedMinute.value = parsedDate.value.minute;
      isAm.value = parsedDate.value.hour < 12;
    }
  },
  { immediate: true },
);

// Display label in the trigger button
const displayLabel = computed(() => {
  if (!parsedDate.value) {
    return props.placeholder || (props.enableTime ? 'Select date and time...' : 'Select date...');
  }
  const { year, month, day, hour, minute } = parsedDate.value;
  const monthName = monthNames[month];
  const datePart = `${monthName} ${day}, ${year}`;
  if (!props.enableTime) {
    return datePart;
  }
  if (props.time24h) {
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${datePart} ${hh}:${mm}`;
  }
  const h12 = hour % 12 || 12;
  const mm = String(minute).padStart(2, '0');
  const period = hour < 12 ? 'AM' : 'PM';
  return `${datePart} ${h12}:${mm} ${period}`;
});

// Value for hidden native input
const nativeInputValue = computed(() => {
  if (!props.modelValue) return '';
  if (!props.enableTime) {
    return props.modelValue.substring(0, 10);
  }
  if (parsedDate.value) {
    const { year, month, day, hour, minute } = parsedDate.value;
    const y = String(year).padStart(4, '0');
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }
  return props.modelValue;
});

// Normalized presets
const normalizedPresets = computed<PresetItem[]>(() => {
  if (!props.presets) return [];
  if (Array.isArray(props.presets)) {
    return props.presets;
  }
  return Object.entries(props.presets).map(([label, value]) => ({
    label,
    value,
  }));
});

// Calendar matrix builder for a given year & month
interface DayCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

interface MonthCalendar {
  year: number;
  month: number;
  monthName: string;
  weeks: {
    weekNumber: number;
    days: DayCell[];
  }[];
}

const getIsoWeekNumber = (date: Date): number => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

const isDateDisabled = (dateStr: string): boolean => {
  if (props.minDate && dateStr < props.minDate.substring(0, 10)) return true;
  if (props.maxDate && dateStr > props.maxDate.substring(0, 10)) return true;
  return false;
};

const formatDateStr = (year: number, month: number, day: number): string => {
  const y = String(year).padStart(4, '0');
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildMonthCalendar = (year: number, month: number): MonthCalendar => {
  const startDayOffset = ((props.weekStartsOn % 7) + 7) % 7;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Day of week of 1st day (0 = Sunday..6)
  const firstDayOfWeek = firstOfMonth.getDay();
  const leadingDays = ((firstDayOfWeek - startDayOffset + 7) % 7);

  const cells: DayCell[] = [];

  // Previous month padding days
  for (let i = leadingDays - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = formatDateStr(prevYear, prevMonth, day);
    const date = new Date(prevYear, prevMonth, day);
    cells.push({
      date,
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isSelected: parsedDate.value ? formatDateStr(parsedDate.value.year, parsedDate.value.month, parsedDate.value.day) === dateStr : false,
      isToday: formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr,
      isDisabled: isDateDisabled(dateStr),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(year, month, day);
    const date = new Date(year, month, day);
    cells.push({
      date,
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isSelected: parsedDate.value ? formatDateStr(parsedDate.value.year, parsedDate.value.month, parsedDate.value.day) === dateStr : false,
      isToday: formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr,
      isDisabled: isDateDisabled(dateStr),
    });
  }

  // Next month padding days to make 35 or 42 cells
  const totalSlots = cells.length > 35 ? 42 : 35;
  const remaining = totalSlots - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = formatDateStr(nextYear, nextMonth, day);
    const date = new Date(nextYear, nextMonth, day);
    cells.push({
      date,
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isSelected: parsedDate.value ? formatDateStr(parsedDate.value.year, parsedDate.value.month, parsedDate.value.day) === dateStr : false,
      isToday: formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr,
      isDisabled: isDateDisabled(dateStr),
    });
  }

  // Split into weeks of 7
  const weeks: MonthCalendar['weeks'] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const weekDays = cells.slice(i, i + 7);
    weeks.push({
      weekNumber: getIsoWeekNumber(weekDays[0].date),
      days: weekDays,
    });
  }

  return {
    year,
    month,
    monthName: monthNames[month],
    weeks,
  };
};

const displayedMonths = computed<MonthCalendar[]>(() => {
  const months: MonthCalendar[] = [];
  const maxAllowed = windowWidth.value < 580 ? 1 : props.numberOfMonths;
  const count = Math.max(1, maxAllowed);
  for (let i = 0; i < count; i++) {
    let m = viewMonth.value + i;
    let y = viewYear.value;
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    months.push(buildMonthCalendar(y, m));
  }
  return months;
});

// Month navigation
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
};

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
};

// Select Day
const selectDay = (cell: DayCell) => {
  if (cell.isDisabled) return;
  const dStr = cell.dateString;
  let finalVal = dStr;

  if (props.enableTime) {
    const h = String(selectedHour.value).padStart(2, '0');
    const m = String(selectedMinute.value).padStart(2, '0');
    finalVal = `${dStr} ${h}:${m}:00`;
  }

  emit('update:modelValue', finalVal);
  emit('change', finalVal);

  if (!props.enableTime) {
    close();
  }
};

// Time selection helpers
const displayHour12 = computed({
  get: () => {
    const h = selectedHour.value % 12;
    return h === 0 ? 12 : h;
  },
  set: (val: number | string) => {
    const num = Math.max(1, Math.min(12, parseInt(String(val), 10) || 12));
    if (isAm.value) {
      selectedHour.value = num === 12 ? 0 : num;
    } else {
      selectedHour.value = num === 12 ? 12 : num + 12;
    }
    updateTimeInModel();
  },
});

const displayHour24 = computed({
  get: () => selectedHour.value,
  set: (val: number | string) => {
    const num = Math.max(0, Math.min(23, parseInt(String(val), 10) || 0));
    selectedHour.value = num;
    updateTimeInModel();
  },
});

const displayMinute = computed({
  get: () => selectedMinute.value,
  set: (val: number | string) => {
    const num = Math.max(0, Math.min(59, parseInt(String(val), 10) || 0));
    selectedMinute.value = num;
    updateTimeInModel();
  },
});

const toggleAmPm = () => {
  if (isAm.value) {
    isAm.value = false;
    if (selectedHour.value < 12) selectedHour.value += 12;
  } else {
    isAm.value = true;
    if (selectedHour.value >= 12) selectedHour.value -= 12;
  }
  updateTimeInModel();
};

const updateTimeInModel = () => {
  const curDate = parsedDate.value
    ? formatDateStr(parsedDate.value.year, parsedDate.value.month, parsedDate.value.day)
    : formatDateStr(viewYear.value, viewMonth.value, now.getDate());

  const h = String(selectedHour.value).padStart(2, '0');
  const m = String(selectedMinute.value).padStart(2, '0');
  const finalVal = `${curDate} ${h}:${m}:00`;
  emit('update:modelValue', finalVal);
  emit('change', finalVal);
};

const selectNow = () => {
  const current = new Date();
  const dStr = formatDateStr(current.getFullYear(), current.getMonth(), current.getDate());
  selectedHour.value = current.getHours();
  selectedMinute.value = current.getMinutes();
  isAm.value = current.getHours() < 12;

  let val = dStr;
  if (props.enableTime) {
    const h = String(current.getHours()).padStart(2, '0');
    const m = String(current.getMinutes()).padStart(2, '0');
    val = `${dStr} ${h}:${m}:00`;
  }
  emit('update:modelValue', val);
  emit('change', val);
  if (!props.enableTime) {
    close();
  }
};

const selectPreset = (preset: PresetItem) => {
  emit('presetSelect', preset);
  if (typeof preset.value === 'string') {
    emit('update:modelValue', preset.value);
    emit('change', preset.value);
    close();
  } else if (Array.isArray(preset.value) && preset.value.length > 0) {
    emit('update:modelValue', preset.value[0]);
    emit('change', preset.value[0]);
    close();
  }
};

const clearValue = (e?: Event) => {
  e?.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
};

const open = () => {
  if (props.disabled) return;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleOpen();
  }
};

// Native input synchronization
const onNativeInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  emit('update:modelValue', val);
  emit('change', event);
};

defineExpose({
  open,
  close,
  focus: () => triggerRef.value?.focus(),
});
</script>

<template>
  <div ref="containerRef" class="zonvoir-common-datepicker relative w-full select-none">
    <!-- Trigger Button (styled consistently with CommonSelect) -->
    <div
      :id="id"
      ref="triggerRef"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      :aria-disabled="disabled"
      :class="[
        'w-full min-w-0 flex items-center justify-between rounded-lg border text-xs shadow-xs transition-colors cursor-pointer select-none text-left focus:outline-none',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
        isOpen
          ? 'border-[var(--zt-primary,#64748b)] ring-2 ring-[var(--zt-primary,#64748b)]/20 dark:border-[var(--zt-primary,#94a3b8)] dark:ring-[var(--zt-primary,#94a3b8)]/20'
          : 'border-slate-200 bg-white hover:border-slate-300 focus:border-[var(--zt-primary,#64748b)] focus:ring-2 focus:ring-[var(--zt-primary,#64748b)]/20 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:focus:border-[var(--zt-primary,#94a3b8)] dark:focus:ring-2 dark:focus:ring-[var(--zt-primary,#94a3b8)]/20',
        disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : '',
      ]"
      @click="toggleOpen"
      @keydown="onTriggerKeydown"
    >
      <div class="flex items-center gap-2 truncate">
        <!-- Calendar icon -->
        <svg
          class="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
            clip-rule="evenodd"
          />
        </svg>

        <span
          :class="[
            'truncate font-medium',
            modelValue
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500',
          ]"
        >
          {{ displayLabel }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0 ml-2">
        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
          aria-label="Clear date"
          @click.stop="clearValue"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>

        <!-- Chevron -->
        <span
          class="pointer-events-none text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- Calendar Popover (Matches Reference Image) -->
    <Teleport to="body" :disabled="!teleport">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="popoverRef"
          data-floating-popover="true"
          :data-dark-mode="isEffectiveDark ? 'enabled' : undefined"
          :style="teleport ? floatingStyle : undefined"
          :class="[
            'zonvoir-datepicker-popover rounded-xl border p-3 shadow-2xl focus:outline-none select-none',
            isEffectiveDark
              ? ['border-slate-800 bg-slate-900 text-slate-100 ring-1 ring-white/10 dark', effectiveDarkClass]
              : 'border-slate-200 bg-white text-slate-800 ring-1 ring-slate-900/10',
            teleport ? 'fixed' : 'absolute left-0 top-full z-50 mt-1 max-w-[calc(100vw-2rem)]',
          ]"
        >
        <div class="flex flex-col md:flex-row gap-3">
          <!-- Presets Sidebar (if presets exist) -->
          <div
            v-if="normalizedPresets.length > 0"
            class="flex flex-row md:flex-col gap-1 pb-2 md:pb-0 md:pr-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 shrink-0 overflow-x-auto"
          >
            <div class="hidden md:block px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Presets
            </div>
            <button
              v-for="preset in normalizedPresets"
              :key="preset.label"
              type="button"
              class="rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors whitespace-nowrap"
              @click="selectPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Calendar View(s) -->
          <div class="flex flex-col sm:flex-row gap-3.5">
            <div
              v-for="(cal, mIdx) in displayedMonths"
              :key="`${cal.year}-${cal.month}`"
              class="w-60 flex flex-col"
            >
              <!-- Calendar Navigation Header (Matches Image: <  Sep ˅  2026 ˅  > ) -->
              <div class="flex items-center justify-center gap-1.5 mb-2.5">
                <!-- Left arrow (shown on first calendar) -->
                <button
                  type="button"
                  :class="[
                    'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0',
                    mIdx > 0 ? 'invisible pointer-events-none' : '',
                  ]"
                  aria-label="Previous month"
                  @click="prevMonth"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <!-- Month & Year Selectors with down chevrons -->
                <div class="flex items-center gap-1.5">
                  <!-- Month Dropdown (Sep ˅) -->
                  <div class="relative inline-flex items-center">
                    <select
                      :value="cal.month"
                      class="h-7 appearance-none rounded-md border border-slate-200 bg-white pl-2.5 pr-6 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[var(--zt-primary,#64748b)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:focus:ring-[var(--zt-primary,#94a3b8)] cursor-pointer"
                      @change="viewMonth = parseInt(($event.target as HTMLSelectElement).value, 10)"
                    >
                      <option v-for="(name, idx) in monthNames" :key="idx" :value="idx">
                        {{ name }}
                      </option>
                    </select>
                    <svg
                      class="pointer-events-none absolute right-1.5 z-10 h-3.5 w-3.5 text-slate-400 dark:text-slate-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>

                  <!-- Year Dropdown (2026 ˅) -->
                  <div class="relative inline-flex items-center">
                    <select
                      :value="cal.year"
                      class="h-7 appearance-none rounded-md border border-slate-200 bg-white pl-2.5 pr-6 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[var(--zt-primary,#64748b)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:focus:ring-[var(--zt-primary,#94a3b8)] cursor-pointer"
                      @change="viewYear = parseInt(($event.target as HTMLSelectElement).value, 10)"
                    >
                      <option v-for="yr in yearOptions" :key="yr" :value="yr">
                        {{ yr }}
                      </option>
                    </select>
                    <svg
                      class="pointer-events-none absolute right-1.5 z-10 h-3.5 w-3.5 text-slate-400 dark:text-slate-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Right arrow (shown on last calendar) -->
                <button
                  type="button"
                  :class="[
                    'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0',
                    mIdx < displayedMonths.length - 1 ? 'invisible pointer-events-none' : '',
                  ]"
                  aria-label="Next month"
                  @click="nextMonth"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <!-- Weekday Headers (S M T W T F S) -->
              <div
                class="grid text-center font-medium text-[11px] text-slate-400 dark:text-slate-500 mb-1"
                :class="showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'"
              >
                <div v-if="showWeekNumbers" class="py-0.5">#</div>
                <div v-for="(dayLetter, wIdx) in orderedWeekdayLetters" :key="wIdx" class="py-0.5">
                  {{ dayLetter }}
                </div>
              </div>

              <!-- Days Grid (Weeks & Days) -->
              <div class="flex flex-col gap-1">
                <div
                  v-for="(week, wkIdx) in cal.weeks"
                  :key="wkIdx"
                  class="grid items-center"
                  :class="showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'"
                >
                  <!-- Optional Week Number Column -->
                  <div
                    v-if="showWeekNumbers"
                    class="h-7 flex items-center justify-center text-[10px] font-mono text-slate-400 dark:text-slate-500"
                  >
                    {{ week.weekNumber }}
                  </div>

                  <!-- 7 Day Cells -->
                  <button
                    v-for="cell in week.days"
                    :key="cell.dateString"
                    type="button"
                    :disabled="cell.isDisabled"
                    :class="[
                      'h-7 w-7 mx-auto flex items-center justify-center rounded-md text-xs font-medium transition-colors select-none',
                      cell.isDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
                      cell.isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold ring-1 ring-slate-300 dark:bg-slate-800 dark:text-white dark:ring-slate-600'
                        : cell.isCurrentMonth
                          ? 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70'
                          : 'text-slate-400 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800/40',
                      !cell.isSelected && cell.isToday
                        ? 'underline decoration-[var(--zt-primary,#64748b)] decoration-2 underline-offset-4 dark:decoration-[var(--zt-primary,#94a3b8)]'
                        : '',
                    ]"
                    @click="selectDay(cell)"
                  >
                    {{ cell.dayNumber }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Picker Section (when enableTime is true) -->
        <div
          v-if="enableTime"
          class="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
        >
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <!-- Clock icon -->
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium text-[11px] uppercase tracking-wider">Time</span>
          </div>

          <!-- Time Inputs: Hours, Minutes, AM/PM -->
          <div class="flex items-center gap-1">
            <!-- Hour Input -->
            <input
              v-if="time24h"
              v-model.number="displayHour24"
              type="number"
              min="0"
              max="23"
              class="w-10 h-7 rounded-md border border-slate-200 bg-white text-center font-mono text-xs font-semibold text-slate-800 focus:border-[var(--zt-primary,#64748b)] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[var(--zt-primary,#94a3b8)]"
            />
            <input
              v-else
              v-model.number="displayHour12"
              type="number"
              min="1"
              max="12"
              class="w-10 h-7 rounded-md border border-slate-200 bg-white text-center font-mono text-xs font-semibold text-slate-800 focus:border-[var(--zt-primary,#64748b)] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[var(--zt-primary,#94a3b8)]"
            />

            <span class="font-bold text-slate-400">:</span>

            <!-- Minute Input -->
            <input
              v-model.number="displayMinute"
              type="number"
              min="0"
              max="59"
              class="w-10 h-7 rounded-md border border-slate-200 bg-white text-center font-mono text-xs font-semibold text-slate-800 focus:border-[var(--zt-primary,#64748b)] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-[var(--zt-primary,#94a3b8)]"
            />

            <!-- AM / PM Toggle (if 12h) -->
            <button
              v-if="!time24h"
              type="button"
              class="ml-1 h-7 px-2 flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-semibold text-[11px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="toggleAmPm"
            >
              {{ isAm ? 'AM' : 'PM' }}
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            class="text-xs font-medium text-slate-500 hover:text-[var(--zt-primary,#0f172a)] dark:text-slate-400 dark:hover:text-[var(--zt-primary,#f8fafc)] transition-colors cursor-pointer"
            @click="selectNow"
          >
            {{ enableTime ? 'Now' : 'Today' }}
          </button>

          <div class="flex items-center gap-2">
            <button
              v-if="clearable && modelValue"
              type="button"
              class="text-xs font-medium text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              @click="clearValue"
            >
              Clear
            </button>
            <button
              type="button"
              class="rounded-md bg-[var(--zt-primary,#0f172a)] px-3 py-1 text-xs font-medium text-[var(--zt-primary-foreground,#ffffff)] shadow-xs hover:opacity-90 focus:outline-none transition-colors cursor-pointer dark:bg-[var(--zt-primary,#f8fafc)] dark:text-[var(--zt-primary-foreground,#020617)]"
              @click="close"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- Synchronized Native Input for test compatibility & assistive tech -->
    <input
      ref="nativeInputRef"
      :type="enableTime ? 'datetime-local' : 'date'"
      :name="name"
      :aria-label="ariaLabel"
      :disabled="disabled"
      :value="nativeInputValue"
      class="sr-only"
      tabindex="-1"
      @input="onNativeInputChange"
      @change="onNativeInputChange"
    />
  </div>
</template>
