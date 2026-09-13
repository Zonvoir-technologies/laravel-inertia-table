---
title: Bulk Actions & Multi-Row Operations
description: Configure bulk actions on selected table rows in Zonvoir Table with chunking, confirmation modals, and backend execution handlers.
---

Bulk actions let users select multiple rows and perform an action against all selected records at once.

Bulk actions use the same `Action` class as row actions, so options such as icons, variants, colors, and confirmation can be shared between them.

## Create a bulk action

Use `asBulkAction()` to make an action available for selected rows.

```php
use Zonvoir\InertiaTable\Action;

Action::make('Archive selected')
    ->asBulkAction()
    ->handle(
        fn ($records) => $records->each->archive()
    );
```

When rows are selected, the action becomes available from the table's bulk action area.

The handler receives the selected records.

## Row and bulk action

`asBulkAction()` makes an existing action available as a bulk action while still allowing it to be used as a row action.

```php
Action::make('Archive')
    ->icon('mdi:archive')
    ->asBulkAction()
    ->handle(
        fn ($records) => $records->each->archive()
    );
```

Use this when the same operation should be available for both an individual record and multiple selected records.

## Bulk-only actions

Use `onlyAsBulkAction()` when an action should appear only when rows are selected.

```php
Action::make('Delete selected')
    ->onlyAsBulkAction()
    ->asDangerButton()
    ->confirm('Delete selected records?')
    ->handle(
        fn ($records) => $records->each->delete()
    );
```

The action will not appear as an individual row action.

This is useful for operations that only make sense when working with a selection.

## `asBulkAction()` vs `onlyAsBulkAction()`

| Method | Row action | Bulk action |
| --- | :---: | :---: |
| `asBulkAction()` | ✓ | ✓ |
| `onlyAsBulkAction()` | — | ✓ |

For example, an archive operation might be useful both individually and in bulk:

```php
Action::make('Archive')
    ->asBulkAction()
    ->handle(
        fn ($records) => $records->each->archive()
    );
```

While an operation specifically designed around a selection can remain bulk-only:

```php
Action::make('Delete selected')
    ->onlyAsBulkAction()
    ->handle(
        fn ($records) => $records->each->delete()
    );
```

## Confirmation

Bulk operations can affect many records at once, so destructive actions should usually require confirmation.

```php
Action::make('Delete selected')
    ->onlyAsBulkAction()
    ->asDangerButton()
    ->confirm(
        'Delete selected records?',
        'This action cannot be undone.'
    )
    ->handle(
        fn ($records) => $records->each->delete()
    );
```

The frontend adapter displays the confirmation before the action is submitted.

## Processing strategy

Bulk actions can process selected records in chunks.

Specify the strategy when configuring the bulk action:

```php
Action::make('Delete selected')
    ->onlyAsBulkAction(strategy: 'chunk')
    ->handle(
        fn ($records) => $records->each->delete()
    );
```

Supported strategies are:

| Strategy | Description |
| --- | --- |
| `chunkById` | Processes records in chunks using their IDs. |
| `chunk` | Processes records using standard chunking. |

The default strategy is `chunkById`.

If an unsupported strategy is provided, Zonvoir Table falls back to `chunkById`.

## Chunk by ID

For most bulk actions, `chunkById` is the recommended strategy.

```php
Action::make('Archive selected')
    ->onlyAsBulkAction(strategy: 'chunkById')
    ->handle(
        fn ($records) => $records->each->archive()
    );
```

Processing records in chunks avoids loading a large selection into memory at once.

## Standard chunking

Use the `chunk` strategy when standard query chunking is more appropriate for your operation.

```php
Action::make('Archive selected')
    ->onlyAsBulkAction(strategy: 'chunk')
    ->handle(
        fn ($records) => $records->each->archive()
    );
```

## Complete example

Bulk actions are returned from the same `actions()` method as row actions.

```php
public function actions(): array
{
    return [
        Action::make('Edit')
            ->icon('mdi:pencil')
            ->url(
                fn (User $user, Url $url) =>
                    $url->route('users.edit', $user)
            ),

        Action::make('Archive')
            ->icon('mdi:archive')
            ->asBulkAction()
            ->confirm(
                'Archive selected records?',
                'You can restore them later.'
            )
            ->handle(
                fn ($records) => $records->each->archive()
            ),

        Action::make('Delete selected')
            ->icon('lucide:trash-2')
            ->onlyAsBulkAction(strategy: 'chunkById')
            ->asDangerButton()
            ->confirm(
                'Delete selected records?',
                'This action cannot be undone.'
            )
            ->handle(
                fn ($records) => $records->each->delete()
            ),
    ];
}
```

In this example:

- **Edit** is available for individual rows.
- **Archive** is available as both a row and bulk action.
- **Delete selected** appears only as a bulk action.

## Related guides

- [Row Actions](/core-concepts/row-actions/)
- [Icons](/core-concepts/icons/)
- [Columns](/core-concepts/columns/)
- [Exports](/core-concepts/exports/)
