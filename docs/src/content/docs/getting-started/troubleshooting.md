---
title: Troubleshooting & Bug Reports
description: Diagnose common Zonvoir Table installation, styling, data, and navigation problems, and report reproducible bugs.
---

Start by confirming the installed backend and Vue adapter versions are compatible, then work through the checks below.

## The table has no styling

Ensure Tailwind scans the Vue adapter package. For Tailwind CSS 4, add:

```css
@source "../../node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}";
```

For Tailwind CSS 3, include the same package path in `content`. Rebuild your frontend assets after changing the scan configuration. See [Installation](/getting-started/installation/#configure-tailwind-css) for complete examples.

## The table does not render

Check all of the following:

- `@zonvoir/inertia-table-vue` is installed and `ZonvoirTable` is imported from that package.
- The page receives a table payload and passes it with `:table`.
- Use `Table::results()` or a `Table` instance that serializes to results when rendering rows; `Table::payload()` is definition-only.
- The table defines a valid Eloquent model or query.

Use Vue devtools or log the page prop to inspect the payload. The [Payload Shape](/api/payload/) reference shows the expected structure.

## Search, sorting, or pagination does not update

Confirm that the column is marked `searchable()` or `sortable()` as appropriate, and that the table has searchable fields configured for search. Ensure the page is rendered through Inertia so navigation can update query-string state.

For multiple tables on one page, give each table a unique name with `named()` or `as()` to prevent query-string collisions. See [Multiple Tables](/core-concepts/multiple-tables/).

## Changes to configuration have no effect

Clear or rebuild Laravel's configuration cache after changing `config/zonvoir-table.php`:

```bash
php artisan config:clear
php artisan config:cache
```

For frontend changes, restart the Vite development server or rebuild production assets.

## Actions or exports fail

Verify that the package routes are available and that the action or export is authorized for the current user. Inspect the Network tab for the request to `/zonvoir-table/actions` or `/zonvoir-table/exports`, then check Laravel logs for the server exception.

## Report a bug

Please open an issue in the [GitHub issue tracker](https://github.com/Zonvoir-technologies/laravel-inertia-table/issues). Include:

- Backend package and Vue adapter versions
- PHP, Laravel, Vue, Inertia, Node, and Tailwind versions
- A minimal reproduction, including table and column definitions
- Expected behavior, actual behavior, and the complete error message or stack trace
- Screenshots or a small repository when the problem is visual or environment-specific

Remove credentials, tokens, and private customer data before posting.

### Example issue template

You can use the following dummy example as a guide when reporting an issue on GitHub:

```markdown
### Title
[Bug]: Search query resets pagination unexpectedly when filtering users

### Environment & Versions
- **laravel-inertia-table**: `^1.0.0`
- **@zonvoir/inertia-table-vue**: `^1.0.0`
- **PHP**: `8.2.12`
- **Laravel**: `11.0.0`
- **Vue**: `3.4.0`
- **Inertia.js**: `v2.0`
- **Tailwind CSS**: `v4.0`

### Description
When typing in the search input on page 3 of the table, the query resets to page 1 as expected, but the pagination component UI continues to display "Page 3 of 10".

### Steps to Reproduce
1. Navigate to `/users` with 50+ records.
2. Go to page 3 using the pagination button.
3. Type `"john"` in the search bar.
4. Notice the table rows filter, but the pagination indicator is not synced.

### Table Definition
```php
namespace App\Tables;

use App\Models\User;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('id', 'ID')->sortable(),
            TextColumn::make('name', 'Name')->searchable(),
            TextColumn::make('email', 'Email')->searchable(),
        ];
    }
}
```

### Vue Component
```vue
<script setup>
import { ZonvoirTable, type TableResource } from '@zonvoir/inertia-table-vue';

defineProps({
  users: TableResource,
});
</script>

<template>
  <ZonvoirTable :table="users" />
</template>
```

### Expected Behavior
The pagination state in the footer should reset and show "Page 1 of 2".

### Actual Behavior
The footer still displays "Page 3 of 10" while the payload only contains 2 records.

### Error Logs / Screenshots
```text
// Paste any console errors, network response errors, or Laravel log traces here
```
```
