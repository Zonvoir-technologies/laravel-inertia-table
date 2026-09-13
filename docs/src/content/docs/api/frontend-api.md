---
title: Vue 3 Frontend Adapter API
description: Reference for the ZonvoirTable Vue 3 component, props, config options, composables (useTable, useActions), and event handlers.
---

```ts
import {
  ZonvoirTable,
  normalizeTable,
  useActions,
  useTable,
} from '@zonvoir/inertia-table-vue';
```

`ZonvoirTable` and `Table` are aliases for the same Vue component.

## Component props

```ts
type TableProps<T extends TableRow> = {
  table?: TableResource<T> | TableDefinition<T>;
  loading?: boolean;
  showColumnToggle?: boolean;
  selectable?: boolean;
  autoVisit?: boolean;
  searchDebounce?: number;
  config?: TableConfiguration;
};
```

| Prop | Default | Description |
| --- | --- | --- |
| `table` | -- | Laravel table payload or a normalized definition. |
| `loading` | `false` | Shows the loading state. |
| `showColumnToggle` | `true` | Shows the toggleable-columns control. |
| `selectable` | `true` | Enables row selection when the payload permits it. |
| `autoVisit` | `true` | Performs Inertia navigation for payload URLs. |
| `searchDebounce` | `300` | Debounce delay for search events, in milliseconds. |
| `config` | -- | Per-instance visual and label configuration. |

## Component events

```vue
<ZonvoirTable
  :table="users"
  @row-click="(row, column, event) => {}"
  @cell-click="({ row, column, value, event }) => {}"
  @search-change="(value) => {}"
  @per-page-change="(value) => {}"
  @page-click="(url) => {}"
  @retry="reload"
/>
```

The adapter also exports `useTable`, `useActions`, `normalizeTable`, `visitUrl`, and table configuration helpers. Exported types include `TableResource`, `TableDefinition`, `TableRow`, `TableColumn`, `TableAction`, `TablePagination`, `TableSorting`, `TableState`, and `ImageConfig`.