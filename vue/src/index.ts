export { default as Table, type TableProps } from './components/Table.vue';
export { default as ZonvoirTable } from './components/Table.vue';
export { default as InertiaTable } from './components/Table.vue';

export { default as CommonButton } from './components/Common/CommonButton.vue';
export { default as CommonBadge } from './components/Common/CommonBadge.vue';
export { default as CommonIcon } from './components/Common/CommonIcon.vue';
export { default as CommonDropdown } from './components/Common/CommonDropdown.vue';
export { default as CommonCheckbox } from './components/Common/CommonCheckbox.vue';
export { default as CommonTooltip } from './components/Common/CommonTooltip.vue';
export { default as CommonAlert } from './components/Common/CommonAlert.vue';
export { default as TableCell } from './components/TableCell.vue';
export { default as TableHeader, type TableHeaderProps } from './components/TableHeader.vue';
export { default as TableHeaderDropdown } from './components/TableHeaderDropdown.vue';
export { default as ToggleColumnsDropdown, type ToggleColumnsDropdownProps } from './components/ToggleColumnsDropdown.vue';
export { default as Switch } from './components/Switch.vue';

// Filter UI components
export { default as TableFilterButton, type TableFilterButtonProps } from './components/TableFilterButton.vue';
export { default as TableFilterPanel, type TableFilterPanelProps } from './components/TableFilterPanel.vue';
export { default as TableFilterHeader, type TableFilterHeaderProps } from './components/TableFilterHeader.vue';
export { default as TableFilterDrawer, type TableFilterDrawerProps } from './components/TableFilterDrawer.vue';
export { default as ActiveFilters, type ActiveFiltersProps } from './components/ActiveFilters.vue';
export { default as TextFilter, type TextFilterProps } from './components/filters/TextFilter.vue';
export { default as BooleanFilter, type BooleanFilterProps } from './components/filters/BooleanFilter.vue';
export { default as DateFilter, type DateFilterProps } from './components/filters/DateFilter.vue';
export { default as NumericFilter, type NumericFilterProps } from './components/filters/NumericFilter.vue';
export { default as SetFilter, type SetFilterProps } from './components/filters/SetFilter.vue';
export { default as FilterInput, type FilterInputProps } from './components/filters/FilterInput.vue';
export { default as FilterEditor, type FilterEditorProps } from './components/filters/FilterEditor.vue';
export { default as FilterWrapper, type FilterWrapperProps } from './components/filters/FilterWrapper.vue';
export { useFilterField } from './components/filters/useFilterField';
export { default as CommonSelect, type CommonSelectProps, type SelectItem, type SelectOption, type SelectKeyOption } from './components/Common/CommonSelect.vue';
export { default as CommonDatepicker, type CommonDatepickerProps, type PresetItem, type PresetInput } from './components/Common/CommonDatepicker.vue';
export { default as CommonDateRangePicker, type CommonDateRangePickerProps } from './components/Common/CommonDateRangePicker.vue';

export { useTable } from './composables/useTable';
export { useActions } from './composables/useActions';
export { useFloatingPopover } from './composables/useFloatingPopover';
export { useColumnPersistence, type UseColumnPersistenceOptions, type UseColumnPersistenceReturn } from './composables/useColumnPersistence';
export {
  useScreenSize,
  setScreenSize,
  resetScreenSize,
  defaultBreakpoints,
  type ScreenBreakpoint,
  type UseScreenSizeOptions,
  type UseScreenSizeReturn,
} from './composables/useScreenSize';
export {
  useTableFilters,
  hasFilterContent,
  hasInvalidDraft,
  isValidFilter,
  formatFilterValue,
  setClauseSymbols,
  getClauseSymbol,
  resetClauseSymbols,
} from './composables/useTableFilters';

export { normalizeTable } from './helpers/normalizeTable';
export { visitUrl } from './helpers/visitUrl';

export {
  configureTable,
  defaultTableConfiguration,
  iconFor,
  provideTableConfiguration,
  resetTableConfiguration,
  resolveTableConfiguration,
  tableClass,
  useTableConfiguration,
  useTableDarkMode,
  tableLabel,
} from './config/tableConfig';

export type { TableApi, TableState as UseTableState } from './composables/useTable';
export type { CustomActionHandler, CustomActionContext, ActionExecutionPayload, ActionSelectionMode, UseActionsApi, UseActionsOptions } from './composables/useActions';
export type { VisitUrlOptions } from './helpers/visitUrl';
export type {
  ResolvedTableConfiguration,
  TableClasses,
  TableConfiguration,
  TableDarkMode,
  TableIcon,
  TableIcons,
  TableLabels,
} from './config/tableConfig';

export type {
  FilterScalarValue,
  FilterValue,
  FilterComparator,
  FilterDefinition,
  ActiveFilterState,
  FilterDraftState,
  TableFilterSource,
  TableFilterState,
  TableFilterMeta,
  TableMetaQueryString,
  UseTableFiltersOptions,
} from './composables/useTableFilters';

export type {
  ImageConfig,
  ImagePosition,
  ImageSize,
  PaginatedResults,
  PaginationType,
  PaginatorLink,
  TableDefinition,
  TableAction,
  TableEmptyState,
  TableErrorRetryAction,
  TableErrorState,
  TableColumn,
  TableFilter,
  TableFilterLayout,
  TableFilterOption,
  TableFilterType,
  TableFilterValue,
  TableFiltersPayload,
  TableFiltersState,
  TablePagination,
  TableResource,
  TableRow,
  TableRowKey,
  TableSorting,
  TableState,
} from './types/table';
