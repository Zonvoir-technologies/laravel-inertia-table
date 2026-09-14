---
title: Basic Usage & Table Rendering
description: Define a backend table class in Laravel, pass it from an Inertia controller, and render it with the Vue 3 adapter.
---

A Zonvoir Table starts with a PHP table class that defines your resource, columns, and table behavior. You can either write this class manually or scaffold it using the [Artisan table generator](/core-concepts/generate-tables/).

## Define a table

Create a table by extending `Zonvoir\InertiaTable\Table` and specify the Eloquent model using the `$resource` property.

```php
<?php

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
            TextColumn::make('name')
                ->label('Name')
                ->sortable(),

            TextColumn::make('email')
                ->label('Email')
                ->searchable(),
        ];
    }
}
```

The `$resource` property tells Zonvoir Table which Eloquent model should be used as the table's data source:

```php
protected ?string $resource = User::class;
```

The `columns()` method defines the columns that will be available to the table. See the [Columns guide](/core-concepts/columns/) for all supported column types.

## Pass the table to Inertia

Create the table using `UsersTable::make()` and pass it directly to your Inertia page from your controller:

```php
<?php

namespace App\Http\Controllers;

use App\Tables\UsersTable;
use Inertia\Inertia;
use Inertia\Response;

class UserController
{
    public function index(): Response
    {
        return Inertia::render('Users', [
            'users' => UsersTable::make(),
        ]);
    }
}
```

Zonvoir Table automatically builds the normalized [table payload](/api/payload/) from your PHP definition, ready to be consumed by the frontend adapter.

## Render the table

On your Vue page, import the `ZonvoirTable` component and pass the table payload using the `table` prop:

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

That is enough to render a fully interactive data table with query synchronization.

## Adding more columns

Add additional columns to the `columns()` method as your table grows:

```php
public function columns(): array
{
    return [
        TextColumn::make('id')
            ->label('ID'),

        TextColumn::make('name')
            ->label('Name')
            ->sortable(),

        TextColumn::make('email')
            ->label('Email')
            ->searchable(),
    ];
}
```

Each column can be configured with features such as sorting, searching, visibility, formatting, and other column-specific options.

## Next Steps

With your basic table running, explore these focused guides to add more capability:

- **[Typed Columns](/core-concepts/columns/)**: Format text, badges, booleans, dates, and numbers.
- **[Column Sorting](/core-concepts/sorting/)**: Enable multi-column and custom sort callbacks.
- **[Search Queries](/core-concepts/searching/)**: Configure global and column-level search.
- **[Pagination](/core-concepts/pagination/)**: Set up standard, simple, or cursor pagination.
- **[Row Actions & Links](/core-concepts/row-actions/)**: Add edit, view, and custom row actions.
- **[Bulk Actions](/core-concepts/bulk-actions/)**: Execute operations on multiple selected rows.
- **[Column Visibility](/core-concepts/toggle-columns/)**: Let users show or hide optional columns.
- **[Sticky Columns](/core-concepts/sticky-columns/)**: Fix important columns during horizontal scroll.
- **[Excel Exports](/core-concepts/exports/)**: Add filtered and selected-row spreadsheet downloads.
- **[Empty States](/core-concepts/empty-state/)**: Display friendly messages when zero records match.
- **[Multiple Tables](/core-concepts/multiple-tables/)**: Render multiple isolated tables on a single page.
- **[Vue Slots](/advanced/slots/) & [Styling](/advanced/styling/)**: Customize the visual appearance and layout.
