# Zonvoir Table

Foundation package for a reusable Laravel + Inertia table system with framework-specific frontend adapters.

## Requirements

PHP 8.3+
Laravel 11, 12, or 13
Inertia.js 2.x or 3.x
Vue 3.4+
Tailwind CSS 3.4+ or 4.0+

## Structure

- `src/`: Laravel package core, including package config
- `vue/`: standalone Vue adapter package
- `docs/`: architecture, release, and roadmap notes

## Local Development

### PHP package

```bash
composer install
composer test
```

### Vue adapter

```bash
cd vue
npm install
npm run build
npm run test
```

## Foundation Guarantees

- Laravel package auto-discovers through Composer, publishes config from `src/config`, and exposes its core service through the service provider
- Backend tables can be declared by extending `Zonvoir\InertiaTable\Table` with registered columns, typed default state, request hydration, and normalized payload transport
- Vue builds as an independent adapter package
- A local checklist is available in `docs/PRE_PUSH_CHECKLIST.md` before publishing

## Backend Table Definition

```php
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableState;

class UsersTable extends Table
{
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

    public function defaultState(): TableState
    {
        return new TableState(
            perPage: 25,
            sort: 'name',
        );
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
?users[page]=2&users[sort]=name&jobs[page]=3
```

Example payload:

```json
{
  "name": "users",
  "state": {
    "page": 1,
    "perPage": 25,
    "sort": "name",
    "direction": "asc"
  },
  "meta": {
    "columns": [
      {
        "key": "name",
        "name": "name",
        "type": "text",
        "label": "Name",
        "visible": true,
        "sortable": true,
        "searchable": false,
        "toggleable": true,
        "sticky": false,
        "alignment": null,
        "width": null,
        "minWidth": null,
        "maxWidth": null,
        "labelClass": null,
        "cellClass": null,
        "defaultValue": null,
        "export": [],
        "meta": {}
      }
    ]
  }
}
```

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

### Local Development / Monorepo Linking

If developing locally or linking directly from a local path:

If the package lives inside your Laravel app:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "packages/laravel-inertia-table",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

If your Laravel app and this package are sibling folders, for example:

```text
Herd/
  my-laravel-app/
  laravel-inertia-table/
```

Use the sibling path instead:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../laravel-inertia-table",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

Then require the Laravel package:

```bash
composer require zonvoir/laravel-inertia-table:@dev
```

Build the Vue adapter before installing it into your Laravel app:

```bash
cd ../laravel-inertia-table/vue
npm install
npm run build
```

Then install the Vue adapter from your Laravel app.

If the package lives inside your Laravel app:

```bash
npm install ./packages/laravel-inertia-table/vue
```

If your Laravel app and this package are sibling folders:

```bash
npm install ../laravel-inertia-table/vue
```

Import it in your app:

```ts
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';
```

Configure Tailwind to scan the package so it generates the utility classes used by the components.

For Tailwind CSS 4:

```css
@import "tailwindcss";

@source "../../vendor/zonvoir/laravel-inertia-table/vue/**/*.{js,vue}";
```

For Tailwind CSS 3.4, add the package path to `content` in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/**/*.{blade.php,js,ts,vue}',
    './vendor/zonvoir/laravel-inertia-table/vue/**/*.{js,vue}',
  ],
};
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
