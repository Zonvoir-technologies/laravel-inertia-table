---
title: Multiple Isolated Tables on One Page
description: Render multiple independent data tables on the same page with isolated query string namespaces, pagination, and sorting state.
---

Zonvoir Table supports rendering multiple tables on the same page without state collisions.

Each table maintains its own isolated query state for pagination, sorting, searching, column visibility, and sticky columns.

## Define multiple tables

When rendering multiple tables, assign each table an explicit query namespace using `named()`:

```php
$users = UsersTable::make()->named('users');
$jobs = JobsTable::make()->named('jobs');
```

You can then pass both tables to your Inertia page:

```php
return inertia('Dashboard', [
    'users' => UsersTable::make()->named('users'),
    'jobs' => JobsTable::make()->named('jobs'),
]);
```

## Render the tables

Pass each table payload to its own `ZonvoirTable` component:

```vue
<script setup lang="ts">
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

defineProps<{
  users: object;
  jobs: object;
}>();
</script>

<template>
  <ZonvoirTable :table="users" />

  <ZonvoirTable :table="jobs" />
</template>
```

## Isolated state

The table name is used as a query string namespace, keeping the state of each table strictly isolated:

```text
?users[page]=2&users[direction]=asc&users[sort]=name&jobs[page]=3
```

In this example:

- `users[page]=2` applies only to the users table.
- `users[direction]=asc&users[sort]=name` applies only to the users table.
- `jobs[page]=3` applies only to the jobs table.

Changing the page or sorting of one table will never overwrite or clear the state of the other table.

## Inferred table names

If you don't provide an explicit name, Zonvoir Table infers one from the table class name:

```php
UsersTable::make();
```

For pages containing a single table, the inferred name is usually sufficient. When rendering multiple tables on the same page, using explicit names with `->named('namespace')` is strongly recommended to guarantee predictable query parameters.

## Related guides

- [Basic Usage](/core-concepts/basic-usage/) — Defining your first table class and Inertia controller.
- [Table Pagination](/core-concepts/pagination/) — Independent pagination controls across tables.
- [Table State & Configuration API](/api/configuration/#tablestate) — Query string namespace structure.
