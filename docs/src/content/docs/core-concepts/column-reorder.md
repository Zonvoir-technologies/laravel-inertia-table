---
title: Column Reordering & Persistence
description: Interactive drag-and-drop table column reordering with per-user database persistence across sessions in Laravel and Inertia.
---

:::tip[Zonvoir Table Pro Feature]
Column Reordering & Persistence is a premium capability included with **Zonvoir Table Pro**. It provides interactive header drag-and-drop, dropdown reordering handles, per-user database persistence, and one-click reset to default order.
:::

Zonvoir Table Pro allows users to customize the visual order of table columns directly from the user interface. Column preferences are automatically saved to the database for the authenticated user and restored seamlessly whenever the table is loaded.

---

## Key Features

- **Header Drag-and-Drop**: Click and drag any table header cell (`<th>`) horizontally to rearrange columns on the fly.
- **Dropdown Reorder Handles**: Drag columns up and down in the **Columns** visibility menu using intuitive grip handles.
- **Per-User Database Persistence**: Custom layouts are persisted to the `zonvoir_table_user_preferences` database table for each authenticated user across browsers and devices.
- **Automatic Fallback & Restoration**: When new columns are added to your table definition in code, they are gracefully appended after the user's saved column preferences without breaking the layout.
- **One-Click Reset**: Users can delete their saved order and restore the PHP-defined order on the next table response.
- **Debounced Network Requests**: Changes are saved after a 300ms debounce and use Laravel's `XSRF-TOKEN` cookie when available.
- **Searchable Columns Menu**: Users can search the visibility menu by column label or attribute before toggling or reordering columns.

---

## Installation & Setup

:::tip[Single Vue Package]
On the frontend, **no extra packages are needed**. The single `@zonvoir/inertia-table-vue` package includes full built-in support for column reordering, drag-and-drop handles, persistence composables, and filter interfaces out of the box.
:::

### 1. Run Migrations

Zonvoir Table Pro ships with a migration that creates the `zonvoir_table_user_preferences` table. Run the database migration:

```bash
php artisan migrate
```

Package migrations are loaded automatically. Publish them only when you need to customize the schema:

```bash
php artisan vendor:publish --tag=zonvoir-table-pro-migrations
```

This table uses polymorphic columns (`user_type`, `user_id`) to associate preferences with any authenticatable model:

```sql
CREATE TABLE zonvoir_table_user_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_type VARCHAR(255) NULL,
    user_id VARCHAR(255) NULL,
    table_name VARCHAR(255) NOT NULL,
    columns JSON NULL,
    settings JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY (user_type, user_id, table_name)
);
```

### 2. Configuration Options

Publish or inspect your `config/zonvoir-table.php` configuration file:

```bash
php artisan zon-table-pro:publish-config
```

```php
return [
    'features' => [
        // Master toggle for column reordering
        'column_reordering' => true,
    ],

    'persistence' => [
        // Enable or disable database preference persistence
        'enabled' => true,

        // Database table name for stored user preferences
        'table_name' => 'zonvoir_table_user_preferences',

        // Middleware applied to persistence preference endpoints
        'middleware' => ['web'],
    ],
];
```

---

## Enabling in Table Classes

Tables can enable column reordering and database persistence using either `HasProFeatures` (all Pro features) or `HasColumnPersistence` (column reordering only):

| Trait | Best For | What it Includes |
| --- | --- | --- |
| `HasColumnPersistence` | Tables needing **only column reordering & persistence** | Header drag-and-drop, toggle dropdown handles, per-user database persistence, reset endpoints |
| `HasProFeatures` | Tables needing **all Pro capabilities** | Includes `HasColumnPersistence` + `HasFilters` (column reordering & database persistence + advanced filters) |

### 1. Using HasProFeatures (All Pro Features)

Tables using the `HasProFeatures` trait automatically have column reordering, database persistence, and advanced filters enabled:

```php
namespace App\Tables;

use App\Models\User;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTablePro\Concerns\HasProFeatures;

class UsersTable extends Table
{
    use HasProFeatures; // <-- Includes both filters and column persistence

    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('id')->label('ID'),
            TextColumn::make('name')->searchable()->sortable(),
            TextColumn::make('email')->searchable(),
            TextColumn::make('status'),
            TextColumn::make('created_at')->label('Joined'),
        ];
    }
}
```

### 2. Using HasColumnPersistence Directly (Column Reordering Only)

If you prefer to include only column persistence and drag-and-drop without the filter engine, use the `HasColumnPersistence` trait:

```php
namespace App\Tables;

use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTablePro\Concerns\HasColumnPersistence;

class OrdersTable extends Table
{
    use HasColumnPersistence; // <-- Only column reordering & persistence

    // ...
}
```

:::tip[Trait Flexibility & Zero Collisions]
- **All Pro features**: Use `use HasProFeatures;`.
- **Column reordering only**: Use `use HasColumnPersistence;`.
- **Filters only**: Use `use HasFilters;`.
- **Both traits together**: You can also write `use HasColumnPersistence;` and `use HasFilters;` on the same table. All traits share a unified architecture with zero method collisions.
:::

---

## Table Identification

Column preferences are stored uniquely per user and table identifier.

By default, persistence uses the table's `name()`. An explicitly named table takes priority; otherwise the core package derives a kebab-case identifier from the class name with the `Table` suffix removed. For example, `UsersTable` becomes `users`.

Use `named()` when the same table class appears more than once on a page or represents different saved layouts:

```php
$table = UsersTable::make()->named('admin-users');
```

You can override `persistenceIdentifier()` to provide custom naming logic:

```php
class UsersTable extends Table
{
    use HasProFeatures;

    public function persistenceIdentifier(): string
    {
        return 'users-directory-table';
    }
}
```

:::caution
The identifier is stored with the authenticated user's preference record. Keep it stable after release, or existing saved orders will no longer be found.
:::

---

## Disabling or Overriding Persistence

You can conditionally enable or disable persistence on individual table instances using fluent chainable methods:

```php
// Disable persistence on this instance
$table = UsersTable::make()->withoutColumnPersistence();

// Explicitly toggle persistence
$table = UsersTable::make()->withColumnPersistence(false);
```

You can check whether persistence is currently active via `persistsColumns()`:

```php
if ($table->persistsColumns()) {
    // Column persistence is active
}
```

---

## How It Works Under the Hood

### Backend Resolution

When a table request is rendered:
1. `savedColumnOrder()` checks if an authenticated user exists (`auth()->user()`).
2. If a saved preference exists in the database for this table, `applyColumnOrder()` reorganizes the `columnsDefinition()` to match the saved attribute sequence.
3. Any newly added columns defined in code that are not present in the saved sequence are safely appended to the end of the column list.
4. The payload receives top-level `reorderable: true` and the following `meta` values:
   - `reorderable: true`
   - `preferenceEndpoint: '/zonvoir-table/preferences'`
   - `preferenceResetEndpoint: '/zonvoir-table/preferences'`

The endpoint metadata is included when the corresponding named routes are registered.

### Frontend Interactivity

Column reordering and persistence interactivity are built directly into `@zonvoir/inertia-table-vue`:
1. **Header Drag-and-Drop**: `TableHeader` activates HTML5 drag-and-drop events on header cells. As a user drags a header, drop indicators appear on the left or right of target columns (`border-l-4` / `border-r-4`).
2. **Dropdown Reorder Handles**: `ToggleColumnsDropdown` activates vertical drag-and-drop on column rows with visual insertion lines (`border-t-2` / `border-b-2`).
3. **Instant Optimistic Updates**: Reordering triggers `tableApi.reorderColumns(updatedKeys)` to immediately refresh the table UI without waiting for network latency.
4. **Automatic Persistence**: Simultaneously, the `useColumnPersistence` composable sends an asynchronous `POST` request to the configured preference endpoint (debounced by 300ms) with the updated order array.

---

## Resetting to Default Order

Users can reset their column order at any time:

1. Open the **Columns** visibility dropdown.
2. Click **Reset to default order** at the bottom of the dropdown.

This sends an authenticated `DELETE` request to `/zonvoir-table/preferences` with the table identifier and clears the database record for the user. The default order defined in the PHP table class is restored the next time the table payload is returned by the server, such as after a reload or Inertia visit.

---

## Custom Frontend Integration

If you are building custom table header or column toggle components, you can leverage the `useColumnPersistence` composable directly:

```vue
<script setup lang="ts">
import { useColumnPersistence } from '@zonvoir/inertia-table-vue';
import type { TableDefinition } from '@zonvoir/inertia-table-vue';

const props = defineProps<{
  table: TableDefinition;
}>();

const { persistColumnOrder, resetColumnOrder, isSaving } = useColumnPersistence({
  table: props.table,
  debounceMs: 500, // optional custom debounce duration
});

const onColumnsReordered = async (newOrder: string[]) => {
  const success = await persistColumnOrder(newOrder);

  if (!success) {
    // Show an error or retry from your custom UI.
  }
};

const onResetClicked = async () => {
  const success = await resetColumnOrder();

  if (success) {
    // Reload or revisit the table to receive its PHP-defined order.
  }
};
</script>
```

---

## API Endpoints & Security

The Pro package automatically registers two secure endpoints under the `/zonvoir-table` prefix:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/zonvoir-table/preferences` | Stores or updates column ordering preferences for the authenticated user |
| `DELETE` | `/zonvoir-table/preferences` | Deletes stored preferences, restoring the default column layout |

### Security & Authentication

- Both routes are protected by the `AuthenticateTablePreferences` middleware in addition to the configured route middleware group (default: `['web']`).
- Unauthenticated requests are rejected immediately with a `401 Unauthorized` JSON response (`{"success": false, "message": "Unauthenticated."}`).
- The store payload requires a `table` string (maximum 255 characters) and a `columns` array (maximum 100 string keys, each no longer than 255 characters). Optional `settings` accepts up to 50 entries.
- Reset requests require the same `table` identifier in the JSON body.
- Queries are strictly scoped to the authenticated user's morph identifier (`auth()->user()`). Users cannot view or modify preferences belonging to other accounts.
- The Vue composable sends same-origin credentials and forwards Laravel's `XSRF-TOKEN` cookie as the `X-XSRF-TOKEN` header when present.

:::note
An authenticated user is required for database persistence. Without one, the preference endpoints return `401`, even if client-side drag-and-drop is visible.
:::
