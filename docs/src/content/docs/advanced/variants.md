---
title: Button & Badge Variants
description: Choose the visual treatment for table action buttons and badge columns.
---

Variants control the visual treatment of actions and badges while keeping their meaning and behavior unchanged.

## Button variants

Actions support four variants: `solid`, `outline`, `ghost`, and `link`. Use `solid` for the primary action, and choose a quieter variant for secondary actions.

```php
use Zonvoir\InertiaTable\Action;

Action::make('Edit')
    ->variant('outline')
    ->variantColor('blue');

Action::make('View details')
    ->variant('link')
    ->variantColor('indigo');
```

You can also pass `ButtonVariant` when you prefer enums:

```php
use Zonvoir\InertiaTable\Enums\ButtonVariant;

Action::make('Archive')
    ->variant(ButtonVariant::Ghost);
```

## Badge variants

Badge columns support `solid`, `outline`, and `ghost`. Their default is `outline`.

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;

BadgeColumn::make('status')
    ->variant('solid')
    ->colors([
        'active' => 'green',
        'pending' => 'amber',
        'blocked' => 'red',
    ]);
```

For convenience, badge columns also provide `solid()`, `outline()`, and `ghost()`.

```php
BadgeColumn::make('status')
    ->solid()
    ->colors(['active' => 'green']);
```

See [Colors](/advanced/colors/) for the built-in palette and custom-color setup.
