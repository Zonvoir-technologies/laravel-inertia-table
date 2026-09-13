---
title: Custom Table Styling & CSS Classes
description: Customize Zonvoir Table appearance using Tailwind CSS utility classes, stable zt-* selectors, and the config.classes API.
---

Zonvoir Table uses Tailwind CSS and exposes two customization paths:

1. Target the stable zt-* selectors in your stylesheet.
2. Pass classes through config.classes when you want to extend the defaults for one table.

~~~vue
<ZonvoirTable
  :table="employees"
  :config="{
    classes: {
      root: 'rounded-2xl border-indigo-200 shadow-lg',
      headerCell: 'bg-indigo-50 text-indigo-950'
    }
  }"
/>
~~~

Configured classes are merged with the adapter defaults, so the built-in zt-* hooks remain available.

## Available CSS classes

These are all stable zt-* selectors rendered by the current Vue adapter.

### General classes

| Class | Description |
| --- | --- |
| .zt-badge | Badge element rendered by the adapter. |
| .zt-dropdown | Dropdown menu container. This element is teleported to body. |
| .zt-dialog-fade-enter-active | Active class for dialog backdrop transitions. |
| .zt-dialog-fade-leave-active | Active class for dialog backdrop leave transitions. |
| .zt-dialog-scale-enter-active | Active class for dialog panel transitions. |
| .zt-dialog-scale-leave-active | Active class for dialog panel leave transitions. |

### Toolbar and actions classes

| Class | Description |
| --- | --- |
| .zt-table-toolbar | Header container for the toolbar. |
| .zt-table-toolbar-content | Inner layout for the default toolbar. |
| .zt-table-search | Label that wraps the search control. |
| .zt-table-search-input | Search input field. |
| .zt-table-bulk-actions | Default wrapper around bulk actions. |
| .zt-table-actions | Inline action group rendered by the TableActions component. |

### Table classes

| Class | Description |
| --- | --- |
| .zt-table | Outermost table section. |
| .zt-table-scroll | Horizontally scrollable wrapper around the native table. |
| .zt-table-element | Native table element. |
| .zt-table-head | thead element. |
| .zt-table-header-row | Header row. |
| .zt-table-header-cell | Header cell rendered for every column. |
| .zt-table-header-button | Button inside the default header cell. |
| .zt-table-body | tbody element. |
| .zt-table-row | Each rendered body row. |
| .zt-table-cell | Shared class on rendered body cells. |
| .zt-table-body-cell | Body td cell. |
| .zt-table-cell-link | Link that wraps the contents of a linked cell. |
| .zt-table-select-header | Select-all header cell. |
| .zt-table-select-cell | Per-row selection cell. |
| .zt-table-pagination-container | Footer container for pagination controls. |

## Configuration class keys

Use config.classes to add or override utility classes without writing a CSS selector. Every key below is supported by the current adapter.

### Layout and header

| Key | Applies to |
| --- | --- |
| root | Outer table section. |
| rootDark | Extra root classes while darkMode is enabled. |
| toolbar | Toolbar header. |
| toolbarContent | Default toolbar inner layout. |
| search | Search field wrapper. |
| searchInput | Search input. |
| scroll | Scroll container. |
| table | Native table element. |
| thead | Table head. |
| headerRow | Header row. |
| headerCell | Header cells. |
| headerButton | Default header button. |
| headerMenu | Column-header dropdown menu. |
| headerMenuItem | Items in the column-header dropdown. |

### Rows, cells, and actions

| Key | Applies to |
| --- | --- |
| tbody | Table body. |
| row | Body rows. |
| bodyCell | Body cells. |
| stickyCell | Sticky column cells. |
| cellLink | Links inside linked cells. |
| selectionHeader | Select-all header cell. |
| selectionCell | Per-row selection cell. |
| bulkActions | Default bulk actions wrapper. |
| actions | Inline TableActions group. |
| actionMenuItem | Row-action dropdown items. |
| exportMenuItem | Export dropdown items. |

### Pagination, states, and column dropdown

| Key | Applies to |
| --- | --- |
| paginationContainer | Pagination footer. |
| pagination | Pagination controls wrapper. |
| paginationButton | Pagination buttons. |
| emptyCell | Empty-state table cell. |
| emptyContent | Content inside the default empty state. |
| emptyIcon | Default empty-state icon. |
| loadingCell | Loading-state table cell. |
| loadingContent | Content inside the default loading state. |
| errorCell | Error-state table cell. |
| errorContent | Content inside the default error state. |
| dropdownHeader | Column-toggle dropdown header. |
| dropdownSearchWrapper | Column-toggle search wrapper. |
| dropdownSearchInput | Column-toggle search input. |
| dropdownItem | Column-toggle item. |
| dropdownEmpty | Empty message in the column-toggle dropdown. |

## Column and action classes

Add classes to individual columns and actions from the PHP definition. labelClass() applies to the header cell, and cellClass() applies to body cells for that column.

~~~php
TextColumn::make('email')
    ->labelClass('text-indigo-700')
    ->cellClass('font-medium text-slate-900');

Action::make('Edit')
    ->class('!bg-indigo-600 hover:!bg-indigo-700');
~~~

## Useful state selectors

~~~css
.account-table .zt-table-row:hover .zt-table-body-cell {
  background: #f8fafc;
}

.account-table .zt-table-cell[data-column='status'] {
  width: 10rem;
}

.account-table .zt-table-cell-link:hover {
  color: #4f46e5;
}
~~~

For the built-in boolean theme switch, see [Dark Mode](/advanced/dark-mode/). For changing markup or behavior, see [Slots](/advanced/slots/).