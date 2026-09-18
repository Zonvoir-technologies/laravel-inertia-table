# Zonvoir Table

Expressive Laravel and Inertia Vue tables, keeping query orchestration and presentation tightly integrated.

## Requirements

PHP 8.3+
Laravel 11, 12, or 13
Inertia.js 2.x or 3.x
Vue 3.4+
Tailwind CSS 3.4+ or 4.0+

## Installation

### Standard Installation

Install the Laravel backend package via Composer:

```bash
composer require zonvoir/laravel-inertia-table
```

Install the Vue adapter package via npm:

```bash
npm install @zonvoir/inertia-table-vue
```

> **Architecture Note**: Zonvoir Table decouples backend table querying and hydration (`zonvoir/laravel-inertia-table`) from frontend presentation adapters (`@zonvoir/inertia-table-vue`). React and Svelte adapters will be available in future releases. Both packages are version-synchronized.

Import it in your app:

```ts
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';
```

Configure Tailwind to scan the package so it generates the utility classes used by the components.

For Tailwind CSS 4:

```css
@import "tailwindcss";

@source "../../node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}";
```

For Tailwind CSS 3.4, add the package path to `content` in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/**/*.{blade.php,js,ts,vue}',
    './node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}',
  ],
};
```

## Backend Table Definition

```php
use App\Models\User;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableState;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('name')
                ->label('Name')
                ->sortable(),
            TextColumn::create('email', 'Email Address')
                ->searchable(),
        ];
    }
}
```

Pagination is enabled by default and can be disabled per table:

```php
use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected PaginationType $paginationType = PaginationType::Simple;

    protected ?array $perPageOptions = [15, 30, 50, 100];

    protected ?int $defaultPerPage = 50;
}
```

```php
class UsersTable extends Table
{
    protected bool $pagination = false;
}
```

Execute a table query with search, sorting, and the configured paginator, returning the full Inertia table payload:

```php
$users = UsersTable::make()
    ->named('users')
    ->results(User::query(), TableRequest::fromRequest(request()));
```

The package supports `paginate()`, `simplePaginate()`, and `cursorPaginate()` through `PaginationType::Standard`, `PaginationType::Simple`, and `PaginationType::Cursor`.

## Columns

Columns describe backend metadata and value resolution only. Rendering stays in the frontend.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('name')
    ->label('Name')
    ->sortable()
    ->searchable()
    ->width('16rem')
    ->labelClass('font-medium')
    ->cellClass('truncate');
```

Custom frontend-only metadata can be passed through `meta()`:

```php
TextColumn::make('name')->meta([
    'icon' => 'user',
    'copyable' => true,
]);
```

Use `mapAs()` when a column value should be derived from the backend record instead of directly reading the column name:

```php
TextColumn::make(
    'user',
    'User',
    mapAs: fn ($value, User $user) => $user?->full_name,
);
```

Or fluently:

```php
TextColumn::make('user')
    ->label('User')
    ->mapAs(fn ($value, User $user) => $user->full_name);
```

`mapAs()` is backend value mapping, not frontend rendering. The callback is never serialized to the frontend.

Hydrate state from the query string and return a normalized payload:

```php
use Zonvoir\InertiaTable\TableRequest;

$table = new UsersTable;

$payload = $table->payload(TableRequest::fromRequest(request()));
```

If you want multiple tables on the same page, give each table instance an explicit name so their state stays isolated:

```php
$users = UsersTable::make()->named('users');
$jobs = JobsTable::make()->named('jobs');
```

This produces independent query string namespaces such as:

```text
?users[page]=2&users[direction]=asc&users[sort]=name&jobs[page]=3
```

Example payload:

```json
{
    "name": "users",
    "results": {
        "data": [
            {
                "_column_urls": {},
                "_column_images": {},
                "_primary_key": 1,
                "id": 1,
                "name": "Ada Lovelace",
                "_selectable": true,
                "_actions": []
            }
        ],
        "current_page": 1,
        "per_page": 25,
        "from": 1,
        "to": 1,
        "total": 1,
        "last_page": 1,
        "on_first_page": true,
        "on_last_page": true
    },
    "meta": {
        "columns": [],
        "pagination": {},
        "queryString": {}
    },
    "search": [],
    "columns": [
        {
            "type": "text",
            "header": "Name",
            "attribute": "name",
            "sortable": true,
            "toggleable": true,
            "alignment": "left",
            "visibleByDefault": true,
            "meta": {
                "hidden": false,
                "sortable": true,
                "toggleable": true,
                "stickable": false,
                "defaultToSticky": false
            },
            "wrap": false,
            "tooltip": null,
            "truncate": null,
            "headerClass": null,
            "cellClass": null,
            "stickable": false
        }
    ],
    "actions": [],
    "exports": [],
    "state": {
        "columns": {
            "name": true
        },
        "perPage": 25,
        "search": null,
        "sort": "name",
        "sticky": []
    },
    "pagination": true,
    "paginationType": "full",
    "perPageOptions": [
        15,
        25,
        50
    ],
    "defaultPerPage": 25,
    "defaultSort": "name",
    "debounceTime": 300,
    "reloadProps": [],
    "hasActions": false,
    "hasBulkActions": false,
    "hasExports": false,
    "hasExportsThatLimitsToSelectedRows": false,
    "hasFilters": false,
    "hasSearch": true,
    "hasToggleableColumns": true,
    "scrollPositionAfterPageChange": "topOfPage",
    "autofocus": "search",
    "emptyState": false,
    "stickyHeader": false,
    "rowSelectionKey": "id",
    "selectable": true,
    "persistRowSelectionAcrossPages": false,
    "selection": {
        "mode": "page"
    },
    "inDefaultState": true
}
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

## License

Zonvoir Table is open-sourced software licensed under the [Apache License, Version 2.0](LICENSE).
