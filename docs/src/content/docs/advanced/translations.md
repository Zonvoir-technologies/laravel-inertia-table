---
title: Translations & Interface Labels
description: Translate every built-in Vue adapter table label globally or per table.
---

Customize every Vue adapter interface label with labels. Supplied values merge with the defaults, so only translate the keys your application needs.

## Global translations

Call configureTable once during application setup. Use your own translation helper when your locale changes.

~~~ts
import { configureTable } from '@zonvoir/inertia-table-vue';
configureTable({
  labels: {
    search: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden.',
    rowsPerPage: 'Zeilen pro Seite',
  },
});
~~~

## Per-table labels

Pass config.labels to ZonvoirTable for local overrides. Use functions for selectedRows(count) and page(currentPage, lastPage).

## Complete label reference

The following are all labels currently exposed by tableConfig.ts.

### Toolbar, columns, and selection

| Key | Default value |
| --- | --- |
| actions | Actions |
| ascending | Ascending |
| clear | Clear |
| columns | Columns |
| descending | Descending |
| hide | Hide |
| rowActions | Row actions |
| search | Search... |
| selectAllRows | Select all rows |
| selectRow | Select row |
| stick | Stick |
| toggleColumns | Toggle Columns |
| toggleColumnSearch | Search... |
| unstick | Unstick |

### States and pagination

| Key | Default value |
| --- | --- |
| loading | Loading rows... |
| noColumnsFound | No columns found. |
| noResults | No results found. |
| page(currentPage, lastPage) | Page currentPage of lastPage; omits of lastPage when unavailable |
| rowsPerPage | Rows per page |
| selectedRows(count) | 1 row selected, or count rows selected |
| tryAgain | Try again |
| working | Working... |

### Confirmation, errors, and exports

| Key | Default value |
| --- | --- |
| cancelButton | Cancel |
| confirmButton | Continue |
| confirmMessage | This action cannot be undone. |
| confirmTitle | Are you absolutely sure? |
| errorMessage | Unable to load the table data. Please try again. |
| errorTitle | Unable to load table |
| export | Export |
| exports | Exports |
| exportProcessing | Your export is being processed. |
| exportStarted | Export started |
| ok | OK |

### Dynamic-label example

~~~ts
configureTable({
  labels: {
    selectedRows: (count) => count === 1 ? '1 element selected' : String(count) + ' elements selected',
    page: (currentPage, lastPage) => lastPage
      ? 'Page ' + currentPage + ' of ' + lastPage
      : 'Page ' + currentPage,
  },
});
~~~

See [Table Icons](/advanced/table-icons/) to customize the accompanying icons.
