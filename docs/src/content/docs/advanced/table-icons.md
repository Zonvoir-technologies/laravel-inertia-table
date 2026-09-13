---
title: Table Icon Configuration & Overrides
description: Customize built-in Vue table icons.
---

Use icons to replace icons used by search, sorting, pagination, column controls, and error states. This differs from [Icons](/core-concepts/icons/), which documents icons defined in PHP table actions and empty states.

## Global defaults

~~~ts
import { configureTable } from '@zonvoir/inertia-table-vue';
configureTable({ icons: { search: 'lucide:search', nextPage: 'lucide:chevron-right' } });
~~~

## Per-table icons

~~~vue
<ZonvoirTable :table='orders' :config='{ icons: { export: &quot;lucide:download&quot; } }' />
~~~

Values can be Iconify identifiers or Vue components. Supplied keys merge with the defaults.

## Complete icon reference

These are every built-in icon key and its current default from tableConfig.ts.

| Key | Default icon | Used by |
| --- | --- | --- |
| actions | heroicons:ellipsis-vertical | Actions menu trigger |
| columns | heroicons:eye | Column-toggle trigger |
| error | heroicons:exclamation-triangle | Default table error state |
| export | heroicons:arrow-down-tray | Export control |
| firstPage | fontisto:angle-dobule-left | First pagination button |
| hide | heroicons:eye-slash | Hide-column action |
| lastPage | fontisto:angle-dobule-right | Last pagination button |
| loading | null | Loading state; the adapter uses its built-in spinner |
| nextPage | fontisto:angle-right | Next pagination button |
| previousPage | fontisto:angle-left | Previous pagination button |
| retry | heroicons:arrow-path | Retry action in an error state |
| search | heroicons:magnifying-glass | Search input |
| sort | heroicons:chevron-up-down | Unsorted column header |
| sortAscending | heroicons:arrow-up | Ascending column header |
| sortDescending | heroicons:arrow-down | Descending column header |
| stick | heroicons:lock-closed | Make-column-sticky action |
| unstick | heroicons:lock-open | Unstick-column action |

Set loading to null when you only want the built-in spinner. The other keys accept an Iconify collection:name string or a Vue component.

Use [Translations](/advanced/translations/) to customize the text that accompanies these controls.
