---
title: Vue Slots & Template Customization
description: Extend or replace Zonvoir Table toolbars, filters, headers, cells, empty states, and pagination using Vue 3 scoped slots.
---

Zonvoir Table exposes Vue slots for each customizable part of its default interface: the toolbar, filters, table, header, body, individual cells, loading state, empty state, and pagination. Use a small injection slot to add controls without changing the default layout, or replace a larger region when your UI needs a different structure.

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
| `filter-button` <span class="zv-pro-tag">★ Pro</span> | Replaces the filter toggle button in the toolbar. |
| `filter-header` <span class="zv-pro-tag">★ Pro</span> | Replaces the horizontal filter bar in header layout. |
| `filter-panel` <span class="zv-pro-tag">★ Pro</span> | Replaces the entire slide-out filter panel / sidebar container. |
| `filters` <span class="zv-pro-tag">★ Pro</span> | Container wrapper slot around filter-panel. |
| `filter(attribute)` <span class="zv-pro-tag">★ Pro</span> | Replaces the editor UI for a specific filter attribute. |
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

The default toolbar keeps search on the left and column, export, bulk-action, and filter controls on the right.

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
| `filter-button` <span class="zv-pro-tag">★ Pro</span> | table, open, toggle, table-api |

The exports slot receives selected-keys and state. State includes the active page, page size, search, sort, direction, visible columns, and sticky columns.

## Filter slots

:::tip[Pro Feature]
Advanced table filtering is a premium capability included with **[Zonvoir Table Pro](https://github.com/Zonvoir-technologies/laravel-inertia-table-pro)** (`zonvoir/laravel-inertia-table-pro` on the backend, supported natively by `@zonvoir/inertia-table-vue`). These slots allow you to fully customize or replace any part of the Pro filter UI.
:::

Zonvoir Table and its Pro extension provide scoped slots to customize or completely replace filtering UI at both container and field levels:

| Slot | Props | Description |
| --- | --- | --- |
| `filter-button` <span class="zv-pro-tag">★ Pro</span> | `table`, `open`, `toggle`, `table-api` | Replaces the filter trigger button in the toolbar. |
| `filter-panel` <span class="zv-pro-tag">★ Pro</span> | `table`, `open`, `close`, `table-api` | Replaces the entire slide-out filter sidebar / panel container. |
| `filters` <span class="zv-pro-tag">★ Pro</span> | `table`, `open`, `close`, `layout`, `table-api` | Container wrapper slot around `filter-panel`. |
| `filter-header` <span class="zv-pro-tag">★ Pro</span> | `table`, `open`, `close`, `table-api` | Replaces the horizontal filter bar displayed above the table in header layout. |
| `filter(attribute)` <span class="zv-pro-tag">★ Pro</span> | `filter`, `value`, `update`, `table`, `close` | Replaces the editor input for a specific filter attribute while keeping the panel intact. |

### Replacing the Entire Filter Section (`filter-panel` / `filters`)

Just like `#toolbar` or `#pagination`, you can replace the entire filter section to build your own custom filtering sidebar, accordion, or off-canvas layout:

~~~vue
<ZonvoirTable :table="users">
  <template #filter-panel="{ open, close, table }">
    <aside
      v-if="open"
      class="w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shrink-0 ml-2"
    >
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 class="font-semibold text-sm text-slate-800">Custom Filter Panel</h3>
        <button
          type="button"
          @click="close"
          class="rounded p-1 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div class="py-4 space-y-4">
        <!-- Custom filter inputs and controls -->
      </div>
    </aside>
  </template>
</ZonvoirTable>
~~~

### Replacing the Filter Toggle Button (`filter-button`)

Use `#filter-button` to render a custom button, badge counter, or dropdown trigger in the toolbar:

~~~vue
<ZonvoirTable :table="users">
  <template #filter-button="{ open, toggle }">
    <button
      type="button"
      @click="toggle"
      :class="open ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'"
      class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
    >
      <span>Filters</span>
      <span v-if="open" class="text-xs">✕</span>
    </button>
  </template>
</ZonvoirTable>
~~~

### Replacing the Filter Header Bar (`filter-header`)

When using `filterLayout: 'header'`, use `#filter-header` to customize the horizontal filter bar shown directly above the table headers:

~~~vue
<ZonvoirTable :table="users">
  <template #filter-header="{ open, close, table }">
    <div v-if="open" class="flex items-center justify-between border-b bg-slate-50 px-4 py-2 text-xs">
      <span>Header filter bar</span>
      <button type="button" @click="close" class="text-slate-500 hover:text-slate-700">Close</button>
    </div>
  </template>
</ZonvoirTable>
~~~

### Customizing Individual Filter Fields (`filter(attribute)`)

If you want to keep the built-in Pro drawer or header and only replace the input control for a specific filter (such as `status`), use `#filter(attribute)`:

~~~vue
<ZonvoirTable :table="users">
  <template #filter(status)="{ filter, value, update }">
    <div class="py-2">
      <label class="block text-xs font-medium text-slate-700 mb-1">{{ filter.label }}</label>
      <select
        :value="value"
        @change="update(($event.target as HTMLSelectElement).value)"
        class="w-full rounded-md border border-slate-300 text-xs px-2 py-1.5"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </template>
</ZonvoirTable>
~~~

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