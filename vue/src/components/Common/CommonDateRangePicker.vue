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

export type CommonDateRangePickerProps = {
  modelValue?: [string, string] | [string | null, string | null] | string[] | null;
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
  ariaLabelStart?: string;
  ariaLabelEnd?: string;
  disabled?: boolean;
  compact?: boolean;
  name?: string;
  id?: string;
  teleport?: boolean;
};

const props = withDefaults(
  defineProps<CommonDateRangePickerProps>(),
  {
    modelValue: (): [string, string] => ['', ''],
    enableTime: false,
    time24h: false,
    presets: undefined,
    minDate: undefined,
    maxDate: undefined,
    numberOfMonths: 2,
    showWeekNumbers: false,
    weekStartsOn: 0,
    clearable: true,
    placeholder: undefined,
    ariaLabel: 'Date range picker',
    ariaLabelStart: 'Filter value 1',
    ariaLabelEnd: 'Filter value 2',
    disabled: false,
    compact: false,
    name: undefined,
    id: undefined,
    teleport: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: [string, string]): void;
  (e: 'change', value: [string, string] | Event): void;
  (e: 'presetSelect', preset: { label: string; value: string | [string, string] }): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const nativeStartInputRef = ref<HTMLInputElement | null>(null);
const nativeEndInputRef = ref<HTMLInputElement | null>(null);

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
  defaultWidth: 530,
  defaultHeight: 330,
  onClose: () => {
    isOpen.value = false;
    isSelectingRange.value = false;
    hoverDate.value = '';
  },
});

const isEffectiveDark: ComputedRef<boolean> = computed((): boolean => Boolean(tableIsDark.value || isDark.value));
const effectiveDarkClass: ComputedRef<string> = computed((): string => darkClass.value || 'dark');

// Active viewing date for calendar navigation
const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth()); // 0-11

// Temporary selection state when picking ranges
const tempStartDate = ref<string>('');
const tempEndDate = ref<string>('');
const hoverDate = ref<string>('');
const isSelectingRange = ref(false);

// Time states for start and end
const startHour = ref(0);
const startMinute = ref(0);
const isStartAm = ref(true);

const endHour = ref(23);
const endMinute = ref(59);
const isEndAm = ref(false);

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const shortWeekdayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const orderedWeekdayLetters = computed(() => {
  const start = ((props.weekStartsOn % 7) + 7) % 7;
  const letters: string[] = [];
  for (let i = 0; i < 7; i++) {
    letters.push(shortWeekdayLetters[(start + i) % 7]);
  }
  return letters;
});

// Year options for dropdown: from minDate/1970 to maxDate/2050
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

// Helper to parse date string
interface ParsedDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateStr: string;
}

const parseDateString = (val?: string | null): ParsedDateTime | null => {
  if (!val) return null;
  const str = String(val).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10) - 1,
    day: parseInt(match[3], 10),
    hour: match[4] !== undefined ? parseInt(match[4], 10) : 0,
    minute: match[5] !== undefined ? parseInt(match[5], 10) : 0,
    dateStr: `${match[1]}-${match[2]}-${match[3]}`,
  };
};

const formatDateStr = (year: number, month: number, day: number): string => {
  const y = String(year).padStart(4, '0');
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const startDateModel = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue[0]) {
    return String(props.modelValue[0]).trim();
  }
  return '';
});

const endDateModel = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue[1]) {
    return String(props.modelValue[1]).trim();
  }
  return '';
});

const parsedStart = computed(() => parseDateString(startDateModel.value));
const parsedEnd = computed(() => parseDateString(endDateModel.value));

// Sync view and temp dates with modelValue changes
watch(
  () => props.modelValue,
  () => {
    if (parsedStart.value) {
      tempStartDate.value = parsedStart.value.dateStr;
      startHour.value = parsedStart.value.hour;
      startMinute.value = parsedStart.value.minute;
      isStartAm.value = parsedStart.value.hour < 12;
      viewYear.value = parsedStart.value.year;
      viewMonth.value = parsedStart.value.month;
    } else {
      tempStartDate.value = '';
    }

    if (parsedEnd.value) {
      tempEndDate.value = parsedEnd.value.dateStr;
      endHour.value = parsedEnd.value.hour;
      endMinute.value = parsedEnd.value.minute;
      isEndAm.value = parsedEnd.value.hour < 12;
    } else {
      tempEndDate.value = '';
    }
  },
  { immediate: true, deep: true },
);

const formatDisplayDate = (p: ParsedDateTime): string => {
  const monthName = monthNames[p.month];
  const datePart = `${monthName} ${p.day}, ${p.year}`;
  if (!props.enableTime) return datePart;

  if (props.time24h) {
    const hh = String(p.hour).padStart(2, '0');
    const mm = String(p.minute).padStart(2, '0');
    return `${datePart} ${hh}:${mm}`;
  }
  const h12 = p.hour % 12 || 12;
  const mm = String(p.minute).padStart(2, '0');
  const period = p.hour < 12 ? 'AM' : 'PM';
  return `${datePart} ${h12}:${mm} ${period}`;
};

// Display label in the trigger button
const displayLabel = computed(() => {
  if (parsedStart.value && parsedEnd.value) {
    return `${formatDisplayDate(parsedStart.value)} – ${formatDisplayDate(parsedEnd.value)}`;
  }
  if (parsedStart.value && !parsedEnd.value) {
    return `${formatDisplayDate(parsedStart.value)} – ...`;
  }
  return (
    props.placeholder ||
    (props.enableTime ? 'Select date and time range...' : 'Select date range...')
  );
});

// Has any active value
const hasValue = computed(() => Boolean(startDateModel.value || endDateModel.value));



// Calendar cell interface
interface DayCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
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

const buildMonthCalendar = (year: number, month: number): MonthCalendar => {
  const startDayOffset = ((props.weekStartsOn % 7) + 7) % 7;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const firstDayOfWeek = firstOfMonth.getDay();
  const leadingDays = (firstDayOfWeek - startDayOffset + 7) % 7;

  const cells: DayCell[] = [];

  // Previous month padding
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
      isToday: formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr,
      isDisabled: isDateDisabled(dateStr),
    });
  }

  // Next month padding to make 35 or 42 cells
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
      isToday: formatDateStr(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr,
      isDisabled: isDateDisabled(dateStr),
    });
  }

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

// Effective range boundaries for styling
const effectiveRange = computed(() => {
  if (isSelectingRange.value && tempStartDate.value) {
    const start = tempStartDate.value;
    const end = hoverDate.value || tempStartDate.value;
    return {
      start: start <= end ? start : end,
      end: start <= end ? end : start,
      isSelecting: true,
    };
  }
  return {
    start: tempStartDate.value || (parsedStart.value ? parsedStart.value.dateStr : ''),
    end: tempEndDate.value || (parsedEnd.value ? parsedEnd.value.dateStr : ''),
    isSelecting: false,
  };
});

const isDayStart = (dStr: string) => effectiveRange.value.start === dStr;
const isDayEnd = (dStr: string) => effectiveRange.value.end === dStr;
const isDayInRange = (dStr: string) => {
  const { start, end } = effectiveRange.value;
  if (!start || !end || start === end) return false;
  return dStr > start && dStr < end;
};

// Selection logic
const selectDay = (cell: DayCell) => {
  if (cell.isDisabled) return;
  const dStr = cell.dateString;

  if (!isSelectingRange.value || !tempStartDate.value) {
    // Step 1: select start date
    tempStartDate.value = dStr;
    tempEndDate.value = '';
    isSelectingRange.value = true;
  } else {
    // Step 2: select end date
    let start = tempStartDate.value;
    let end = dStr;
    if (end < start) {
      [start, end] = [end, start];
    }
    tempStartDate.value = start;
    tempEndDate.value = end;
    isSelectingRange.value = false;

    commitRange(start, end);

    if (!props.enableTime) {
      close();
    }
  }
};

const onDayMouseEnter = (cell: DayCell) => {
  if (isSelectingRange.value && !cell.isDisabled) {
    hoverDate.value = cell.dateString;
  }
};

const commitRange = (startStr: string, endStr: string) => {
  let finalStart = startStr;
  let finalEnd = endStr;

  if (props.enableTime) {
    const sH = String(startHour.value).padStart(2, '0');
    const sM = String(startMinute.value).padStart(2, '0');
    finalStart = `${startStr} ${sH}:${sM}:00`;

    const eH = String(endHour.value).padStart(2, '0');
    const eM = String(endMinute.value).padStart(2, '0');
    finalEnd = `${endStr} ${eH}:${eM}:00`;
  }

  emit('update:modelValue', [finalStart, finalEnd]);
  emit('change', [finalStart, finalEnd]);
};



const clearValue = (e?: Event) => {
  e?.stopPropagation();
  tempStartDate.value = '';
  tempEndDate.value = '';
  isSelectingRange.value = false;
  hoverDate.value = '';
  emit('update:modelValue', ['', '']);
  emit('change', ['', '']);
};

const open = () => {
  if (props.disabled) return;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  isSelectingRange.value = false;
  hoverDate.value = '';
};

const toggleOpen = () => {
  if (props.disabled) return;
  if (isOpen.value) {
    close();
  } else {
    open();
  }
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

// Native input synchronization for form submit and test compatibility
const nativeStartInputValue = computed(() => {
  if (!startDateModel.value) return '';
  return props.enableTime
    ? startDateModel.value.replace(' ', 'T').substring(0, 16)
    : startDateModel.value.substring(0, 10);
});

const nativeEndInputValue = computed(() => {
  if (!endDateModel.value) return '';
  return props.enableTime
    ? endDateModel.value.replace(' ', 'T').substring(0, 16)
    : endDateModel.value.substring(0, 10);
});

const onNativeStartChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  emit('update:modelValue', [val, endDateModel.value]);
  emit('change', [val, endDateModel.value]);
};

const onNativeEndChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  emit('update:modelValue', [startDateModel.value, val]);
  emit('change', [startDateModel.value, val]);
};

defineExpose({
  open,
  close,
  focus: () => triggerRef.value?.focus(),
});
</script>

<template>
  <div ref="containerRef" class="zonvoir-common-date-range-picker relative w-full select-none">
    <!-- Trigger Button -->
    <div
      :id="id"
      ref="triggerRef"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      :aria-disabled="disabled"
      :aria-label="ariaLabel"
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
            hasValue
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
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
          aria-label="Clear date range"
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

    <!-- Calendar Popover -->
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
        <!-- Calendar View(s) -->
        <div class="flex flex-col sm:flex-row gap-3.5">
            <div
              v-for="(cal, mIdx) in displayedMonths"
              :key="`${cal.year}-${cal.month}`"
              class="w-60 flex flex-col"
            >
              <!-- Calendar Navigation Header -->
              <div class="flex items-center justify-between mb-2.5 px-0.5">
                <!-- Left arrow (shown on first calendar) -->
                <button
                  type="button"
                  :class="[
                    'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer',
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

                <!-- Month & Year Selectors -->
                <div class="flex items-center gap-1.5">
                  <!-- Month Dropdown -->
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

                  <!-- Year Dropdown -->
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
                    'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer',
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

              <!-- Weekday Headers -->
              <div
                class="grid text-center font-medium text-[11px] text-slate-400 dark:text-slate-500 mb-1"
                :class="showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'"
              >
                <div v-if="showWeekNumbers" class="py-0.5">#</div>
                <div v-for="(dayLetter, wIdx) in orderedWeekdayLetters" :key="wIdx" class="py-0.5">
                  {{ dayLetter }}
                </div>
              </div>

              <!-- Days Grid -->
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
                  <div
                    v-for="cell in week.days"
                    :key="cell.dateString"
                    :class="[
                      'h-7 flex items-center justify-center relative p-0',
                      isDayInRange(cell.dateString)
                        ? 'bg-[var(--zt-primary-50,#f8fafc)] dark:bg-[var(--zt-primary-950,#020617)] text-[var(--zt-primary-900,#0f172a)] dark:text-[var(--zt-primary-200,#e2e8f0)]'
                        : '',
                      isDayStart(cell.dateString) && effectiveRange.end && effectiveRange.start !== effectiveRange.end
                        ? 'bg-gradient-to-r from-transparent to-[var(--zt-primary-50,#f8fafc)] dark:to-[var(--zt-primary-950,#020617)]'
                        : '',
                      isDayEnd(cell.dateString) && effectiveRange.start && effectiveRange.start !== effectiveRange.end
                        ? 'bg-gradient-to-l from-transparent to-[var(--zt-primary-50,#f8fafc)] dark:to-[var(--zt-primary-950,#020617)]'
                        : '',
                    ]"
                  >
                    <button
                      type="button"
                      :disabled="cell.isDisabled"
                      :class="[
                        'h-7 w-7 flex items-center justify-center text-xs font-medium transition-colors select-none cursor-pointer',
                        cell.isDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : '',
                        isDayStart(cell.dateString) || isDayEnd(cell.dateString)
                          ? 'bg-[var(--zt-primary,#0f172a)] text-[var(--zt-primary-foreground,#ffffff)] font-semibold rounded-md shadow-xs dark:bg-[var(--zt-primary,#f8fafc)] dark:text-[var(--zt-primary-foreground,#020617)]'
                          : isDayInRange(cell.dateString)
                            ? 'text-[var(--zt-primary-900,#0f172a)] dark:text-[var(--zt-primary-200,#e2e8f0)] font-semibold'
                            : cell.isCurrentMonth
                              ? 'text-slate-800 hover:bg-slate-100 rounded-md dark:text-slate-200 dark:hover:bg-slate-800/70'
                              : 'text-slate-400 hover:bg-slate-50 rounded-md dark:text-slate-600 dark:hover:bg-slate-800/40',
                        !isDayStart(cell.dateString) && !isDayEnd(cell.dateString) && cell.isToday
                          ? 'underline decoration-[var(--zt-primary,#64748b)] decoration-2 underline-offset-4 dark:decoration-[var(--zt-primary,#94a3b8)]'
                          : '',
                      ]"
                      @click="selectDay(cell)"
                      @mouseenter="onDayMouseEnter(cell)"
                    >
                      {{ cell.dayNumber }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <!-- Footer Actions -->
        <div class="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
            <span v-if="isSelectingRange">Click end date</span>
            <span v-else-if="effectiveRange.start && effectiveRange.end">Range selected</span>
            <span v-else>Click start date</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="clearable && hasValue"
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

    <!-- Synchronized Native Inputs for test compatibility & assistive tech -->
    <input
      ref="nativeStartInputRef"
      :type="enableTime ? 'datetime-local' : 'date'"
      :name="name ? `${name}_start` : undefined"
      :aria-label="ariaLabelStart"
      :disabled="disabled"
      :value="nativeStartInputValue"
      class="sr-only"
      tabindex="-1"
      @input="onNativeStartChange"
      @change="onNativeStartChange"
    />
    <input
      ref="nativeEndInputRef"
      :type="enableTime ? 'datetime-local' : 'date'"
      :name="name ? `${name}_end` : undefined"
      :aria-label="ariaLabelEnd"
      :disabled="disabled"
      :value="nativeEndInputValue"
      class="sr-only"
      tabindex="-1"
      @input="onNativeEndChange"
      @change="onNativeEndChange"
    />
  </div>
</template>
