---
title: Theme & Brand Colors
description: Customize the Zonvoir Table primary brand color and text contrast across all components using CSS custom properties.
---

Zonvoir Table includes a global CSS variable system that lets you align all table components with your application's brand identity. By setting `--zt-primary` and `--zt-primary-foreground`, action buttons, badges, checkboxes, switches, and search inputs automatically adapt to your theme.

## Quick start

Define `--zt-primary` and `--zt-primary-foreground` in your application's global stylesheet (such as `resources/css/app.css`):

```css
:root {
  --zt-primary: #0e8637;        /* e.g. Emerald, Indigo (#4f46e5), Blue (#2563eb), etc. */
  --zt-primary-foreground: #ffffff;
}
```

Once defined, any component using the primary color will instantly reflect your chosen brand palette.

## Default fallbacks

If you do not declare custom CSS variables, Zonvoir Table gracefully falls back to its built-in slate palette:

| CSS Variable | Description | Light Mode Fallback | Dark Mode Fallback |
| --- | --- | --- | --- |
| `--zt-primary` | Main brand accent color for active elements, backgrounds, and borders | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) |
| `--zt-primary-foreground` | High-contrast text or icon color rendered on top of primary backgrounds | `#ffffff` (White) | `#020617` (Slate 950) |

No configuration or CSS declaration is required if you prefer the default neutral slate aesthetic.

## Supported components

Setting `--zt-primary` controls all primary visual accents across the table:

### 1. Action buttons

Action buttons set with `variantColor('primary')` (or default actions) use your theme:

- **Solid variant**: Renders `--zt-primary` as background and border, with `--zt-primary-foreground` for label text and icons.
- **Outline variant**: Renders `--zt-primary` as the border and text color.
- **Ghost variant**: Uses `--zt-primary` for text and interactive hover styling.
- **Link variant**: Uses `--zt-primary` for link text and underline hover effects.

```php
use Zonvoir\InertiaTable\Action;

Action::make('Create user')
    ->variant('solid')
    ->variantColor('primary');

Action::make('Manage')
    ->variant('outline')
    ->variantColor('primary');
```

### 2. Badge columns

Badge columns mapped to the `'primary'` color automatically adopt your theme tokens:

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;

BadgeColumn::make('role')
    ->colors([
        'admin' => 'primary',
        'editor' => 'info',
        'guest' => 'muted',
    ]);
```

- **Solid**: Background fills with `--zt-primary` and text with `--zt-primary-foreground`.
- **Outline**: Border and text render in `--zt-primary`.
- **Ghost**: Text renders in `--zt-primary` with a transparent background.

### 3. Checkboxes & row selection

The table's selection system uses your primary theme color for clear visual feedback:

- **Checked state**: Checkbox fill and border use `--zt-primary`.
- **Checkmark icon**: Rendered in `--zt-primary-foreground`.
- Applies to both individual row checkboxes and the header "Select All" checkbox.

### 4. Switch toggles

Interactive boolean switches (toggles) use `--zt-primary` as the active background color when switched on, reverting to muted slate when turned off.

### 5. Search inputs & active states

The global search input, column-toggle search input, and search icons use your theme color:

- When focused, input borders transition to `--zt-primary`.
- An ambient focus ring is cast at 20% opacity using `--zt-primary`.
- The search icon illuminates with `--zt-primary` when the search field is active.

## Dark mode adaptation

You can tune your primary theme color for dark mode by scoping the CSS variables to your dark mode selector (such as `.dark` or `[data-theme='dark']`):

```css
/* Light mode */
:root {
  --zt-primary: #0e8637;
  --zt-primary-foreground: #ffffff;
}

/* Dark mode (optional custom shade) */
.dark {
  --zt-primary: #10b981;        /* Slightly brighter emerald for dark backgrounds */
  --zt-primary-foreground: #020617;
}
```

If you don't provide dark mode overrides, the adapter uses the configured `--zt-primary` or falls back to its built-in dark slate tokens.

## Scoped theming

Because CSS variables respect CSS cascade and inheritance, you can customize the theme for specific tables without affecting the rest of your app:

```css
/* Default emerald theme across the app */
:root {
  --zt-primary: #0e8637;
  --zt-primary-foreground: #ffffff;
}

/* Purple theme scoped specifically for billing tables */
.billing-table {
  --zt-primary: #7c3aed;
  --zt-primary-foreground: #ffffff;
}
```

Pass the custom wrapper class using the `classes.root` configuration:

```vue
<ZonvoirTable
  :table="invoices"
  :config="{
    classes: {
      root: 'billing-table'
    }
  }"
/>
```

## Brand color examples

Here are common brand color combinations ready to paste into your stylesheet:

### Emerald (Green)
```css
:root {
  --zt-primary: #0e8637;
  --zt-primary-foreground: #ffffff;
}
```

### Indigo
```css
:root {
  --zt-primary: #4f46e5;
  --zt-primary-foreground: #ffffff;
}
```

### Blue
```css
:root {
  --zt-primary: #2563eb;
  --zt-primary-foreground: #ffffff;
}
```

### Rose
```css
:root {
  --zt-primary: #e11d48;
  --zt-primary-foreground: #ffffff;
}
```

### Violet
```css
:root {
  --zt-primary: #7c3aed;
  --zt-primary-foreground: #ffffff;
}
```

## Related documentation

- [Styling](/advanced/styling/) — Complete reference of table CSS classes and `config.classes` overrides.
- [Variants](/advanced/variants/) — Action button and badge column visual variants (`solid`, `outline`, `ghost`, `link`).
- [Colors](/advanced/colors/) — Register custom Tailwind colors and use the built-in palette.
- [Dark Mode](/advanced/dark-mode/) — Enable and configure table dark mode behaviors.
