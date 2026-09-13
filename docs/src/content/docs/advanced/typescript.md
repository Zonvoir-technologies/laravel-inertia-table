---
title: TypeScript Types & Vue Definitions
description: TypeScript interface and type definitions exported by the Zonvoir Table Vue 3 adapter for type-safe components and props.
---

The Vue adapter exports its table payload types from `@zonvoir/inertia-table-vue`.

```ts
import type {
  TableAction,
  TableColumn,
  TableDefinition,
  TableResource,
  TableRow,
} from '@zonvoir/inertia-table-vue';
```

## Core payload types

```ts
type TableResource<T extends TableRow = TableRow> = {
  columns?: Array<Partial<TableColumn>>;
  rows?: T[];
  results?: PaginatedResults<T> | T[];
  state?: TableState;
  pagination?: boolean | Partial<TablePagination>;
  actions?: TableAction[];
  exports?: TableExport[];
};

type TableDefinition<T extends TableRow = TableRow> = {
  name: string;
  columns: TableColumn[];
  rows: T[];
  pagination: TablePagination;
  sorting: TableSorting;
  search: string;
};
```

Use `TableResource` for the serialized Laravel payload. `TableDefinition` is the normalized form used internally by the adapter.

## Row and column metadata

```ts
type TableRow = {
  id?: string | number;
  _primary_key?: string | number | null;
  _url?: string | TableUrl | null;
  _actions?: TableAction[] | string | null;
  _selectable?: boolean;
};

type TableColumn = {
  attribute: string;
  label: string;
  sortable: boolean;
  toggleable: boolean;
  visible: boolean;
  alignment: 'left' | 'center' | 'right' | string;
  meta: TableMeta;
};
```

`TableAction`, `TablePagination`, `TableSorting`, `TableUrl`, and `ImageConfig` describe their respective serialized metadata. Import them when typing custom cells, links, actions, or payload transforms.