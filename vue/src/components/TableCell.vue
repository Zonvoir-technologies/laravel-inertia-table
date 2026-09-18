<script setup lang="ts">
import { computed, type ComputedRef, type CSSProperties } from 'vue';
import { visitUrl } from '../helpers/visitUrl';
import type { TableCellValue, TableColumn, TableRow, TableUrl, TableUrlValue } from '../types/table';
import { twMerge } from 'tailwind-merge';
import { useTableConfiguration } from '../config/tableConfig';

type TableCellProps = {
  as?: 'td' | 'th';
  column: TableColumn;
  row?: TableRow;
  value?: TableCellValue;
  stickyOffset?: number;
  stickySide?: 'left' | 'right';
  clickable?: boolean;
  autoVisit?: boolean;
  hasClickListener?: boolean;
}

type CellClickPayload = { row: TableRow; column: TableColumn; value: TableCellValue; event: MouseEvent };

const tableConfig = useTableConfiguration();
const props = withDefaults(
  defineProps<TableCellProps>(),
  {
    as: 'td',
    row: undefined,
    value: undefined,
    stickyOffset: undefined,
    stickySide: 'left',
    clickable: false,
    autoVisit: true,
    hasClickListener: false,
  }
);

const emit = defineEmits<{
  click: [payload: CellClickPayload];
}>();

const alignmentClasses: Record<string, string> = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};

const isSticky: ComputedRef<boolean> = computed((): boolean =>
  Boolean(props.column.sticky ?? props.column.meta.defaultToSticky)
);

const columnUrl: ComputedRef<TableUrlValue> = computed((): TableUrlValue => {
  if (!props.row || !props.row._column_urls) {
    return null;
  }

  return props.row._column_urls[props.column.attribute] ?? null;
});

const cellValue: ComputedRef<TableCellValue> = computed((): TableCellValue => {
  if (props.value !== undefined) {
    return props.value;
  }

  return (props.row?.[props.column.attribute] ?? '') as TableCellValue;
});
const normalizedUrl: ComputedRef<TableUrl | null> = computed((): TableUrl | null => {
  const value: TableUrlValue = columnUrl.value;

  if (!value) {
    return null;
  }

  return typeof value === 'string' ? { url: value, target: null } : value;
});

const isLinked: ComputedRef<boolean> = computed((): boolean => Boolean(normalizedUrl.value?.url));

const cssSize = (value: string | number | null | undefined): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
};

const emitClick = (event: MouseEvent): void => {
  if (!props.row) {
    return;
  }

  emit('click', {
    row: props.row,
    column: props.column,
    value: cellValue.value,
    event,
  });
};

const handleCellClick = (event: MouseEvent): void => {
  emitClick(event);
};

const handleLinkClick = (event: MouseEvent): void => {
  emitClick(event);

  const link: TableUrl | null = normalizedUrl.value;

  if (!link?.url || link.target || !props.autoVisit || props.hasClickListener || event.defaultPrevented) {
    return;
  }

  event.preventDefault();
  visitUrl(link.url, {
    preserveScroll: link.preserveScroll ?? false,
    preserveState: link.preserveState ?? false
  });
};

const cellClasses: ComputedRef<string> = computed((): string =>
  twMerge([
    props.as === 'th' ? tableConfig.value.classes.headerCell : tableConfig.value.classes.bodyCell,
    alignmentClasses[props.column.alignment] ?? alignmentClasses.left,
    isSticky.value ? `${tableConfig.value.classes.stickyCell} ${props.as === 'th' ? 'z-40' : 'z-10'}` : '',
    props.clickable || isLinked.value ? 'cursor-pointer' : '',
    props.as === 'td' ? props.column.cellClass : props.column.headerClass,
  ].filter(Boolean).join(' '))
);

const cellStyle: ComputedRef<CSSProperties> = computed((): CSSProperties => {
  const width: string | number | null | undefined = props.column.width;
  const minWidth: string | number | null | undefined = props.column.minWidth ?? width;
  const maxWidth: string | number | null | undefined = props.column.maxWidth;

  return {
    left: isSticky.value && props.stickySide === 'left' ? `${props.stickyOffset ?? 0}px` : undefined,
    right: isSticky.value && props.stickySide === 'right' ? `${props.stickyOffset ?? 0}px` : undefined,
    width: cssSize(width),
    minWidth: cssSize(minWidth),
    maxWidth: cssSize(maxWidth),
  };
});
</script>

<template>
  <component
    :is="as"
    :class="cellClasses"
    :style="cellStyle"
    :data-column="column.attribute"
    @click="handleCellClick"
  >
    <a
      v-if="isLinked && normalizedUrl?.url"
      :href="normalizedUrl.url"
      :target="normalizedUrl.target ?? undefined"
      :rel="normalizedUrl.target === '_blank' ? 'noopener noreferrer' : undefined"
      :class="tableConfig.classes.cellLink"
      @click.stop="handleLinkClick"
    >
      <slot>
        {{ cellValue }}
      </slot>
    </a>
    <slot v-else>
      {{ cellValue }}
    </slot>
  </component>
</template>
