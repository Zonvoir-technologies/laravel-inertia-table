---
title: Button & Badge Colors
description: Use built-in colors or register custom Tailwind colors for actions and badges.
---

Action buttons and badge columns accept the same color names. Built-in colors include `primary`, `secondary`, `success`, `warning`, `destructive`, `danger`, `info`, `muted`, `purple`, `neutral`, `red`, `orange`, `amber`, `yellow`, `green`, `emerald`, `blue`, `sky`, `indigo`, `violet`, `pink`, `gray`, and `slate`.

## Use a built-in color

Set an action color with `variantColor()` and map badge values with `colors()`.

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\BadgeColumn;

Action::make('Approve')
    ->variant('solid')
    ->variantColor('success');

BadgeColumn::make('status')
    ->colors([
        'approved' => 'success',
        'review' => 'warning',
        'rejected' => 'danger',
    ]);
```

`TableColor` enum cases can be used anywhere a color name is accepted.

## Add a custom color

If you pass a color that is not built in, such as `olive`, define that color in your application and make sure Tailwind generates the utilities used by the adapter.

### Tailwind CSS v4

Add the color and source directive to your application's `app.css` file.

```css
@import "tailwindcss";

@theme {
  --color-olive-50: #f7f8ef;
  --color-olive-300: #c5cc8e;
  --color-olive-500: #8f9948;
  --color-olive-600: #707a38;
  --color-olive-700: #565e2e;
}

@source inline("{,hover:,focus-visible:,disabled:}{bg,border,text}-{olive}-{50,300,500,600,700}");
```

### Tailwind CSS v3

Add the color to `tailwind.config.js`, then safelist the generated utilities because the adapter builds custom color class names dynamically.

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f7f8ef',
          300: '#c5cc8e',
          500: '#8f9948',
          600: '#707a38',
          700: '#565e2e',
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|border|text)-olive-(50|300|500|600|700)$/,
      variants: ['hover', 'focus-visible', 'disabled'],
    },
  ],
};
```

After rebuilding your frontend assets, use the custom name like any built-in color.

```php
Action::make('Publish')
    ->variantColor('olive');

BadgeColumn::make('status')
    ->colors(['scheduled' => 'olive']);
```
