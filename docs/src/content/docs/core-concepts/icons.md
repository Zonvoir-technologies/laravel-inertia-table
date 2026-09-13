---
title: Icons & Icon Collections
description: Use Heroicons, Lucide, and custom icons across tables, row actions, bulk operations, and empty states using string-based identifiers.
---

Zonvoir Table supports icons using string-based icon identifiers.

Instead of importing icons into your PHP table classes, pass the icon name as a string and let the frontend adapter render it.

## Using an icon

Pass an icon identifier wherever an `icon` option is supported.

```php
->icon('heroicons:user')
```

For example:

```php
TableEmptyState::make(
    title: 'No users found',
    icon: 'heroicons:users',
);
```

## Icon format

Icons use the following format:

```text
collection:icon
```

For example:

```text
heroicons:user
heroicons:users
heroicons:plus
lucide:user
lucide:users
lucide:search
```

The part before `:` identifies the icon collection, while the part after `:` identifies the icon.

```text
heroicons:users
    │        │
    │        └── icon
    │
    └── collection
```

## Empty state icons

Add an icon to an empty state:

```php
use Zonvoir\InertiaTable\TableEmptyState;

public function emptyState(): TableEmptyState
{
    return TableEmptyState::make(
        title: 'No employees found',
        message: 'Create your first employee to get started.',
        icon: 'heroicons:users',
    );
}
```

## Action icons

Actions can also display icons:

```php
Action::make('Add employee')
    ->icon('heroicons:plus')
    ->url(
        (new Url())->route('employees.create')
    );
```

Another action could use a different icon collection:

```php
Action::make('Edit')
    ->icon('lucide:pencil');
```

## Mixing icon collections

You are not limited to a single icon collection.

Different supported collections can be used throughout the same application:

```php
TableEmptyState::make(
    icon: 'heroicons:users',
);
```

```php
Action::make('Edit')
    ->icon('lucide:pencil');
```

```php
Action::make('Delete')
    ->icon('lucide:trash-2');
```

The frontend adapter resolves the icon identifier and renders the appropriate icon.

## Where icons can be used

Icon identifiers can be passed anywhere Zonvoir Table exposes an icon option.

For example:

```php
->icon('heroicons:users')
```

The same string-based format is used consistently across the package, so you don't need to import frontend icon components into your PHP table definitions.

## Related guides

- [Row Actions](/core-concepts/row-actions/) — Using action icons and tooltips.
- [Bulk Actions](/core-concepts/bulk-actions/) — Icons for bulk toolbar operations.
- [Empty States](/core-concepts/empty-state/) — Configuring empty state illustration icons.
- [Typed Columns](/core-concepts/columns/) — Adding icons to column actions and headers.
