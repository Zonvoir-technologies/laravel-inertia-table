export type TableRowKey = string | number;
export type TableMetaPrimitive = string | number | boolean | null | undefined;
export type TableMetaRecord = Record<string, TableMetaPrimitive | TableMetaPrimitive[] | Record<string, TableMetaPrimitive>>;
export type TableMetaValue = TableMetaPrimitive | TableMetaPrimitive[] | TableMetaRecord;
export type TableCellValue = TableMetaValue | Date;
export type TableMeta = Record<string, TableMetaValue>;

export type ImageSize = 'small' | 'medium' | 'large' | 'extra-large';

export type ImagePosition = 'start' | 'end';

export type ImageConfig = {
  url: string | null;
  urls: string[];
  icon: string | null;
  size: ImageSize;
  width: number | null;
  height: number | null;
  rounded: boolean;
  position: ImagePosition;
  class: string;
  alt: string;
  title: string;
  limit: number | null;
}


export type TableUrl = {
  url: string | null;
  target?: string | null;
  preserveScroll?: boolean;
  preserveState?: boolean;
  download?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  modal?: boolean;
  prefetch?: { strategy: string; cacheFor?: number | null } | null;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
}

export type TableUrlValue = string | TableUrl | null;

export type TableExport = {
  key: string;
  label: string;
  endpoint?: string | null;
  authorized?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  queued?: boolean;
  limitToFilteredRows?: boolean;
  limitToSelectedRows?: boolean;
  asDownload?: boolean;
  meta?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type TableAction = {
  key: string;
  label: string;
  type: 'link' | 'action' | 'custom' | string;
  url?: TableUrl | null;
  endpoint?: string | null;
  bulk?: boolean;
  onlyBulk?: boolean;
  authorized?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  confirm?: boolean | { title?: string | null; message?: string | null; confirmButton?: string | null; cancelButton?: string | null };
  icon?: string | null;
  tooltip?: string | null;
  showLabel?: boolean;
  variant?: string | null | ButtonVariants;
  variantColor?: string | null;
  class?: string | null;
  meta?: TableMeta;
  data?: TableMeta;
  [key: string]: TableMetaValue | TableUrl | ButtonVariants | TableMeta | undefined;
}

export type TableEmptyState = {
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  action?: TableAction | null;
}

export type TableErrorRetryAction = {
  label?: string | null;
  icon?: string | null;
}

export type TableErrorState = {
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  retry?: boolean | TableErrorRetryAction;
  action?: TableAction | null;
}

export type TableRow = {
  id?: TableRowKey | null;
  _primary_key?: TableRowKey | null;
  _url?: TableUrlValue;
  _column_urls?: Record<string, TableUrlValue>;
  _column_images?: Record<string, ImageConfig>;
  _actions?: TableAction[] | string | null;
  _selectable?: boolean;
  [key: string]: TableCellValue | TableUrlValue | Record<string, TableUrlValue> | Record<string, ImageConfig> | TableAction[];
}

export type TableColumn = {
  attribute: string;
  label: string;
  key?: string;
  name?: string;
  header?: string;
  type?: string;
  sortable: boolean;
  toggleable: boolean;
  visible: boolean;
  visibleByDefault?: boolean;
  sticky?: boolean;
  stickable?: boolean;
  alignment: 'left' | 'center' | 'right' | string;
  width?: string | number | null;
  minWidth?: string | number | null;
  maxWidth?: string | number | null;
  headerClass?: string | null;
  cellClass?: string | null;
  tooltip?: string | null;
  defaultValue?: TableCellValue;
  meta: TableMeta;
  [key: string]: TableCellValue | TableMeta | undefined;
}

export type PaginationType = 'full' | 'simple' | 'cursor' | 'standard';

export type PaginatorLink = {
  url: string | null;
  label: string;
  page?: number | null;
  active: boolean;
}

export type PaginatedResults<T extends TableRow = TableRow> ={
  data: T[];
  path?: string;
  per_page?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  on_first_page?: boolean;
  on_last_page?: boolean;
  current_page?: number;
  first_page_url?: string;
  from?: number | null;
  last_page?: number;
  last_page_url?: string;
  links?: PaginatorLink[];
  to?: number | null;
  total?: number;
  current_page_url?: string;
  next_cursor?: string | null;
  prev_cursor?: string | null;
  [key: string]: TableMetaValue | T[] | PaginatorLink[];
}

export type TablePagination = {
  enabled: boolean;
  type: PaginationType;
  perPage: number;
  defaultPerPage: number;
  perPageOptions: number[];
  currentPage: number;
  from: number | null;
  to: number | null;
  total: number | null;
  lastPage: number | null;
  links: PaginatorLink[];
  nextPageUrl: string | null;
  previousPageUrl: string | null;
  nextCursor: string | null;
  previousCursor: string | null;
  firstPageUrl: string | null;
  lastPageUrl: string | null;
}

export type TableSorting = {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

export type TableState = {
  page?: number;
  perPage?: number;
  cursor?: string | null;
  search?: string | null;
  sort?: string | null;
  direction?: 'asc' | 'desc' | string | null;
  columns?: Record<string, boolean> | string[];
  sticky?: string[];
  [key: string]: TableMetaValue | Record<string, boolean> | string[];
}

export type TableResource<T extends TableRow = TableRow> = {
  name?: string;
  columns?: Array<Partial<TableColumn>>;
  rows?: T[];
  results?: PaginatedResults<T> | T[];
  state?: TableState;
  pagination?: boolean | Partial<TablePagination>;
  paginationType?: PaginationType;
  perPageOptions?: number[];
  defaultPerPage?: number;
  stickyHeader?: boolean;
  rowSelectionKey?: string | null;
  selectable?: boolean;
  persistRowSelectionAcrossPages?: boolean;
  meta?: TableMeta;
  actions?: TableAction[];
  exports?: TableExport[];
  hasActions?: boolean;
  hasBulkActions?: boolean;
  hasExports?: boolean;
  hasExportsThatLimitsToSelectedRows?: boolean;
  emptyState?: string | false | null | TableEmptyState;
  [key: string]: TableMetaValue | Array<Partial<TableColumn>> | TableRow[] | PaginatedResults<T> | T[] | TableState | boolean | Partial<TablePagination> | PaginationType | TableAction[] | TableExport[] | TableEmptyState;
}

export type TableDefinition<T extends TableRow = TableRow> = {
  name: string;
  columns: TableColumn[];
  rows: T[];
  pagination: TablePagination;
  sorting: TableSorting;
  search: string;
  stickyHeader: boolean;
  rowSelectionKey: string | null;
  selectable: boolean;
  persistRowSelectionAcrossPages: boolean;
  meta: TableMeta;
  state: TableState;
  actions: TableAction[];
  exports: TableExport[];
  hasActions: boolean;
  hasBulkActions: boolean;
  hasExports: boolean;
  hasExportsThatLimitsToSelectedRows: boolean;
  emptyState: false | TableEmptyState;
}

export type ButtonVariants = 'solid' | 'outline' | 'ghost' | 'link';
