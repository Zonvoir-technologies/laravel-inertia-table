---
title: Row Actions & Interactive Menus
description: Add links, backend handlers, confirmation modals, and action dropdowns to individual table rows in Zonvoir Table.
---

Row actions let users perform operations on a specific record directly from the table.

Define row actions by returning `Action` objects from your table's `actions()` method.

Use [`ActionColumn`](/core-concepts/columns/#actioncolumn) when you want to control where those actions appear in the table.

```php
use Zonvoir\InertiaTable\Columns\ActionColumn;

// Default: actions rendered inline as buttons or links
ActionColumn::make();

// Or group them into a dropdown menu
ActionColumn::make()
    ->asDropdown();
```

This lets you keep the action definitions separate from their table presentation.

By default, actions appear inline as buttons or links according to each action's configuration. If you want them grouped into a dropdown menu, add `->asDropdown()`. For more information, see the [ActionColumn documentation](/core-concepts/columns/#actioncolumn).

## Define a row action

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Url;

public function actions(): array
{
    return [
        Action::make('Edit')
            ->icon('mdi:pencil')
            ->url(
                fn (User $user, Url $url) =>
                    $url->route('users.edit', $user)
            ),
    ];
}
```

Each action is resolved for the current row and passed to the frontend adapter.

## Dynamic Action Names

An action name can be defined dynamically per row by passing a callable to `name()` or directly to `Action::make()`. This allows a single action to serve dual purposes (e.g. toggling state like "Make remote" vs "Remove remote", or "Publish" vs "Unpublish"):

```php
Action::make('remote', handle: fn (Employee $employee) => $employee->update(['is_remote' => ! $employee->is_remote]))
    ->name(fn (Employee $employee) => $employee->is_remote ? 'Remove remote' : 'Make remote');
```

You can also pass a callable directly as the first argument to `make()`, along with an explicit key:

```php
Action::make(
    name: fn (Employee $employee) => $employee->is_remote ? 'Remove remote' : 'Make remote',
    key: 'toggle-remote',
    handle: fn (Employee $employee) => $employee->update(['is_remote' => ! $employee->is_remote]),
);
```

The closure receives the row's Eloquent model. You can also use model attribute interpolation like `:name` or `:title` in the returned string (e.g. `'Make :name remote'`).

## Link actions

An action with URL metadata behaves as a link.

```php
Action::make('View')
    ->icon('heroicons:eye')
    ->url(
        fn (User $user, Url $url) =>
            $url->route('users.show', $user)
    );
```

Link actions are useful for navigation such as:

- View
- Edit
- Open details
- Navigate to related resources

You can use the normal `Url` options when configuring navigation:

```php
Action::make('Edit')
    ->url(
        fn (User $user, Url $url) => $url
            ->route('users.edit', $user)
            ->preserveScroll()
    );
```

## Backend actions

When an action has a backend handler instead of URL metadata, Zonvoir Table treats it as an executable action.

For example:

```php
Action::make('Archive')
    ->icon('mdi:archive')
    ->confirm(
        'Archive user?',
        'This action can be reversed later.'
    )
    ->handle(function (User $user) {
        $user->update([
            'archived_at' => now(),
        ]);
    });
```

Use backend actions for operations that modify or process the current record.

<div class="docs-note">

The exact handler method may depend on your current `Action` API. Use the handler method exposed by your package and keep the row record type-hinted where possible.

</div>

## Custom actions

An action without URL metadata or a backend handler is serialized as a custom action.

```php
Action::make('Preview')
    ->icon('heroicons:eye');
```

Custom actions can be handled by the frontend when you need application-specific behavior that does not map directly to navigation or a backend operation.

## Action types

Zonvoir Table determines the action type from its configuration.

| Configuration | Type |
| --- | --- |
| Has URL metadata | `link` |
| Has a backend handler | `action` |
| Has neither | `custom` |

You normally do not need to set the action type manually.

## Icons

Add an icon using a string-based icon identifier.

```php
Action::make('Edit')
    ->icon('mdi:pencil');
```

You can use any icon collection supported by your frontend adapter:

```php
->icon('heroicons:pencil')
->icon('lucide:pencil')
->icon('mdi:pencil')
```

See the **Icons** guide for more information.

## Tooltips

Use `tooltip()` to provide additional context.

```php
Action::make('Archive')
    ->icon('mdi:archive')
    ->tooltip('Archive user');
```

Tooltips are especially useful when the action label is hidden.

## Hide the label

Use `hideLabel()` to render an icon-only action.

```php
Action::make('Edit')
    ->icon('mdi:pencil')
    ->tooltip('Edit user')
    ->hideLabel();
```

When hiding labels, adding a tooltip is recommended so the action remains understandable.

## Variants

Use `variant()` to control the visual style of the action.

```php
Action::make('Edit')
    ->variant('ghost');
```

You can also configure the variant color:

```php
Action::make('Delete')
    ->variant('ghost')
    ->variantColor('red');
```

This is useful for visually distinguishing destructive or secondary actions.

## Confirmation

Use `confirm()` when an action should require confirmation before it runs.

```php
Action::make('Archive')
    ->icon('mdi:archive')
    ->confirm(
        'Archive user?',
        'This action can be reversed later.'
    );
```

The first argument is the confirmation title and the second provides additional context.

Confirmation is useful for operations such as:

- Delete
- Archive
- Disable
- Remove access
- Other potentially destructive changes

### Dynamic Confirmation Dialogs

You can pass callables to `confirm()` to customize the title, message, and button labels per row:

```php
Action::make('remote', handle: fn (Employee $employee) => $employee->update(['is_remote' => ! $employee->is_remote]))
    ->name(fn (Employee $employee) => $employee->is_remote ? 'Remove remote' : 'Make remote')
    ->confirm(
        title: fn (Employee $employee) => $employee->is_remote ? 'Remove employee remote' : 'Make employee remote',
        message: fn (Employee $employee) => $employee->is_remote
            ? 'Are you sure you want to remove remote status for :name?'
            : 'Are you sure you want to mark :name as remote?',
        confirmButton: fn (Employee $employee) => $employee->is_remote ? 'Yes, remove remote' : 'Yes, make remote',
    );
```

#### Callback returning a configuration array

You can also pass a single closure that returns a configuration array:

```php
->confirm(fn (Employee $employee) => [
    'title' => $employee->is_remote ? 'Remove remote' : 'Make remote',
    'message' => 'Are you sure you want to update this employee?',
    'confirmButton' => $employee->is_remote ? 'Yes, remove' : 'Yes, make',
])
```

#### Conditional confirmation

Return a boolean from the closure to conditionally require confirmation based on the row state:

```php
// Only ask for confirmation when removing remote, not when granting it
->confirm(fn (Employee $employee) => $employee->is_remote)
```

## Complete example

```php
public function actions(): array
{
    return [
        Action::make('View')
            ->icon('heroicons:eye')
            ->url(
                fn (User $user, Url $url) =>
                    $url->route('users.show', $user)
            ),

        Action::make('Edit')
            ->icon('mdi:pencil')
            ->tooltip('Edit user')
            ->hideLabel()
            ->variant('ghost')
            ->url(
                fn (User $user, Url $url) =>
                    $url->route('users.edit', $user)
            ),

        Action::make('Archive')
            ->icon('mdi:archive')
            ->tooltip('Archive user')
            ->hideLabel()
            ->variant('ghost')
            ->variantColor('red')
            ->confirm(
                'Archive user?',
                'This action can be reversed later.'
            ),
    ];
}
```

## Related guides

- [Row Links](/core-concepts/row-links/)
- [Bulk Actions](/core-concepts/bulk-actions/)
- [Icons](/core-concepts/icons/)
- [Columns](/core-concepts/columns/)
- [ActionColumn](/core-concepts/columns/#actioncolumn)
