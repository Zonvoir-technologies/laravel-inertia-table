---
title: Build a Custom Table Component
description: Build a bespoke Vue table from a Zonvoir Table resource with useTable and useActions.
---

Build a custom table component when you need complete control of the markup and interaction design. Instead of rendering ZonvoirTable, pass the Laravel table resource to your own component and use the exported composables to read its normalized rows, columns, pagination, sorting, and actions.

The Laravel payload remains the source of truth. The custom component is responsible for rendering it and for performing navigation when the user changes search, sort, pagination, or column settings.

## Create the component

The component accepts the same resource that you would otherwise pass to ZonvoirTable.

~~~ts
import { useActions, useTable, type TableResource, type TableRow } from '@zonvoir/inertia-table-vue';

const props = defineProps<{ table: TableResource<TableRow> }>();
const tableApi = useTable(() => props.table);
const actionsApi = useActions(() => props.table);
~~~

useTable normalizes the Laravel resource and keeps local table state.

### Render the resource

Render visibleColumns and rows in your component template.

~~~vue
<table>
  <thead><tr><th v-for='column in tableApi.visibleColumns' :key='column.attribute'>{{ column.label }}</th></tr></thead>
  <tbody>
    <tr v-for='row in tableApi.rows' :key='row._primary_key ?? row.id'>
      <td v-for='column in tableApi.visibleColumns' :key='column.attribute'>{{ row[column.attribute] }}</td>
    </tr>
  </tbody>
</table>
~~~

Use tableApi.columns when all columns are needed, visibleColumns for the rendered table, and hideableColumns for a column selector.

## Resource data

The resource sent from Laravel can include the following values. useTable normalizes optional values before you render them.

| Value | Purpose |
| --- | --- |
| name | Table name and query-string namespace. |
| columns | Column definitions, including attribute, label, sortable, toggleable, and visibility settings. |
| rows or results | Table records from Laravel. |
| state | Current search, sort, page, visible columns, and sticky columns. |
| pagination | Page numbers, URLs, links, and per-page options. |
| actions | Row and bulk actions. |
| exports | Configured exports. |
| emptyState | Empty-table title, message, icon, and action. |

Rows can include _primary_key, _url, _column_urls, _actions, and _selectable in addition to the normal record values.

## Table interactions

Call tableApi.setSearch, setSort, setPerPage, toggleColumnVisibility, and toggleColumnSticky from your custom controls. These update local state only. To request filtered or paginated data from Laravel, perform the matching Inertia visit with your table query parameters.

## Actions and selection

useActions handles action execution and optional row selection. Render actions from the resource and call performAction when a user chooses one.

~~~vue
<button
  v-for='action in props.table.actions'
  :key='action.key'
  type='button'
  :disabled='action.disabled || actionsApi.isPerformingAction'
  @click='actionsApi.performAction(action)'
>
  {{ action.label }}
</button>
~~~

For selectable rows, call actionsApi.toggleItem(row._primary_key) and actionsApi.toggleItem('*') for all selectable rows on the current page. useActions handles URL actions, action endpoints, loading state, and custom action callbacks.

## When to use this guide

Use the default ZonvoirTable component when its layout and slots are sufficient. Build a custom component when you need a different table structure or a fully bespoke interface while retaining the Laravel payload format and package action behavior.

For the exact exported shapes, see [Frontend API](/api/frontend-api/) and [TypeScript](/advanced/typescript/).
