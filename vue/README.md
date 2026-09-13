# @zonvoir/inertia-table-vue

Vue adapter package for Zonvoir Table.

## Install

```bash
npm install @zonvoir/inertia-table-vue
```

## Development

```bash
cd vue
npm install
npm run build
npm run test
npm run typecheck
```

## Exports

- `ZonvoirTable`
- `Table`
- `useTable`
- `useActions`
- `normalizeTable`
- `configureTable`
- `TableApi`
- `UseActionsApi`
- `TableColumn`
- `TableRow`
- `TableResource`


## Headless Usage

Build a custom layout by importing the composables directly. `useTable` owns normalized rows, columns, visibility, pagination, sorting, search, sticky columns, and loading state. `useActions` owns selected keys and action execution for custom list, card, or grid views.

```vue
<script setup lang="ts">
import { useActions, useTable } from '@zonvoir/inertia-table-vue';

const props = defineProps<{ users: Record<string, unknown> }>();

const table = useTable(props.users);
const actions = useActions(props.users);
</script>

<template>
  <section>
    <button type="button" @click="table.setSearch('active')">Search active</button>
    <button type="button" @click="actions.toggleItem('*')">Toggle visible rows</button>

    <article v-for="row in table.rows.value" :key="row.id">
      <strong>{{ row.name }}</strong>
    </article>
  </section>
</template>
```

Filters and exports are not part of the headless API yet because those systems are not implemented in the adapter.

## Template Refs

Attach a ref to the default table when you want the packaged UI but need to drive it from custom buttons, keyboard shortcuts, or sibling components.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

const tableRef = ref<InstanceType<typeof ZonvoirTable>>();

const showEmail = () => tableRef.value?.toggleColumn('email');
const searchAda = () => tableRef.value?.setSearch('Ada');
</script>

<template>
  <button type="button" @click="searchAda">Find Ada</button>
  <button type="button" @click="showEmail">Toggle Email</button>
  <ZonvoirTable ref="tableRef" :table="users" />
</template>
```

The exposed API includes `state`, `rows`, `columns`, `visibleColumns`, `pagination`, `sorting`, `search`, `selectedItems`, `setSearch`, `setPerPage`, `setSort`, `toggleColumn`, `makeSticky`, `undoSticky`, `putState`, `toggleItem`, `clearSelection`, and `performAction`.

## Styles
Configure Tailwind to scan the package so it generates the utility classes used by the components.

When installing from npm:

For Tailwind CSS 4:

```css
@import "tailwindcss";

@source "../../node_modules/@zonvoir/inertia-table-vue/dist/**/*.js";
```

For Tailwind CSS 3.4, add the package path to `content` in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/**/*.{blade.php,js,ts,vue}',
    './node_modules/@zonvoir/inertia-table-vue/dist/**/*.js',
  ],
};
```

When linking directly to the Laravel package repository:

For Tailwind CSS 4:

```css
@source "../../vendor/zonvoir/laravel-inertia-table/vue/**/*.{js,vue}";
```

For Tailwind CSS 3.4:

```js
'./vendor/zonvoir/laravel-inertia-table/vue/**/*.{js,vue}',
```

### Dark mode

The adapter uses Tailwind's `dark:` utilities. Enable class-based dark mode in the consuming application, then add the `dark` class to an ancestor of the table.

For Tailwind CSS 4, add this to your CSS after importing Tailwind:

```css
@custom-variant dark (&:is(.dark *));
```

For Tailwind CSS 3.4, add this to `tailwind.config.js`:

```js
darkMode: 'class',
```

### Custom dynamic colors

The `color` option can produce Tailwind class names dynamically. If you use a custom color such as `olive`, register it and explicitly generate its utilities. Add any additional color name to the Tailwind theme and to the matching `@source inline` list (v4) or `safelist` pattern (v3.4).

For Tailwind CSS 4:

```css
@theme {
  --color-olive-50: #f7f8ef;
  --color-olive-100: #eef0dc;
  --color-olive-200: #dde2ba;
  --color-olive-300: #c5cc8e;
  --color-olive-400: #abb463;
  --color-olive-500: #8f9948;
  --color-olive-600: #707a38;
  --color-olive-700: #565e2e;
  --color-olive-800: #474d2a;
  --color-olive-900: #3d4227;
}

@source inline("{,hover:,focus-visible:,disabled:}{bg,border,text,ring}-{slate,gray,zinc,neutral,stone,red,orange,amber,yellow,lime,green,emerald,teal,cyan,sky,blue,indigo,violet,purple,fuchsia,pink,rose,olive}-{50,100,200,300,400,500,600,700,800,900}");
```

For Tailwind CSS 3.4:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f7f8ef',
          100: '#eef0dc',
          200: '#dde2ba',
          300: '#c5cc8e',
          400: '#abb463',
          500: '#8f9948',
          600: '#707a38',
          700: '#565e2e',
          800: '#474d2a',
          900: '#3d4227',
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|border|text|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|olive)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus-visible', 'disabled'],
    },
  ],
};
```

## Customization

The Vue adapter ships behavior plus sensible defaults. Use it as-is, override specific presentation details, or replace major regions with slots while keeping sorting, pagination, search, selection, actions, and URL behavior from the package.

```vue
<script setup lang="ts">
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';
</script>

<template>
  <ZonvoirTable :table="users" />
</template>
```

Configure global defaults once during app setup. Individual values merge with the defaults, so you can override one label, icon, or class without redefining the full table UI.

```ts
import { configureTable } from '@zonvoir/inertia-table-vue';
import SearchIcon from './icons/SearchIcon.vue';

configureTable({
  icons: {
    search: SearchIcon,
    actions: 'app:more',
  },
  labels: {
    search: 'Find users',
    noResults: 'No users match this view.',
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

Use the `config` prop for one table when local presentation should win over global configuration.

```vue
<ZonvoirTable
  :table="users"
  :config="{
    labels: { rowsPerPage: 'Rows' },
    classes: { root: 'embedded-table' },
    darkMode: true,
  }"
/>
```

Slots take precedence over configured defaults. Existing slots such as `toolbar`, `beforeSearch`, `afterSearch`, `column-toggle`, `actions`, `table`, `thead`, `tbody`, `emptyState`, `pagination`, and `cell(attribute)` remain supported. Additional presentation slots include `header`, `row`, and `loadingState`.

```vue
<ZonvoirTable :table="users">
  <template #toolbar="{ tableApi }">
    <UserTableToolbar :table-api="tableApi" />
  </template>

  <template #header="{ column }">
    <span class="tracking-wide uppercase">{{ column.label }}</span>
  </template>

  <template #cell(email)="{ row }">
    <a :href="`mailto:${row.email}`">{{ row.email }}</a>
  </template>

  <template #emptyState>
    <tbody><tr><td>No matching users.</td></tr></tbody>
  </template>
</ZonvoirTable>
```

For a completely custom visual design, replace larger regions such as `toolbar`, `thead`, `tbody`, or `pagination` and call the exposed `tableApi` methods from your own controls. The package still owns normalized table state and behavior; the consuming application owns visual identity.

## License

`@zonvoir/inertia-table-vue` is open-sourced software licensed under the [Apache License, Version 2.0](LICENSE).
