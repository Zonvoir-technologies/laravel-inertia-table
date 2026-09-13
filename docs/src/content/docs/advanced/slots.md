---
title: Vue Slots & Template Customization
description: Extend or replace Zonvoir Table toolbars, headers, cells, empty states, and pagination using Vue 3 scoped slots.
---

Zonvoir Table exposes Vue slots for each customizable part of its default interface: the toolbar, table, header, body, individual cells, loading state, empty state, and pagination. Use a small injection slot to add controls without changing the default layout, or replace a larger region when your UI needs a different structure.

For Vue slot syntax, see the [Vue slots documentation](https://vuejs.org/guide/components/slots.html).

## Global slots

| Slot | Description |
| --- | --- |
| toolbar | Replaces the complete toolbar. |
| beforeSearch | Content before the default search input. |
| afterSearch | Content after the default search input. |
| beforeActions | Content before column, export, and action controls. |
| column-toggle | Replaces the default column visibility control. |
| exports | Replaces the default export controls. |
| actions | Replaces the default bulk-action controls. |
| afterActions | Content after exports and bulk actions. |
| table | Replaces the complete table element inside its scroll container. |
| thead | Replaces the table header. |
| header | Replaces every default column header label. |
| header(attribute) | Replaces one column header label. |
| loadingState | Replaces the loading-state table row. |
| tbody | Replaces the table body when rows are available. |
| row | Replaces the contents of each default body row. |
| cell(attribute) | Replaces the contents of cells for one column attribute. |
| emptyState | Replaces the empty-state table row. |
| pagination | Replaces the pagination footer contents. |

## Example

Use a targeted slot when you only need to add something to the default table UI.

~~~vue
<ZonvoirTable :table="users">
  <template #beforeSearch>
    <span class="text-sm text-slate-500">User directory</span>
  </template>

  <template #afterActions>
    <a href="/users/create" class="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
      Create user
    </a>
  </template>
</ZonvoirTable>
~~~

## Toolbar slots

The default toolbar keeps search on the left and column, export, and bulk-action controls on the right.

| Slot | Props |
| --- | --- |
| toolbar | table, table-api |
| beforeSearch | None |
| afterSearch | None |
| beforeActions | None |
| column-toggle | table-api |
| exports | table, selected-keys, state |
| actions | table, table-api |
| afterActions | None |

The exports slot receives selected-keys and state. State includes the active page, page size, search, sort, direction, visible columns, and sticky columns.

## Structure slots

These slots replace default markup, so custom table, thead, tbody, and row content must use valid HTML table elements.

| Slot | Props |
| --- | --- |
| table | columns, rows, table, table-api |
| thead | columns, sorting, sticky, sticky-offsets, sticky-sides, is-column-sticky, sort-column, toggle-column-sticky, hide-column, selectable, all-visible-rows-selected, has-selectable-rows, toggle-all-visible-rows |
| loadingState | table, table-api, columns, colspan |
| tbody | columns, rows, table, table-api, sticky-offsets, sticky-sides, row-number-start, auto-visit, has-cell-click-listener, handle-row-click, handle-cell-click, selectable, row-key, selected-rows, toggle-row-selection |
| row | row, row-index, columns, table, table-api |
| emptyState | table, table-api, empty-state, action, columns, rows, colspan |
| pagination | pagination, table, table-api |

For a custom header, call sort-column with a column and asc or desc to use the built-in sorting navigation. For a custom body, use handle-row-click and handle-cell-click when you want to preserve normal navigation and emitted events.

## Header and column slots

Use header to supply a shared label renderer for every column, or header(attribute) for one column. Both receive column.

Use cell(attribute) to replace the contents of one column. It receives column, row, row-index, and value. The surrounding cell remains in place, keeping width, alignment, sticky behavior, links, and click behavior.

~~~vue
<ZonvoirTable :table="users">
  <template #header(email)="{ column }">
    <span class="text-indigo-700">{{ column.label }}</span>
  </template>

  <template #cell(status)="{ value }">
    <span
      class="rounded-full px-2 py-1 text-xs font-semibold"
      :class="value === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
    >
      {{ value }}
    </span>
  </template>
</ZonvoirTable>
~~~

## Loading, empty state, and pagination

The loadingState and emptyState slots are rendered inside the table. Return a td that spans the provided colspan. The pagination slot replaces footer content and receives the normalized pagination payload.

~~~vue
<ZonvoirTable :table="users">
  <template #loadingState="{ colspan }">
    <td :colspan="colspan" class="px-6 py-12 text-center text-slate-500">
      Loading employees...
    </td>
  </template>

  <template #emptyState="{ colspan }">
    <td :colspan="colspan" class="px-6 py-12 text-center text-slate-500">
      No users match the current filters.
    </td>
  </template>

  <template #pagination="{ pagination }">
    <div class="text-right text-sm text-slate-500">
      Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
    </div>
  </template>
</ZonvoirTable>
~~~

For visual-only changes, use the class configuration in the [Styling](/advanced/styling/) guide. Use a slot when markup or behavior needs to change.