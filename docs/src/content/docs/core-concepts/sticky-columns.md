---
title: Sticky Columns & Fixed Table Headers
description: Keep table headers and critical columns fixed during horizontal and vertical scrolling in Zonvoir Table.
---

Sticky headers and columns help keep important table information visible while users scroll through larger datasets.

Zonvoir Table supports sticky behavior for both the table header and individual columns.

## Sticky header

Enable the sticky table header using the `$stickyHeader` property.

```php
class UsersTable extends Table
{
    protected ?bool $stickyHeader = true;
}
```

When enabled, the table header remains visible while scrolling vertically through the table.

This is especially useful for tables with many rows, where users may otherwise lose track of what each column represents.

## Sticky columns

Use `sticky()` on a column to keep it visible while the table is scrolled horizontally.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('name')
    ->sticky();
```

Sticky columns are useful for important identifying information that should remain visible while users inspect other fields.

For example:

```php
public function columns(): array
{
    return [
        TextColumn::make('name')
            ->label('Name')
            ->sticky(),

        TextColumn::make('email'),

        TextColumn::make('phone'),

        TextColumn::make('department'),

        TextColumn::make('location'),
    ];
}
```

When the table becomes wider than its container, the `name` column remains visible while the other columns scroll horizontally.

## Multiple sticky columns

You can mark more than one column as sticky.

```php
public function columns(): array
{
    return [
        TextColumn::make('id')
            ->label('ID')
            ->sticky(),

        TextColumn::make('name')
            ->sticky(),

        TextColumn::make('email'),

        TextColumn::make('phone'),

        TextColumn::make('department'),
    ];
}
```

The frontend adapter automatically calculates the position of sticky columns so they can remain aligned next to each other.

## Sticky header and columns together

Sticky headers and columns can be enabled independently or used together.

```php
class UsersTable extends Table
{
    protected ?bool $stickyHeader = true;

    public function columns(): array
    {
        return [
            TextColumn::make('name')
                ->sticky(),

            TextColumn::make('email'),

            TextColumn::make('phone'),

            TextColumn::make('department'),
        ];
    }
}
```

This keeps the column headings visible during vertical scrolling and the `name` column visible during horizontal scrolling.

## Sticky column state

Sticky column changes can be persisted in the table's URL state.

This allows a user's sticky column configuration to survive navigation and page reloads.

When multiple named tables are rendered on the same page, each table keeps its sticky column state isolated.
