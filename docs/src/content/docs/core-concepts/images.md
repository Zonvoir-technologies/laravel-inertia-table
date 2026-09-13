---
title: Images & Avatars in Table Columns
description: Display rounded avatars, product thumbnails, logos, and custom images in Zonvoir Table columns with accessible alt text and sizing controls.
---

Zonvoir Table provides an `Image` helper for configuring images displayed by the frontend adapter.

Images can be used for avatars, profile pictures, thumbnails, logos, and other visual content in both `TextColumn` and [`ImageColumn`](/core-concepts/columns/#imagecolumn).

## Display an image

Use `image()` on a column and configure the image using the `Image` object:

```php
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Image;

TextColumn::make('avatar')
    ->image(
        fn (User $user, Image $image) => $image
            ->url($user->avatar_url)
            ->alt($user->name)
    );
```

The callback receives the current Eloquent model record and an `Image` instance that can be configured before it is serialized to the frontend payload.

## Rounded images

Use `rounded()` for circular or rounded images such as user avatars:

```php
TextColumn::make('avatar')
    ->image(
        fn (User $user, Image $image) => $image
            ->url($user->avatar_url)
            ->rounded()
            ->alt($user->name)
    );
```

## Image size

Images can be configured with a predefined size (`small()`, `medium()`, `large()`):

```php
TextColumn::make('avatar')
    ->image(
        fn (User $user, Image $image) => $image
            ->url($user->avatar_url)
            ->small()
            ->rounded()
            ->alt($user->name)
    );
```

## Alt text

Always provide meaningful alternative text for accessibility and SEO:

```php
->alt($user->name)
```

This improves accessibility for screen readers and provides context when the image cannot be displayed.

## Complete example

```php
use App\Models\User;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Image;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            TextColumn::make('avatar')
                ->label('User')
                ->image(
                    fn (User $user, Image $image) => $image
                        ->url($user->avatar_url)
                        ->rounded()
                        ->small()
                        ->alt($user->name)
                ),

            TextColumn::make('name')
                ->sortable()
                ->searchable(),

            TextColumn::make('email')
                ->searchable(),
        ];
    }
}
```

Image configuration is serialized with the table payload and rendered automatically by the frontend adapter.

## Related guides

- [Typed Columns](/core-concepts/columns/) — Full documentation of `ImageColumn` and column formatting.
- [Configuration API](/api/configuration/#image) — `Image` value object methods and options.
- [Icons](/core-concepts/icons/) — Using string-based vector icons alongside images.
