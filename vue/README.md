# @zonvoir/inertia-table-vue

Vue 3 adapter package for [Zonvoir Table](https://zonvoir-table.com).

Zonvoir Table is an expressive Laravel and Inertia table system that tightly integrates backend query orchestration with frontend presentation. This package provides the Vue 3 component, headless composables, and styling utilities.

- **Documentation**: [https://zonvoir-table.com](https://zonvoir-table.com)
- **Laravel Companion Package**: [`zonvoir/laravel-inertia-table`](https://packagist.org/packages/zonvoir/laravel-inertia-table)

---

## Installation

Install the companion Laravel package via Composer:

```bash
composer require zonvoir/laravel-inertia-table
```

Install the Vue adapter package via npm:

```bash
npm install @zonvoir/inertia-table-vue
```

---

## Tailwind CSS Setup

Configure Tailwind CSS to scan the package so that all component utility classes are generated.

### Tailwind CSS 4

Add the `@source` directive to your main stylesheet (e.g. `resources/css/app.css`):

```css
@import "tailwindcss";

@source "../../node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}";
```

### Tailwind CSS 3.4

Add the package path to `content` in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/**/*.{blade.php,js,ts,vue}',
    './node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}',
  ],
};
```

---

## Basic Usage

Render a fully interactive table with query synchronization, pagination, sorting, search, and selection with a single component.

### In your Inertia Vue Page

```vue
<script setup lang="ts">
import { ZonvoirTable, type TableResource } from '@zonvoir/inertia-table-vue';

defineProps<{
  users: TableResource;
}>();
</script>

<template>
  <ZonvoirTable :table="users" />
</template>
```

> **Note**: `Table` and `InertiaTable` are also exported as aliases for `ZonvoirTable`.

---

## Customization

The Vue adapter ships with clean, accessible defaults. Use it as-is, customize presentation details, set global options, or override regions with slots.

### Slots

Slots allow you to replace or augment parts of the table while retaining built-in state, sorting, search, and pagination logic:

```vue
<template>
  <ZonvoirTable :table="users">
    <!-- Custom Toolbar -->
    <template #toolbar="{ tableApi }">
      <UserTableToolbar :table-api="tableApi" />
    </template>

    <!-- Custom Column Header -->
    <template #header="{ column }">
      <span class="font-bold uppercase tracking-wider">{{ column.label }}</span>
    </template>

    <!-- Custom Cell Rendering (scoped by column attribute) -->
    <template #cell(email)="{ row }">
      <a :href="`mailto:${row.email}`" class="text-indigo-600 hover:underline">
        {{ row.email }}
      </a>
    </template>

    <!-- Custom Empty State -->
    <template #emptyState>
      <div class="py-12 text-center text-gray-500">
        No matching users found.
      </div>
    </template>
  </ZonvoirTable>
</template>
```

Supported slots:
- `toolbar`, `beforeSearch`, `afterSearch`, `column-toggle`, `actions`
- `header`, `table`, `thead`, `tbody`, `row`, `cell(attribute)`
- `emptyState`, `loadingState`, `pagination`

### Per-Table Configuration (`config` prop)

Pass a `config` object to an individual table to customize labels, classes, icons, or dark mode:

```vue
<ZonvoirTable
  :table="users"
  :config="{
    labels: { rowsPerPage: 'Rows' },
    classes: { root: 'embedded-table shadow-sm' },
    darkMode: true,
  }"
/>
```

### Global Configuration (`configureTable`)

Configure application-wide defaults once during app initialization (e.g. in `app.ts`):

```ts
import { configureTable } from '@zonvoir/inertia-table-vue';
import SearchIcon from './icons/SearchIcon.vue';

configureTable({
  icons: {
    search: SearchIcon,
    actions: 'app:more',
  },
  labels: {
    search: 'Find records...',
    noResults: 'No records match this view.',
    selectedRows: (count) => `${count} selected`,
  },
  classes: {
    root: 'my-table rounded border bg-panel',
    headerCell: 'my-table-head px-3 py-2 font-semibold',
    bodyCell: 'my-table-cell px-3 py-2',
    pagination: 'my-table-footer flex items-center justify-between',
  },
  darkMode: true,
});
```

### Dark Mode

The adapter uses Tailwind's `dark:` utilities.

- **Tailwind CSS 4**: Add `@custom-variant dark (&:is(.dark *));` to your CSS.
- **Tailwind CSS 3.4**: Add `darkMode: 'class'` to your `tailwind.config.js`.

Then add the `dark` class to an ancestor element of the table (or set `darkMode: true` in your table configuration).

### Custom Dynamic Colors

If you use custom theme colors for badges, buttons, or highlights, ensure Tailwind includes those dynamic utility classes:

**Tailwind CSS 4:**
```css
@theme {
  --color-olive-500: #8f9948;
  --color-olive-600: #707a38;
}

@source inline("{,hover:,focus-visible:,disabled:}{bg,border,text,ring}-{olive}-{50,100,200,300,400,500,600,700,800,900}");
```

**Tailwind CSS 3.4:**
Add the pattern to `safelist` in `tailwind.config.js`:
```js
module.exports = {
  safelist: [
    {
      pattern: /^(bg|border|text|ring)-(olive)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus-visible', 'disabled'],
    },
  ],
};
```

---

## Advanced Usage

### Template Refs

Attach a `ref` to the table component to trigger actions from external buttons, keyboard shortcuts, or sibling components:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

const tableRef = ref<InstanceType<typeof ZonvoirTable>>();

const searchAda = () => tableRef.value?.setSearch('Ada');
const showEmail = () => tableRef.value?.toggleColumn('email');
</script>

<template>
  <div class="flex gap-2 mb-4">
    <button type="button" @click="searchAda">Find Ada</button>
    <button type="button" @click="showEmail">Toggle Email</button>
  </div>

  <ZonvoirTable ref="tableRef" :table="users" />
</template>
```

Exposed methods and properties on `tableRef.value`:
`state`, `rows`, `columns`, `visibleColumns`, `pagination`, `sorting`, `search`, `selectedItems`, `setSearch`, `setPerPage`, `setSort`, `toggleColumn`, `makeSticky`, `undoSticky`, `putState`, `toggleItem`, `clearSelection`, `performAction`.

### Headless Usage (`useTable`, `useActions`)

For completely custom layouts (cards, grids, or mobile lists), you can consume the reactive composables directly without using the packaged table template:

```vue
<script setup lang="ts">
import { useActions, useTable, type TableResource } from '@zonvoir/inertia-table-vue';

const props = defineProps<{ users: TableResource }>();

const table = useTable(props.users);
const actions = useActions(props.users);
</script>

<template>
  <section>
    <input
      :value="table.search.value"
      placeholder="Search..."
      @input="e => table.setSearch((e.target as HTMLInputElement).value)"
    />

    <button type="button" @click="actions.toggleItem('*')">
      Toggle all rows
    </button>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <article v-for="row in table.rows.value" :key="row.id" class="p-4 border rounded shadow-sm">
        <strong>{{ row.name }}</strong>
        <p>{{ row.email }}</p>
      </article>
    </div>
  </section>
</template>
```

---

## Exports Reference

### Components
- `ZonvoirTable` (main table component)
- `Table` (alias for `ZonvoirTable`)
- `InertiaTable` (alias for `ZonvoirTable`)

### Composables & Helpers
- `useTable` (reactive table state, pagination, sorting, search)
- `useActions` (row selection and action dispatch)
- `normalizeTable` (payload normalization helper)
- `configureTable` (global table configuration)
- `visitUrl` (Inertia visit wrapper)

### TypeScript Types
- `TableResource`
- `TableDefinition`
- `TableColumn`
- `TableRow`
- `TableApi`
- `UseActionsApi`
- `TableConfiguration`
- `TableClasses`
- `TableLabels`
- `TableIcons`

---

## Documentation

Comprehensive documentation, interactive examples, and API guides are available at:
[https://zonvoir-table.com](https://zonvoir-table.com)

---

## License

`@zonvoir/inertia-table-vue` is open-sourced software licensed under the [Apache License, Version 2.0](LICENSE).
