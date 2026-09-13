---
title: Row Links & Clickable Columns
description: Configure clickable rows and column links in Zonvoir Table with Inertia routing, route parameters, and state preservation.
---

Zonvoir Table can make an entire row clickable or attach navigation to individual columns.

Navigation is configured on the backend using the `Url` helper and rendered automatically by the frontend adapter.

## Make a row clickable

Define a `rowUrl()` method on your table to make each row navigate to a URL:

```php
use App\Models\User;
use Zonvoir\InertiaTable\Url;

public function rowUrl(User $user, Url $url): Url
{
    return $url->route('users.show', $user);
}
```

The callback receives the current record and a `Url` instance. Each row will resolve its own URL using the corresponding model.

```text
/users/1
/users/2
/users/3
```

Users can then click any part of the row to navigate to that record.

## Preserve scroll

Use `preserveScroll()` when the current scroll position should be maintained during Inertia navigation:

```php
public function rowUrl(User $user, Url $url): Url
{
    return $url
        ->route('users.show', $user)
        ->preserveScroll();
}
```

## Preserve state

Use `preserveState()` when the current Inertia page state should be preserved:

```php
public function rowUrl(User $user, Url $url): Url
{
    return $url
        ->route('users.show', $user)
        ->preserveScroll()
        ->preserveState();
}
```

URL options can be chained fluently:

```php
return $url
    ->route('users.show', $user)
    ->preserveScroll()
    ->preserveState();
```

## Make a column clickable

Sometimes you don't want the entire row to be clickable. Use `url()` on an individual column instead:

```php
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Url;

TextColumn::make('name')
    ->url(
        fn (User $user, Url $url) =>
            $url->route('users.show', $user)
    );
```

Only the value rendered by that column will act as the link:

```php
public function columns(): array
{
    return [
        TextColumn::make('name')
            ->sortable()
            ->searchable()
            ->url(
                fn (User $user, Url $url) =>
                    $url->route('users.show', $user)
            ),

        TextColumn::make('email')
            ->searchable(),

        TextColumn::make('status'),
    ];
}
```

In this example, the user's name is clickable while the rest of the row behaves normally.

## Row links vs column links

Use a row link when the record itself has a clear primary destination:

```php
public function rowUrl(User $user, Url $url): Url
{
    return $url->route('users.show', $user);
}
```

Use a column link when only a specific value should navigate somewhere:

```php
TextColumn::make('name')
    ->url(
        fn (User $user, Url $url) =>
            $url->route('users.show', $user)
    );
```

Both approaches use the same `Url` helper, so navigation behavior remains consistent throughout your tables.

## URL options

The `Url` helper can carry additional navigation behavior used by the frontend adapter:

- Target (`_blank`, etc.)
- HTTP method (GET, POST, DELETE)
- Preserve scroll (`preserveScroll()`)
- Preserve state (`preserveState()`)
- Download attribute
- Modal navigation
- Prefetching
- Disabled state
- Hidden state

For the complete list of available methods and arguments, see the [Url API Reference](/api/configuration/#url).

## Related guides

- [Row Actions](/core-concepts/row-actions/) — Action buttons, menus, and confirmation dialogs.
- [Typed Columns](/core-concepts/columns/) — Formatting and configuring column properties.
- [Configuration API](/api/configuration/#url) — `Url` value object reference and options.
