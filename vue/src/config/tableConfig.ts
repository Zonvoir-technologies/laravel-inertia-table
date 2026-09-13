import { computed, inject, markRaw, provide, type Component, type ComputedRef, type InjectionKey } from 'vue';
import { twMerge } from 'tailwind-merge';

export type TableIcon = string | Component;

export type TableLabels = {
  actions: string;
  ascending: string;
  clear: string;
  columns: string;
  hide: string;
  loading: string;
  noColumnsFound: string;
  noResults: string;
  page: (currentPage: number, lastPage: number | null) => string;
  rowsPerPage: string;
  rowActions: string;
  search: string;
  selectAllRows: string;
  selectRow: string;
  selectedRows: (count: number) => string;
  stick: string;
  toggleColumns: string;
  toggleColumnSearch: string;
  tryAgain: string;
  unstick: string;
  working: string;
  descending: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmButton: string;
  cancelButton: string;
  errorTitle: string;
  errorMessage: string;
  export: string;
  exports: string;
  exportStarted: string;
  exportProcessing: string;
  ok: string;
}

export type TableIcons = {
  actions: TableIcon;
  columns: TableIcon;
  error: TableIcon;
  export: TableIcon;
  firstPage: TableIcon;
  hide: TableIcon;
  lastPage: TableIcon;
  loading: TableIcon | null;
  nextPage: TableIcon;
  previousPage: TableIcon;
  retry: TableIcon;
  search: TableIcon;
  sort: TableIcon;
  sortAscending: TableIcon;
  sortDescending: TableIcon;
  stick: TableIcon;
  unstick: TableIcon;
  [key: string]: TableIcon | null;
}

export type TableClasses = {
  root: string;
  rootDark: string;
  toolbar: string;
  toolbarContent: string;
  toolbarSearch: string;
  toolbarActions: string;
  search: string;
  searchInput: string;
  scroll: string;
  table: string;
  thead: string;
  headerRow: string;
  headerCell: string;
  headerButton: string;
  headerMenu: string;
  headerMenuItem: string;
  tbody: string;
  row: string;
  bodyCell: string;
  stickyCell: string;
  cellLink: string;
  selectionHeader: string;
  selectionCell: string;
  bulkActions: string;
  actions: string;
  actionMenuItem: string;
  exportMenuItem: string;
  paginationContainer: string;
  pagination: string;
  paginationButton: string;
  emptyCell: string;
  emptyContent: string;
  emptyIcon: string;
  loadingCell: string;
  loadingContent: string;
  errorCell: string;
  errorContent: string;
  dropdownHeader: string;
  dropdownSearchWrapper: string;
  dropdownSearchInput: string;
  dropdownItem: string;
  dropdownEmpty: string;
  [key: string]: string;
}

export type TableDarkMode = {
  enabled: boolean;
  class?: string;
  attribute?: string;
}

export type TableConfiguration = {
  icons?: Partial<TableIcons>;
  classes?: Partial<TableClasses>;
  labels?: Partial<TableLabels>;
  darkMode?: Partial<TableDarkMode> | boolean;
}

export type ResolvedTableConfiguration = {
  icons: TableIcons;
  classes: TableClasses;
  labels: TableLabels;
  darkMode: TableDarkMode;
}

export const defaultTableConfiguration: ResolvedTableConfiguration = {
  icons: {
    actions: 'heroicons:ellipsis-vertical',
    columns: 'heroicons:eye',
    error: 'heroicons:exclamation-triangle',
    export: 'heroicons:arrow-down-tray',
    firstPage: 'fontisto:angle-dobule-left',
    hide: 'heroicons:eye-slash',
    lastPage: 'fontisto:angle-dobule-right',
    loading: null,
    nextPage: 'fontisto:angle-right',
    previousPage: 'fontisto:angle-left',
    retry: 'heroicons:arrow-path',
    search: 'heroicons:magnifying-glass',
    sort: 'heroicons:chevron-up-down',
    sortAscending: 'heroicons:arrow-up',
    sortDescending: 'heroicons:arrow-down',
    stick: 'heroicons:lock-closed',
    unstick: 'heroicons:lock-open',
  },
  classes: {
    root: 'zt-table flex max-w-full items-stretch border border-slate-200 bg-white shadow-sm rounder-md',
    rootDark: '',
    toolbar: 'zt-table-toolbar relative border-b border-slate-100 px-4 py-4',
    toolbarContent: 'zt-table-toolbar-content flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
    toolbarSearch: 'flex min-w-0 flex-1 flex-wrap items-center gap-3',
    toolbarActions: 'flex flex-wrap items-center gap-2 sm:w-auto',
    search: 'zt-table-search relative block w-full sm:max-w-sm',
    searchInput: 'zt-table-search-input h-9 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-slate-400',
    scroll: 'zt-table-scroll w-full overflow-x-auto overscroll-x-contain',
    table: 'zt-table-element w-full min-w-full table-auto border-separate border-spacing-0',
    thead: 'zt-table-head',
    headerRow: 'zt-table-header-row',
    headerCell: 'zt-table-header-cell text-sm px-4 relative z-30 bg-slate-100 font-semibold',
    headerButton: 'zt-table-header-button flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-semibold text-inherit',
    headerMenu: 'absolute left-0 top-8 z-[100] w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-sm font-normal text-slate-700 shadow-lg',
    headerMenuItem: 'w-full flex items-center justify-start gap-2 px-2 text-left',
    tbody: 'zt-table-body',
    row: 'zt-table-row transition-colors group',
    bodyCell: 'zt-table-cell zt-table-body-cell whitespace-nowrap border-b border-slate-100 bg-white px-4 py-3 text-sm text-slate-950 group-hover:bg-slate-50',
    stickyCell: 'sticky shadow-[1px_0_0_0_rgb(226_232_240)]',
    cellLink: 'zt-table-cell-link text-inherit underline-offset-2 hover:underline',
    selectionHeader: 'zt-table-select-header w-12 box-content border-slate-100 bg-slate-100 px-4 py-3 text-left',
    selectionCell: 'zt-table-select-cell w-12 border-b border-slate-100 px-4 py-3 group-hover:bg-slate-50',
    bulkActions: 'zt-table-bulk-actions',
    actions: 'zt-table-actions flex items-center justify-end gap-1.5',
    actionMenuItem: 'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50',
    exportMenuItem: 'w-full flex items-center justify-start gap-2 px-2 text-left',
    paginationContainer: 'zt-table-pagination-container border-t border-slate-100 px-4 py-3',
    pagination: 'flex items-center justify-between gap-3 text-sm text-slate-700',
    paginationButton: 'cursor-pointer inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center rounded-lg border border-slate-200 px-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40',
    emptyCell: 'border-b border-slate-100 px-4 py-8 text-center text-sm text-slate-500',
    emptyContent: 'mx-auto flex max-w-md flex-col items-center gap-3',
    emptyIcon: 'h-8 w-8 text-slate-400',
    loadingCell: 'border-b border-slate-100 px-6 py-12 text-center text-sm text-slate-500',
    loadingContent: 'inline-flex items-center gap-3',
    errorCell: 'border-b border-slate-100 px-6 py-12 text-center text-sm text-slate-500',
    errorContent: 'mx-auto flex max-w-md flex-col items-center gap-3',
    dropdownHeader: 'border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-950',
    dropdownSearchWrapper: 'border-b border-slate-100 p-2',
    dropdownSearchInput: 'h-8 w-full rounded border border-slate-100 px-2 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-slate-400',
    dropdownItem: 'flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm text-slate-950 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none',
    dropdownEmpty: 'px-3 py-4 text-sm text-slate-500',
  },
  labels: {
    actions: 'Actions',
    ascending: 'Ascending',
    clear: 'Clear',
    columns: 'Columns',
    descending: 'Descending',
    confirmTitle: 'Are you absolutely sure?',
    confirmMessage: 'This action cannot be undone.',
    confirmButton: 'Continue',
    cancelButton: 'Cancel',
    errorMessage: 'Unable to load the table data. Please try again.',
    errorTitle: 'Unable to load table',
    export: 'Export',
    exports: 'Exports',
    exportStarted: 'Export started',
    exportProcessing: 'Your export is being processed.',
    hide: 'Hide',
    ok: 'OK',
    loading: 'Loading rows...',
    noColumnsFound: 'No columns found.',
    noResults: 'No results found.',
    page: (currentPage: number, lastPage: number | null): string =>
      lastPage ? `Page ${currentPage} of ${lastPage}` : `Page ${currentPage}`,
    rowsPerPage: 'Rows per page',
    rowActions: 'Row actions',
    search: 'Search...',
    selectAllRows: 'Select all rows',
    selectRow: 'Select row',
    selectedRows: (count: number): string => count === 1 ? '1 row selected' : `${count} rows selected`,
    stick: 'Stick',
    toggleColumns: 'Toggle Columns',
    toggleColumnSearch: 'Search...',
    tryAgain: 'Try again',
    unstick: 'Unstick',
    working: 'Working...',
  },
  darkMode: {
    enabled: false,
    class: undefined,
    attribute: undefined,
  },
};

const defaultDarkTableClasses: Partial<TableClasses> = {
  rootDark: 'dark border-slate-800 bg-slate-950 text-slate-100 shadow-none',
  toolbar: 'dark:border-slate-800 dark:bg-slate-900',
  searchInput: 'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500',
  headerCell: 'dark:bg-slate-900 dark:text-slate-100',
  headerMenu: 'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
  headerMenuItem: 'text-slate-100 hover:bg-slate-800',
  bodyCell: 'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:group-hover:bg-slate-900',
  stickyCell: 'dark:shadow-[1px_0_0_0_rgb(30_41_59)]',
  selectionHeader: 'dark:border-slate-800 dark:bg-slate-900',
  selectionCell: 'dark:border-slate-800 dark:bg-slate-950 dark:group-hover:bg-slate-900',
  actionMenuItem: 'text-slate-100 hover:bg-slate-800',
  exportMenuItem: 'text-slate-100 hover:bg-slate-800',
  paginationContainer: 'dark:border-slate-800 dark:bg-slate-950',
  pagination: 'dark:text-slate-200',
  paginationButton: 'dark:border-slate-700 dark:hover:bg-slate-800',
  emptyCell: 'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400',
  loadingCell: 'dark:border-slate-800 dark:text-slate-400',
  errorCell: 'dark:border-slate-800 dark:text-slate-400',
  dropdownHeader: 'border-slate-800 text-slate-100',
  dropdownSearchWrapper: 'border-slate-800',
  dropdownSearchInput: 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:border-slate-500',
  dropdownItem: 'text-slate-100 hover:bg-slate-800 focus:bg-slate-800',
  dropdownEmpty: 'text-slate-400',
};

const uniqueClassTokens = (className: string): string => [...new Set(className.trim().split(/\s+/).filter(Boolean))].join(' ');

const mergeClassValue = (...classNames: Array<string | undefined>): string =>
  uniqueClassTokens(twMerge(classNames.filter(Boolean).join(' ')));

const mergeClasses = (baseClasses: TableClasses, overrideClasses: Partial<TableClasses> = {}): TableClasses => {
  const classes: TableClasses = Object.fromEntries(
    Object.entries(baseClasses).map(([key, value]: [string, string]): [string, string] => [key, uniqueClassTokens(value)])
  ) as TableClasses;

  Object.entries(overrideClasses).forEach(([key, value]: [string, string | undefined]): void => {
    if (!value) {
      return;
    }

    classes[key] = mergeClassValue(classes[key], value);
  });

  return classes;
};

const mergeDarkMode = (baseDarkMode: TableDarkMode, darkMode: TableConfiguration['darkMode']): TableDarkMode => {
  if (typeof darkMode === 'boolean') {
    return { ...baseDarkMode, enabled: darkMode };
  }

  return Object.assign({}, baseDarkMode, darkMode ?? {});
};

const mergeIcons = (...iconSets: Array<Partial<TableIcons> | undefined>): TableIcons => {
  const icons = Object.assign({}, ...iconSets) as Record<string, TableIcon | null>;

  return Object.fromEntries(
    Object.entries(icons).map(([key, icon]: [string, TableIcon | null]): [string, TableIcon | null] => [
      key,
      icon && typeof icon !== 'string' ? markRaw(icon) : icon,
    ])
  ) as TableIcons;
};

const mergeConfiguration = (...configs: Array<TableConfiguration | undefined>): ResolvedTableConfiguration => {
  const resolved = configs.reduce(
    (configuration: ResolvedTableConfiguration, config: TableConfiguration | undefined): ResolvedTableConfiguration => ({
      icons: mergeIcons(configuration.icons, config?.icons),
      classes: mergeClasses(configuration.classes, config?.classes),
      labels: Object.assign({}, configuration.labels, config?.labels ?? {}),
      darkMode: mergeDarkMode(configuration.darkMode, config?.darkMode),
    }),
    {
      icons: mergeIcons(defaultTableConfiguration.icons),
      classes: { ...defaultTableConfiguration.classes },
      labels: { ...defaultTableConfiguration.labels },
      darkMode: { ...defaultTableConfiguration.darkMode },
    }
  );

  return resolved.darkMode.enabled
    ? { ...resolved, classes: mergeClasses(resolved.classes, defaultDarkTableClasses) }
    : resolved;
};

let tableConfiguration: ResolvedTableConfiguration = mergeConfiguration();
export const TableConfigurationKey: InjectionKey<ComputedRef<ResolvedTableConfiguration>> = Symbol('ZonvoirTableConfiguration');

export const configureTable = (configuration: TableConfiguration = {}): ResolvedTableConfiguration => {
  tableConfiguration = mergeConfiguration(tableConfiguration, configuration);

  return tableConfiguration;
};

export const resetTableConfiguration = (): ResolvedTableConfiguration => {
  tableConfiguration = mergeConfiguration();

  return tableConfiguration;
};

export const resolveTableConfiguration = (configuration?: TableConfiguration): ResolvedTableConfiguration =>
  mergeConfiguration(tableConfiguration, configuration);

export const provideTableConfiguration = (configuration?: ComputedRef<TableConfiguration | undefined>): ComputedRef<ResolvedTableConfiguration> => {
  const resolved = computed((): ResolvedTableConfiguration => resolveTableConfiguration(configuration?.value));
  provide(TableConfigurationKey, resolved);

  return resolved;
};

export const useTableConfiguration = (): ComputedRef<ResolvedTableConfiguration> =>
  inject(TableConfigurationKey, computed((): ResolvedTableConfiguration => resolveTableConfiguration()));

export const tableClass = (key: keyof TableClasses, extra?: string | Array<string | undefined | false> | false): string => {
  const config = useTableConfiguration();
  const extras = Array.isArray(extra) ? extra : [extra];

  return twMerge([config.value.classes[key], ...extras].filter(Boolean).join(' '));
};

export const iconFor = (key: string): TableIcon | null => {
  const config = useTableConfiguration();

  return config.value.icons[key] ?? key;
};
