---
title: Toggle Columns & Visibility Controls
description: Configure column visibility defaults and user-controllable column toggle dropdowns in Zonvoir Table.
---

Zonvoir Table allows users to show and hide columns without changing the table definition.

Columns are **visible** and **toggleable** by default.

## Hide a column by default

Use `visible(false)` when a column should be hidden initially but still available from the column toggle menu.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('email')
    ->visible(false);
```

Users can still enable the column from the table's column visibility controls.

## Disable toggling

Use `toggleable(false)` when a column should not be shown in the column toggle menu.

```php
TextColumn::make('id')
    ->toggleable(false);
```

This is useful for columns that should always remain part of the table, such as identifiers or important row information.

## Always visible

Combine the default visibility with `toggleable(false)` to keep a column permanently visible.

```php
TextColumn::make('name')
    ->visible()
    ->toggleable(false);
```

The column is displayed and users cannot hide it.

## Hidden but not toggleable

You can also define a column that is hidden and unavailable from the toggle menu.

```php
TextColumn::make('internal_reference')
    ->visible(false)
    ->toggleable(false);
```

This can be useful when a column is part of the table definition but should not currently be displayed to users.

## Example

A typical table might keep the primary information visible while making secondary information optional.

```php
public function columns(): array
{
    return [
        TextColumn::make('id')
            ->label('ID')
            ->toggleable(false),

        TextColumn::make('name')
            ->sortable()
            ->searchable()
            ->toggleable(false),

        TextColumn::make('email')
            ->searchable(),

        TextColumn::make('phone')
            ->visible(false),

        TextColumn::make('address')
            ->visible(false),
    ];
}
```

In this example, `id` and `name` cannot be hidden, while `email`, `phone`, and `address` can be controlled by the user.

## URL persistence

Column visibility is persisted in the query string, allowing the current table view to survive navigation and page reloads.

For example, when `phone` and `address` are hidden, the table can persist those column keys in its URL state.

```text
?columns[]=phone&columns[]=address
```

When multiple tables are rendered on the same page, the column state is scoped to the table's query string namespace.

```text
?users[columns][]=phone&users[columns][]=address
```

This keeps column visibility independent between tables.
