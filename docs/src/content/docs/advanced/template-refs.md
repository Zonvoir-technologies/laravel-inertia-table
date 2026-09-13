---
title: Template Refs & Table Methods
description: Control a ZonvoirTable component imperatively with a Vue template ref.
---

Attach a Vue template ref to ZonvoirTable to access its public table API. This is useful for custom search controls, external pagination, column tools, and bulk-action buttons that live outside the default table markup.

## Basic usage

~~~vue
<script setup lang='ts'>
import { ref } from 'vue';
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

const tableRef = ref<InstanceType<typeof ZonvoirTable> | null>(null);
const clearSearch = () => tableRef.value?.setSearch('');
</script>

<template>
  <button type='button' @click='clearSearch'>Clear search</button>
  <ZonvoirTable ref='tableRef' :table='employees' />
</template>
~~~

The ref is null until the component is mounted. Use optional chaining, or access it after mount.

## Table methods

| Method | Description |
| --- | --- |
| setSearch(value) | Sets the search term and, when autoVisit is enabled, reloads the table. |
| setPerPage(value) | Changes the page size. |
| setSort(column, direction) | Sorts by a column attribute, or clears sorting when column is null. |
| toggleColumn(column) | Toggles a column by attribute or column object. |
| toggleColumnVisibility(column) | Alias for toggling a column visibility. |
| makeSticky(column) | Makes a column sticky. |
| undoSticky(column) | Removes sticky positioning from a column. |
| putState(state) | Applies search, page size, sort, column visibility, and sticky-column state. |
| toggleItem(key) | Toggles a selected row; pass * to select or clear the current page. |
| clearSelection() | Clears selected rows and returns to page selection mode. |
| performAction(action, keys) | Runs a row or bulk action. |

The methods that change table state honor the component autoVisit prop. With autoVisit enabled, ZonvoirTable updates the relevant query parameters and performs the Inertia visit for you.

## Reactive state

Read these exposed refs from tableRef.value. Vue unwraps them automatically in templates.

| Property | Description |
| --- | --- |
| rows | Current page rows. |
| columns / visibleColumns / hideableColumns | All normalized columns, rendered columns, and toggleable columns. |
| pagination | Current pagination data and links. |
| sorting | Active sort column and direction. |
| search | Current search term. |
| selectedItems / selectedRows | Selected row keys. |
| hasBulkActions / hasSelectableRows | Whether bulk actions or selectable rows are available. |
| allItemsAreSelected | Whether every selectable row on this page is selected. |
| isNavigating | Whether the table is loading data. |
| isPerformingAction | Whether an action request is in progress. |
| state | The internal normalized table state. |
