<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface SelectKeyOption {
  key: string;
  label: string;
  group?: string;
  disabled?: boolean;
  minValues?: number | null;
  maxValues?: number | null;
}

export type SelectItem =
  | SelectOption
  | SelectKeyOption
  | string
  | number;

export type CommonSelectProps = {
  modelValue?: string | number | boolean | (string | number | boolean)[] | null;
  options?: SelectItem[];
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  useIndexValue?: boolean;
  name?: string;
  id?: string;
};

const props = withDefaults(
  defineProps<CommonSelectProps>(),
  {
    modelValue: '',
    options: (): SelectItem[] => [],
    placeholder: 'Select...',
    ariaLabel: 'Select',
    disabled: false,
    compact: false,
    multiple: false,
    searchable: false,
    searchPlaceholder: 'Search options...',
    useIndexValue: false,
    name: undefined,
    id: undefined,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | (string | number | boolean)[]): void;
  (e: 'change', value: Event | string | number | boolean | (string | number | boolean)[]): void;
}>();

const isOpen = ref(false);
const highlightedIndex = ref(-1);
const searchQuery = ref('');
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const nativeSelectRef = ref<HTMLSelectElement | null>(null);
const placement = ref<'bottom' | 'top'>('bottom');

const modifiedOverflowMap = new Map<HTMLElement, string>();

const ensureParentOverflow = () => {
  if (!containerRef.value) return;
  let el: HTMLElement | null = containerRef.value.parentElement;
  while (el && el !== document.body) {
    if (el.classList.contains('zt-dropdown') || el.classList.contains('zonvoir-filter-popover')) {
      if (!modifiedOverflowMap.has(el)) {
        modifiedOverflowMap.set(el, el.style.overflow);
      }
      el.style.overflow = 'visible';
    }
    el = el.parentElement;
  }
};

const restoreParentOverflow = () => {
  modifiedOverflowMap.forEach((originalOverflow, el) => {
    el.style.overflow = originalOverflow;
  });
  modifiedOverflowMap.clear();
};

const updatePlacement = () => {
  if (!triggerRef.value || typeof window === 'undefined') return;
  const rect = triggerRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const dropdownHeight = dropdownRef.value?.offsetHeight || 180;
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    placement.value = 'top';
  } else {
    placement.value = 'bottom';
  }
};

let positionListenersAttached = false;
const handlePositionUpdate = () => {
  if (isOpen.value) {
    updatePlacement();
  }
};

const addPositionListeners = () => {
  if (positionListenersAttached || typeof window === 'undefined') return;
  positionListenersAttached = true;
  window.addEventListener('resize', handlePositionUpdate);
  window.addEventListener('scroll', handlePositionUpdate, true);
};

const removePositionListeners = () => {
  if (!positionListenersAttached || typeof window === 'undefined') return;
  positionListenersAttached = false;
  window.removeEventListener('resize', handlePositionUpdate);
  window.removeEventListener('scroll', handlePositionUpdate, true);
};

interface NormalizedOption {
  value: string | number | boolean;
  label: string;
  group?: string;
  disabled?: boolean;
}

const normalizedOptions = computed<NormalizedOption[]>(() => {
  if (!Array.isArray(props.options)) return [];
  return props.options.map((item: SelectItem) => {
    if (typeof item === 'object' && item !== null) {
      const val =
        'value' in item
          ? item.value
          : 'key' in item
            ? item.key
            : '';
      const label = item.label !== undefined ? String(item.label) : String(val);
      return {
        value: val,
        label,
        group: item.group,
        disabled: Boolean(item.disabled),
      };
    }
    return {
      value: item,
      label: String(item),
    };
  });
});

const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();
  if (!props.searchable || query === '') return normalizedOptions.value;

  return normalizedOptions.value.filter((option) =>
    option.label.toLocaleLowerCase().includes(query),
  );
});

const groupedOptions = computed(() => {
  const groups: { name?: string; options: NormalizedOption[] }[] = [];
  const groupMap = new Map<string, NormalizedOption[]>();
  const noGroup: NormalizedOption[] = [];

  for (const opt of filteredOptions.value) {
    if (opt.group) {
      if (!groupMap.has(opt.group)) {
        groupMap.set(opt.group, []);
      }
      groupMap.get(opt.group)!.push(opt);
    } else {
      noGroup.push(opt);
    }
  }

  if (noGroup.length > 0) {
    groups.push({ options: noGroup });
  }

  for (const [name, opts] of groupMap.entries()) {
    groups.push({ name, options: opts });
  }

  return groups;
});

const flatOptions = computed(() => filteredOptions.value);

const selectedValues = computed<string[]>(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map(String);
  }
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
    ? [String(props.modelValue)]
    : [];
});

const isSelected = (opt: NormalizedOption) => {
  return selectedValues.value.includes(String(opt.value));
};

const selectedOption = computed(() => {
  return normalizedOptions.value.find((opt) => isSelected(opt));
});

const displayLabel = computed(() => {
  if (props.multiple) {
    const selected = normalizedOptions.value.filter((opt) => isSelected(opt));
    if (selected.length === 0) {
      return props.placeholder || 'Select...';
    }
    if (selected.length <= 2) {
      return selected.map((o) => o.label).join(', ');
    }
    return `${selected.length} selected`;
  }

  return selectedOption.value ? selectedOption.value.label : (props.placeholder || 'Select...');
});

const toggleOpen = () => {
  if (props.disabled) return;
  if (isOpen.value) {
    close();
  } else {
    open();
  }
};

const open = () => {
  if (props.disabled) return;
  isOpen.value = true;
  const currentIndex = flatOptions.value.findIndex(
    (opt) => isSelected(opt),
  );
  highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0;
  ensureParentOverflow();
  updatePlacement();
  nextTick(() => {
    updatePlacement();
    if (props.searchable) {
      searchInputRef.value?.focus();
    } else {
      scrollToHighlighted();
    }
  });
  addPositionListeners();
};

const close = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
  searchQuery.value = '';
  restoreParentOverflow();
  removePositionListeners();
};

const selectOption = (opt: NormalizedOption) => {
  if (opt.disabled) return;

  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = current.findIndex((v) => String(v) === String(opt.value));

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(opt.value);
    }

    emit('update:modelValue', current);
    emit('change', current);

    if (nativeSelectRef.value) {
      Array.from(nativeSelectRef.value.options).forEach((nativeOpt, idx) => {
        const optVal = props.useIndexValue
          ? normalizedOptions.value[idx]?.value
          : nativeOpt.value;
        nativeOpt.selected = current.some((v) => String(v) === String(optVal));
      });
      nativeSelectRef.value.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else {
    close();
    emit('update:modelValue', opt.value);
    emit('change', String(opt.value));
    if (nativeSelectRef.value) {
      if (props.useIndexValue) {
        const idx = normalizedOptions.value.findIndex((o) => String(o.value) === String(opt.value));
        nativeSelectRef.value.value = idx >= 0 ? String(idx) : '';
      } else {
        nativeSelectRef.value.value = String(opt.value);
      }
      nativeSelectRef.value.dispatchEvent(new Event('change', { bubbles: true }));
    }
    triggerRef.value?.focus();
  }
};

const scrollToHighlighted = () => {
  if (!listboxRef.value) return;
  const activeEl = listboxRef.value.querySelector<HTMLElement>(
    `[data-option-index="${highlightedIndex.value}"]`,
  );
  if (activeEl && typeof activeEl.scrollIntoView === 'function') {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!isOpen.value) {
      open();
    } else {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      let nextIdx = highlightedIndex.value + step;
      if (nextIdx < 0) nextIdx = flatOptions.value.length - 1;
      if (nextIdx >= flatOptions.value.length) nextIdx = 0;
      highlightedIndex.value = nextIdx;
      scrollToHighlighted();
    }
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!isOpen.value) {
      open();
    } else if (highlightedIndex.value >= 0 && highlightedIndex.value < flatOptions.value.length) {
      const opt = flatOptions.value[highlightedIndex.value];
      if (opt && !opt.disabled) {
        selectOption(opt);
      }
    }
  } else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault();
    close();
  } else if (event.key === 'Tab' && isOpen.value) {
    close();
  }
};

const onSearchInput = () => {
  highlightedIndex.value = flatOptions.value.length > 0 ? 0 : -1;
};

const onSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (flatOptions.value.length === 0) return;
    const step = event.key === 'ArrowDown' ? 1 : -1;
    let nextIdx = highlightedIndex.value + step;
    if (nextIdx < 0) nextIdx = flatOptions.value.length - 1;
    if (nextIdx >= flatOptions.value.length) nextIdx = 0;
    highlightedIndex.value = nextIdx;
    scrollToHighlighted();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const option = flatOptions.value[highlightedIndex.value];
    if (option && !option.disabled) selectOption(option);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    close();
    triggerRef.value?.focus();
  } else if (event.key === 'Tab') {
    close();
  }
};

const onNativeSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (props.multiple) {
    const selected = Array.from(target.selectedOptions).map((o) => {
      if (props.useIndexValue) {
        const idx = Number(o.value);
        if (!isNaN(idx) && normalizedOptions.value[idx]) {
          return normalizedOptions.value[idx].value;
        }
      }
      const match = normalizedOptions.value.find((opt) => String(opt.value) === o.value);
      return match ? match.value : o.value;
    });
    emit('update:modelValue', selected);
    emit('change', selected);
  } else {
    const val = target.value;
    if (props.useIndexValue) {
      const idx = Number(val);
      if (!isNaN(idx) && normalizedOptions.value[idx]) {
        const resolved = normalizedOptions.value[idx].value;
        emit('update:modelValue', resolved);
        emit('change', resolved);
        return;
      }
    }
    const match = normalizedOptions.value.find((opt) => String(opt.value) === val);
    const resolvedVal = match ? match.value : val;
    emit('update:modelValue', resolvedVal);
    emit('change', resolvedVal);
  }
};

const handleDocumentClick = (event: MouseEvent | PointerEvent) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (
    containerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return;
  }
  close();
};

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentClick, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentClick, true);
  restoreParentOverflow();
  removePositionListeners();
});

defineExpose({
  open,
  close,
  focus: () => triggerRef.value?.focus(),
});
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'zonvoir-common-select relative w-full',
      isOpen ? 'z-50' : '',
    ]"
  >
    <!-- Visible Custom Select Trigger -->
    <div
      :id="id"
      ref="triggerRef"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
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
      <span
        :class="[
          'truncate font-medium',
          selectedValues.length > 0
            ? 'text-slate-900 dark:text-slate-100'
            : 'text-slate-400 dark:text-slate-500',
        ]"
      >
        {{ displayLabel }}
      </span>

      <span class="pointer-events-none ml-2 shrink-0 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>

    <!-- Custom Select Dropdown Popover -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      :enter-from-class="
        placement === 'top'
          ? 'transform opacity-0 scale-95 origin-bottom'
          : 'transform opacity-0 scale-95 origin-top'
      "
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      :leave-to-class="
        placement === 'top'
          ? 'transform opacity-0 scale-95 origin-bottom'
          : 'transform opacity-0 scale-95 origin-top'
      "
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :class="[
          'absolute left-0 z-50 w-full min-w-[140px] overflow-hidden rounded-xl border border-slate-200 bg-white text-xs shadow-xl ring-1 ring-slate-900/5 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:ring-white/10',
          placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
        ]"
      >
        <div v-if="searchable" class="border-b border-slate-100 p-1.5 dark:border-slate-800">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="search"
            :placeholder="searchPlaceholder"
            :aria-label="`Search ${ariaLabel.toLowerCase()}`"
            class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--zt-primary,#64748b)] focus:ring-2 focus:ring-[var(--zt-primary,#64748b)]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            @input="onSearchInput"
            @keydown="onSearchKeydown"
          />
        </div>
        <div
          ref="listboxRef"
          role="listbox"
          :aria-label="ariaLabel"
          class="max-h-60 overflow-auto p-1 [scrollbar-width:thin]"
        >
          <template v-for="(group, gIdx) in groupedOptions" :key="gIdx">
            <div
              v-if="group.name"
              class="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500"
            >
              {{ group.name }}
            </div>
            <div
              v-for="opt in group.options"
              :key="String(opt.value)"
              :data-option-index="flatOptions.findIndex((o) => String(o.value) === String(opt.value))"
              role="option"
              :aria-selected="isSelected(opt)"
              :class="[
                'relative flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors select-none',
                isSelected(opt)
                  ? 'bg-slate-50 text-slate-900 font-semibold dark:bg-slate-800/80 dark:text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
                flatOptions.findIndex((o) => String(o.value) === String(opt.value)) === highlightedIndex
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : '',
                opt.disabled ? 'cursor-not-allowed opacity-40' : '',
              ]"
              @click="selectOption(opt)"
              @mouseenter="highlightedIndex = flatOptions.findIndex((o) => String(o.value) === String(opt.value))"
            >
              <span class="truncate">{{ opt.label }}</span>
              <span v-if="isSelected(opt)" class="ml-2 flex shrink-0 items-center text-slate-900 dark:text-white">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </template>
          <div
            v-if="flatOptions.length === 0"
            role="status"
            class="px-2.5 py-3 text-center text-xs text-slate-400 dark:text-slate-500"
          >
            No options found
          </div>
        </div>
      </div>
    </Transition>

    <!-- Synchronized Native Select for test compatibility & assistive tech -->
    <select
      ref="nativeSelectRef"
      :aria-label="ariaLabel"
      :name="name"
      :disabled="disabled"
      :multiple="multiple"
      :value="multiple ? undefined : (useIndexValue ? (selectedValues[0] !== undefined ? String(normalizedOptions.findIndex(o => isSelected(o))) : '') : (modelValue ?? ''))"
      class="sr-only"
      @change="onNativeSelectChange"
    >
      <option
        v-for="(opt, idx) in normalizedOptions"
        :key="String(opt.value)"
        :value="useIndexValue ? String(idx) : opt.value"
        :selected="isSelected(opt)"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
