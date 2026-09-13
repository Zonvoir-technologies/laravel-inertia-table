---
title: Table Searching & Filter Queries
description: Filter Eloquent table records in Laravel with global search inputs, column-level search, and custom searchUsing query callbacks.
---

Zonvoir Table provides built-in search for filtering records from the table.

You can define searchable fields at the table level, mark individual columns as searchable, or use `searchUsing()` when you need custom query behavior.

## Define searchable fields

Use the `$search` property to define which fields should be searched.

```php
class UsersTable extends Table
{
    protected array|string|null $search = [
        'name',
        'email',
    ];
}
```

When a user enters a search term, Zonvoir Table searches across the configured fields.

For example, searching for:

```text
john
```

can match a user's name or email address.

## Search a single field

When the table should search only one field, you can provide a string instead of an array.

```php
class UsersTable extends Table
{
    protected array|string|null $search = 'name';
}
```

## Searchable columns

Columns can also opt into search using `searchable()`.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('email')
    ->searchable();
```

A typical table might make several columns searchable:

```php
public function columns(): array
{
    return [
        TextColumn::make('name')
            ->sortable()
            ->searchable(),

        TextColumn::make('email')
            ->searchable(),

        TextColumn::make('phone')
            ->searchable(),
    ];
}
```

This keeps search behavior close to the column definition.

## Custom search

Use `searchUsing()` when a column needs custom query logic.

```php
TextColumn::make('name')
    ->searchable()
    ->searchUsing(
        fn ($query, string $term) => $query
            ->where('name', 'like', "%{$term}%")
    );
```

The callback receives the table query and the current search term.

```php
fn ($query, string $term) => //
```

This gives you full control over how the search is applied.

## Searching relationships

`searchUsing()` can also be used when the displayed value comes from a relationship.

```php
TextColumn::make('company.name')
    ->label('Company')
    ->searchable()
    ->searchUsing(
        fn ($query, string $term) => $query
            ->whereHas('company', fn ($query) => $query
                ->where('name', 'like', "%{$term}%")
            )
    );
```

The table still displays the company name while the search is applied through the relationship query.

## Searching computed values

When a displayed value does not directly correspond to a database column, define how it should be searched with `searchUsing()`.

```php
TextColumn::make('full_name')
    ->label('Name')
    ->mapAs(
        fn ($value, User $user) =>
            "{$user->first_name} {$user->last_name}"
    )
    ->searchable()
    ->searchUsing(
        fn ($query, string $term) => $query
            ->where(function ($query) use ($term) {
                $query
                    ->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%");
            })
    );
```

This allows the frontend to display a computed value while the backend controls how that value is searched.

## Searching and `mapAs()`

`mapAs()` transforms the value sent to the frontend. It does not automatically change how the database search is performed.

```php
TextColumn::make('name')
    ->mapAs(fn ($value) => strtoupper($value))
    ->searchable();
```

The displayed value may be transformed, while searching continues to operate against the configured backend field.

Use `searchUsing()` when the displayed value requires different search behavior.

## Search state

The current search term is stored in the query string so searches can survive navigation and page reloads.

For example:

```text
?search=john
```

When multiple named tables are rendered on the same page, each table keeps its search state isolated.

```text
?users[search]=john&jobs[search]=developer
```

The query string key is included in the table payload and handled automatically by the frontend adapter.
