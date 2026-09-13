---
title: Empty States & Zero-Record Views
description: Customize what users see when a table has no records to display with custom titles, messages, icons, and action buttons.
---

Zonvoir Table displays an empty state when query results return zero records.

Use `TableEmptyState` to customize the title, message, [icon](/core-concepts/icons/), and call-to-action button displayed by the table.

## Define an empty state

Return a `TableEmptyState` from your table's `emptyState()` method.

```php
use Zonvoir\InertiaTable\TableEmptyState;

public function emptyState(): TableEmptyState
{
    return TableEmptyState::make(
        title: 'No users found',
        message: 'There are no users to display yet.',
        icon: 'heroicons:users',
    );
}
```

This configuration is included in the table payload and rendered by the frontend adapter when the table has no rows.

## Default empty state

You can use the default empty state without providing any configuration:

```php
public function emptyState(): TableEmptyState
{
    return TableEmptyState::make();
}
```

The default title is:

```text
No results found.
```

The message, icon, and action are `null` unless configured.

## Customize the title

Set the primary empty-state message using `title`:

```php
return TableEmptyState::make(
    title: 'No users found',
);
```

You can also configure it fluently:

```php
return TableEmptyState::make()
    ->title('No users found');
```

## Add a message

Use `message` to provide additional context or guidance.

```php
return TableEmptyState::make(
    title: 'No users found',
    message: 'Create your first user to get started.',
);
```

Or with the fluent API:

```php
return TableEmptyState::make()
    ->title('No users found')
    ->message('Create your first user to get started.');
```

## Add an icon

Use `icon` to display an icon with the empty state.

```php
return TableEmptyState::make(
    title: 'No users found',
    message: 'Create your first user to get started.',
    icon: 'heroicons:users',
);
```

The icon value is passed to the frontend adapter for rendering.

## Add an action

An empty state can include an `Action`, allowing users to take the next logical step directly from the table.

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\TableEmptyState;
use Zonvoir\InertiaTable\Url;

public function emptyState(): TableEmptyState
{
    return TableEmptyState::make(
        title: 'No users found',
        message: 'Create your first user to get started.',
        icon: 'heroicons:users',
        action: Action::make('Add user')
            ->url(
                (new Url())->route('users.create')
            )
            ->icon('heroicons:plus'),
    );
}
```

This is useful when the empty state has a clear next step, such as creating the first record.

## Fluent configuration

`TableEmptyState` can also be configured entirely using its fluent methods.

```php
public function emptyState(): TableEmptyState
{
    return TableEmptyState::make()
        ->title('No users found')
        ->message('Create your first user to get started.')
        ->icon('heroicons:users')
        ->action(
            Action::make('Add user')
                ->url(
                    (new Url())->route('users.create')
                )
                ->icon('heroicons:plus')
        );
}
```

Both approaches produce the same empty-state configuration.

## Complete example

A table can define its columns and empty state together:

```php
<?php

namespace App\Tables;

use App\Models\User;
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableEmptyState;
use Zonvoir\InertiaTable\Url;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('name')
                ->sortable()
                ->searchable(),

            TextColumn::make('email')
                ->searchable(),
        ];
    }

    public function emptyState(): TableEmptyState
    {
        return TableEmptyState::make(
            title: 'No users found',
            message: 'Create your first user to get started.',
            icon: 'heroicons:users',
            action: Action::make('Add user')
                ->url(
                    (new Url())->route('users.create')
                )
                ->icon('heroicons:plus'),
        );
    }
}
```

## Available options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `?string` | `No results found.` | Main empty-state heading. |
| `message` | `?string` | `null` | Additional information displayed below the title. |
| `icon` | `?string` | `null` | Icon passed to the frontend adapter. |
| `action` | `?Action` | `null` | Action displayed with the empty state. |

All options can be passed to `TableEmptyState::make()` or configured using their corresponding fluent methods.

## Related guides

- [Icons](/core-concepts/icons/) — Supported icon syntax, Heroicons, and Lucide collections.
- [Row Actions](/core-concepts/row-actions/) — Action buttons, URLs, and confirmation dialogs.
- [Vue Slots](/advanced/slots/) — Overriding empty state markup using the `#empty` slot.
- [Configuration API](/api/configuration/#tableemptystate) — `TableEmptyState` class signature.
