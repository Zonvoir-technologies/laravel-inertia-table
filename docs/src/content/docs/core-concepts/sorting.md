---
title: Column Sorting & Order Queries
description: Configure column sorting, default sort directions, and custom sortUsing Eloquent query callbacks in Zonvoir Table.
---

Zonvoir Table supports sorting directly from column headers.

Only columns explicitly marked as sortable can be used to sort the table.

## Make a column sortable

Use `sortable()` on any column that should support sorting.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('name')
    ->sortable();
```

You can make multiple columns sortable:

```php
public function columns(): array
{
    return [
        TextColumn::make('name')
            ->sortable(),

        TextColumn::make('email')
            ->sortable(),

        DateTimeColumn::make('created_at')
            ->label('Created')
            ->sortable(),
    ];
}
```

Users can then sort the table by interacting with the corresponding column headers.

## Sort direction

Sorting supports both ascending and descending directions. In the browser URL, the active sort state is always persisted using separate `direction` and `sort` query parameters:

For ascending order:

```text
?direction=asc&sort=created_at
```

For descending order:

```text
?direction=desc&sort=created_at
```

The frontend adapter handles switching between sort directions when the user interacts with a sortable column header.

### Ascending by default

```php
class UsersTable extends Table
{
    protected ?string $defaultSort = 'created_at';
}
```

When active or clicked, the URL will persist as:

```text
?direction=asc&sort=created_at
```

### Descending by default

Prefix the column name with `-` when the newest records should appear first:

```php
class UsersTable extends Table
{
    protected ?string $defaultSort = '-created_at';
}
```

While `$defaultSort = '-created_at'` provides a convenient shorthand on the backend, the URL in the browser will always persist as:

```text
?direction=desc&sort=created_at
```

## Custom sorting

For simple columns, Zonvoir Table can apply the sort directly to the underlying query.

Sometimes the displayed column does not map directly to a sortable database column. Use `sortUsing()` when you need to control how the query is ordered.

```php
TextColumn::make('company.name')
    ->sortable()
    ->sortUsing(
        fn ($query, string $direction) => $query
            ->orderBy('companies.name', $direction)
    );
```

The callback receives the table query and the requested sort direction.

```text
asc
desc
```

This gives you full control over the query while keeping the normal sorting experience on the frontend.

## Sorting computed values

`sortUsing()` is also useful when a displayed value is generated or mapped from other fields.

```php
TextColumn::make('full_name')
    ->sortable()
    ->sortUsing(
        fn ($query, string $direction) => $query
            ->orderBy('first_name', $direction)
            ->orderBy('last_name', $direction)
    );
```

The table can display `full_name` while the database query determines how that value should actually be sorted.

## Sorting and `mapAs()`

`mapAs()` changes the value sent to the frontend, but it does not automatically change how the database query is sorted.

```php
TextColumn::make('name')
    ->mapAs(fn ($value) => strtoupper($value))
    ->sortable();
```

The displayed value may be transformed, while sorting continues to use the underlying `name` field.

When the displayed value requires different sorting behavior, combine it with `sortUsing()`.

```php
TextColumn::make('company')
    ->mapAs(fn ($value, User $user) => $user->company->name)
    ->sortable()
    ->sortUsing(
        fn ($query, string $direction) => $query
            ->orderBy('companies.name', $direction)
    );
```

## URL persistence

The active sort is stored in the query string so the current ordering survives navigation and page reloads. The state is always persisted as explicit `direction` and `sort` parameters:

For ascending order:

```text
?direction=asc&sort=created_at
```

For descending order:

```text
?direction=desc&sort=created_at
```

When multiple named tables are rendered on the same page, each table keeps its sorting state isolated within its own namespace:

```text
?users[direction]=asc&users[sort]=name&jobs[direction]=desc&jobs[sort]=created_at
```

Only declared sortable columns are accepted as sort keys, preventing arbitrary query parameters from sorting fields that your table has not exposed.
