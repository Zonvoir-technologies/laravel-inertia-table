<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import RowsPerPageSelect from './RowsPerPageSelect.vue';
import type { TablePagination, PaginatorLink, TableRowKey } from '../types/table';
import CommonIcon from './Common/CommonIcon.vue';
import { useTableConfiguration, type TableIcon } from '../config/tableConfig';

type TablePaginationProps = {
  pagination: TablePagination;
  selectable: boolean;
  selectedRows: Set<TableRowKey>;
}

type PaginationButtonLink = {
  icon: TableIcon;
  label: string;
  url: string | null;
  active: boolean;
}

const props = withDefaults(
  defineProps<TablePaginationProps>(),
  {
    selectable: true,
  }
);
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  'per-page-change': [value: number];
  'page-click': [url: string | null];
}>();

const pageLabel: ComputedRef<string> = computed((): string => {
  const currentPagination: TablePagination = props.pagination;

  if (!currentPagination.enabled) {
    return '';
  }

  return tableConfig.value.labels.page(currentPagination.currentPage, currentPagination.lastPage);
});

const paginationLinks: ComputedRef<PaginationButtonLink[]> = computed((): PaginationButtonLink[] => {
  const currentPagination: TablePagination = props.pagination;
  const onFirstPage: boolean = currentPagination.currentPage <= 1;
  const onLastPage: boolean = Boolean(
    currentPagination.lastPage && currentPagination.currentPage >= currentPagination.lastPage
  );

  const numberedLinks: PaginatorLink[] = currentPagination.links.filter((link: PaginatorLink): boolean => typeof link.page === 'number');
  const firstPageUrl: string | null = currentPagination.firstPageUrl ?? numberedLinks.at(0)?.url ?? null;
  const lastPageUrl: string | null =
    currentPagination.lastPageUrl ?? numberedLinks.at(numberedLinks.length - 1)?.url ?? null;

  return [
    { icon: 'firstPage', label: '&laquo;', url: onFirstPage ? null : firstPageUrl, active: false },
    { icon: 'previousPage', label: '&lsaquo;', url: currentPagination.previousPageUrl, active: false },
    { icon: 'nextPage', label: '&rsaquo;', url: currentPagination.nextPageUrl, active: false },
    { icon: 'lastPage', label: '&raquo;', url: onLastPage ? null : lastPageUrl, active: false }
  ];
});

const selectedRowCount: ComputedRef<number> = computed((): number => props.selectedRows.size);
const selectedRowLabel: ComputedRef<string> = computed((): string => tableConfig.value.labels.selectedRows(selectedRowCount.value));
</script>

<template>
  <div :class="tableConfig.classes.pagination">
    <div class="flex min-w-0 flex-wrap items-center gap-3">
      <span
        v-if="selectable && selectedRowCount > 0"
        class="whitespace-nowrap text-sm font-medium text-slate-600"
        data-test="selected-row-count"
      >
        {{ selectedRowLabel }}
      </span>
      <label class="flex min-w-0 flex-wrap items-center gap-3">
        <span>{{ tableConfig.labels.rowsPerPage }}</span>
        <RowsPerPageSelect
          :model-value="pagination.perPage"
          :options="pagination.perPageOptions"
          @change="emit('per-page-change', $event)"
        />
      </label>
    </div>

    <div class="flex min-w-0 flex-wrap items-center gap-3">
      <span class="whitespace-nowrap">{{ pageLabel }}</span>
      <div class="flex items-center gap-1">
        <button
          v-for="link in paginationLinks"
          :key="`${link.label}-${link.url ?? 'disabled'}`"
          type="button"
          data-test="pagination-button"
          :class="[tableConfig.classes.paginationButton, link.active ? 'bg-slate-100 text-slate-950' : 'bg-white text-slate-700', tableConfig.darkMode.enabled ? (link.active ? 'dark:bg-slate-800 dark:text-slate-100' : 'dark:bg-slate-900 dark:text-slate-200') : '']"
          :disabled="!link.url"
          @click="emit('page-click', link.url)"
        >
          <CommonIcon :icon="link.icon" class="size-2.5" />
        </button>
      </div>
    </div>
  </div>
</template>
