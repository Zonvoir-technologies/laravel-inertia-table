---
title: Introduction & Overview
description: 'A practical overview of Zonvoir Table for Laravel and Inertia Vue: expressive PHP classes, typed columns, live search, sorting, and UI adapters.'
---

Zonvoir Table helps you build data tables for Laravel and Inertia applications without scattering table behavior across controllers, query strings, and frontend components.

You define the table once in PHP: its query, columns, search behavior, sorting, pagination, actions, exports, and UI metadata. The frontend adapter receives a predictable payload and renders the interactive table experience.

## What You Get

Zonvoir Table is designed for application tables that need to do more than display rows.

- **[Backend table classes](/core-concepts/generate-tables/)** keep query behavior, columns, state, actions, and exports in one place.
- **[Typed columns](/core-concepts/columns/)** describe text, numeric, boolean, badge, image, date, date-time, and action cells.
- **[Search](/core-concepts/searching/) and [sorting](/core-concepts/sorting/)** are applied through the backend query layer, with URL state for predictable navigation.
- **[Pagination controls](/core-concepts/pagination/)** support standard, simple, and cursor pagination flows.
- **[Column visibility](/core-concepts/toggle-columns/) and [sticky columns](/core-concepts/sticky-columns/)** let users scan wide datasets without losing important context.
- **[Row actions](/core-concepts/row-actions/) and [bulk actions](/core-concepts/bulk-actions/)** provide interactive workflows from the table surface.
- **[Excel exports](/core-concepts/exports/)** can be limited to filtered rows or selected rows.
- **[Vue 3 adapter support](/api/frontend-api/)** renders the normalized table payload in Inertia-powered pages.

## Why It Exists

Most tables start simple, then slowly collect behavior: filters, sorting, row links, actions, bulk operations, exports, hidden columns, sticky columns, and URL state.

Zonvoir Table gives those concerns a home. Instead of rebuilding the same table plumbing on every page, you create a table class that explains how the resource should behave.

## Example

Create a table class for your resource:

```php
use App\Models\User;
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    protected ?string $defaultSort = 'name';

    public function columns(): array
    {
        return [
            TextColumn::make('name', 'Full Name')
                ->searchable()
                ->sortable()
                ->sticky(),

            TextColumn::make('email')
                ->searchable(),

            BadgeColumn::make('status')
                ->colors(['active' => 'success'])
                ->solid(),
        ];
    }
}
```

Render the table payload with the frontend adapter:

```vue
<script setup lang="ts">
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

const props = defineProps<{
  users: object;
}>();
</script>

<template>
  <ZonvoirTable :table="props.users" />
</template>
```

## Core Idea

Define table behavior once on the backend, then send a stable payload to the frontend. Laravel owns the data and query rules. The adapter owns rendering and browser interaction.

## Next Steps

- Check [Requirements](/getting-started/requirements/) for supported PHP, Laravel, and Vue versions.
- Follow [Installation](/getting-started/installation/) to install the Composer and npm packages.
- Read [Basic Usage](/core-concepts/basic-usage/) to configure your first table controller and Vue page.
- Explore [Table Generation](/core-concepts/generate-tables/) to scaffold table classes with Artisan.
