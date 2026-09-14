---
title: Table Columns & Formatting
description: Configure text, badge, boolean, numeric, date, datetime, and image columns in Zonvoir Table with custom formatting, sorting, and visibility.
---

Columns define how values from your records are displayed, formatted, and serialized by Zonvoir Table.

They control properties such as labels, [formatting](#column-types), [sorting](/core-concepts/sorting/), [searching](/core-concepts/searching/), [visibility](/core-concepts/toggle-columns/), sizing, [sticky behavior](/core-concepts/sticky-columns/), [row links](/core-concepts/row-links/), [images](/core-concepts/images/), [exports](/core-concepts/exports/), and [frontend metadata](/api/payload/).

## Defining columns

Return your columns from the `columns()` method of your table class.

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;

public function columns(): array
{
    return [
        TextColumn::make('name')
            ->label('Name')
            ->sortable()
            ->searchable()
            ->sticky(),

        TextColumn::make('email')
            ->searchable(),

        BadgeColumn::make('status')
            ->colors([
                'active' => 'success',
                'pending' => 'warning',
            ]),
    ];
}
```

:::tip
Use the most specific column type for the value you're displaying.

For example, use `NumericColumn` for numbers and `DateColumn` for dates instead of formatting everything through `TextColumn`.
:::

## Column types

Zonvoir Table includes several column types for common data patterns.

<div class="column-grid">

<a href="#textcolumn" class="column-card">
<div class="column-icon">Aa</div>
<div>
<strong>TextColumn</strong>
<span>Text, names, emails, identifiers, and general values.</span>
</div>
</a>

<a href="#numericcolumn" class="column-card">
<div class="column-icon">123</div>
<div>
<strong>NumericColumn</strong>
<span>Numbers, currency, percentages, and formatted numeric values.</span>
</div>
</a>

<a href="#booleancolumn" class="column-card">
<div class="column-icon">✓</div>
<div>
<strong>BooleanColumn</strong>
<span>True, false, and nullable boolean values.</span>
</div>
</a>

<a href="#badgecolumn" class="column-card">
<div class="column-icon">●</div>
<div>
<strong>BadgeColumn</strong>
<span>Status values with colors, variants, and icons.</span>
</div>
</a>

<a href="#imagecolumn" class="column-card">
<div class="column-icon">▧</div>
<div>
<strong>ImageColumn</strong>
<span>Avatars, thumbnails, profile images, and previews.</span>
</div>
</a>

<a href="#datecolumn" class="column-card">
<div class="column-icon">17</div>
<div>
<strong>DateColumn</strong>
<span>Date-only values with configurable display formatting.</span>
</div>
</a>

<a href="#datetimecolumn" class="column-card">
<div class="column-icon">◷</div>
<div>
<strong>DateTimeColumn</strong>
<span>Date and time values with timezone support.</span>
</div>
</a>

<a href="#serialnumbercolumn" class="column-card">
<div class="column-icon">No.</div>
<div>
<strong>SerialNumberColumn</strong>
<span>Automatically numbered rows that continue across pagination.</span>
</div>
</a>
<a href="#actioncolumn" class="column-card">
<div class="column-icon">•••</div>
<div>
<strong>ActionColumn</strong>
<span>Control where row actions are rendered.</span>
</div>
</a>

</div>

---

## Common options

Most columns extend the base `Column` class and share a common set of configuration methods.

<div class="method-table">

| Method | Description |
| --- | --- |
| `label()` | Set the column heading. |
| `key()` | Override the serialized key. |
| `visible()` | Control whether the column is visible initially. |
| `sortable()` | Allow the column to be sorted. |
| `searchable()` | Include the column in table search. |
| `toggleable()` | Allow users to show or hide the column. |
| `sticky()` | Keep the column fixed while horizontally scrolling. |
| `alignment()` | Control cell alignment. |
| `width()` | Set the preferred width. |
| `minWidth()` | Set the minimum width. |
| `maxWidth()` | Set the maximum width. |
| `labelClass()` | Add classes to the column heading. |
| `cellClass()` | Add classes to table cells. |
| `tooltip()` | Add additional information to the heading. |
| `defaultValue()` | Provide a fallback when no value exists. |
| `mapAs()` | Transform the value before serialization. |
| `url()` | Make the cell resolve to a URL. |
| `image()` | Attach image metadata to the column. |
| `exportAs()` | Change how the value is exported. |
| `dontExport()` | Exclude the column from exports. |
| `meta()` | Attach custom frontend metadata. |

</div>

Not every method is relevant to every column type.

Specialized columns may provide additional methods specific to their value type.

---

## Value resolution

By default, the column name determines which value is read from the model.

```php
TextColumn::make('email');
```

For a `User` model, this resolves:

```php
$user->email;
```

Nested values can also be represented when supported by your table configuration.

```php
TextColumn::make('profile.phone')
    ->label('Phone');
```

## Transforming values

Use `mapAs()` when you need to transform a value before it is sent to the frontend.

The callback receives the resolved value and the current record.

```php
TextColumn::make('name')
    ->mapAs(
        fn ($value, User $user) => strtoupper($user->name)
    );
```

You can also ignore the original value entirely:

```php
TextColumn::make('user')
    ->label('User')
    ->mapAs(
        fn ($value, User $user) => $user->first_name.' '.$user->last_name
    );
```

<div class="docs-note">

`mapAs()` changes the serialized display value.

If the underlying database column is sortable or searchable, those operations still work against the configured backend field rather than the mapped display value.

</div>

---

## TextColumn

`TextColumn` is the general-purpose column and is suitable for most string-like values.

```php
use Zonvoir\InertiaTable\Columns\TextColumn;

TextColumn::make('name')
    ->label('Full Name')
    ->sortable()
    ->searchable();
```

Typical uses include:

- Names
- Emails
- Identifiers
- Addresses
- Descriptions
- General text values

### Example

```php
TextColumn::make('email')
    ->label('Email address')
    ->searchable()
    ->toggleable();
```

---

## NumericColumn

`NumericColumn` provides formatting metadata for numeric values.

```php
use Zonvoir\InertiaTable\Columns\NumericColumn;

NumericColumn::make('revenue')
    ->precision(2)
    ->thousandsSeparator(',')
    ->decimalSeparator('.')
    ->prefix('$');
```

It is useful for values such as:

- Currency
- Totals
- Quantities
- Percentages
- Measurements

### Currency

```php
NumericColumn::make('price')
    ->precision(2)
    ->prefix('$');
```

### Percentage

```php
NumericColumn::make('progress')
    ->precision(0)
    ->suffix('%');
```

---

## BooleanColumn

`BooleanColumn` is designed for boolean and nullable boolean values.

```php
use Zonvoir\InertiaTable\Columns\BooleanColumn;

BooleanColumn::make('active')
    ->trueLabel('Active')
    ->falseLabel('Inactive')
    ->nullLabel('Unknown');
```

This lets the frontend display meaningful labels instead of raw `true`, `false`, or `null` values.

---

## BadgeColumn

`BadgeColumn` is ideal for statuses, states, categories, and other compact values.

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;

BadgeColumn::make('status')
    ->colors([
        'active' => 'success',
        'pending' => 'warning',
        'disabled' => 'muted',
    ])
    ->solid();
```

### Status colors

```php
BadgeColumn::make('status')
    ->colors([
        'draft' => 'neutral',
        'active' => 'success',
        'pending' => 'warning',
        'failed' => 'danger',
    ]);
```

You can use badge variants to match the visual hierarchy of your application.

---

## ImageColumn

`ImageColumn` provides metadata for displaying images such as avatars and thumbnails.

```php
use Zonvoir\InertiaTable\Columns\ImageColumn;
use Zonvoir\InertiaTable\Image;

ImageColumn::make('avatar')
    ->image(
        fn (User $user, Image $image) => $image
            ->url($user->avatar_url)
            ->rounded()
            ->small()
            ->alt($user->name)
    );
```

Typical uses include:

- User avatars
- Product thumbnails
- Logos
- File previews

For image sizing options, rounded avatars, and alternative text callbacks, see the full [Images guide](/core-concepts/images/).

---

## DateColumn

`DateColumn` is intended for date-only values.

```php
use Zonvoir\InertiaTable\Columns\DateColumn;

DateColumn::make('joined_at')
    ->format('M j, Y')
    ->placeholder('Not set');
```

Example output:

```text
Aug 27, 2026
```

Use `DateTimeColumn` instead when the time portion is important.

---

## DateTimeColumn

`DateTimeColumn` handles date and time values and supports timezone metadata.

```php
use Zonvoir\InertiaTable\Columns\DateTimeColumn;

DateTimeColumn::make('created_at')
    ->format('M j, Y g:i A')
    ->timezone('UTC');
```

Example output:

```text
Aug 27, 2026 2:30 PM
```

---

### SerialNumberColumn

`SerialNumberColumn` renders the current row number without needing a value on the model. Its default key is `_serial_number`, its label is `S.no`, and it is centered and non-toggleable by default.

```php
use Zonvoir\InertiaTable\Columns\SerialNumberColumn;

public function columns(): array
{
    return [
        SerialNumberColumn::make(),
        TextColumn::make('name'),
    ];
}
```

The Vue adapter calculates the number from the row position and the paginator offset, so a paginated table continues its numbering on subsequent pages.

---
## ActionColumn

`ActionColumn` controls where [row actions](/core-concepts/row-actions/) are rendered inside the table.

By default, actions are not displayed in a dropdown (`->asDropdown()` is not the default). Instead, they are rendered inline as individual buttons or links according to each action's configuration (such as its URL, variant, color, or icon).

```php
use Zonvoir\InertiaTable\Columns\ActionColumn;

// Default: actions rendered inline as buttons or links
ActionColumn::make();
```

If you want your actions grouped inside a dropdown menu, you can add `->asDropdown()`:

```php
use Zonvoir\InertiaTable\Columns\ActionColumn;

// Group actions into a dropdown menu
ActionColumn::make()
    ->asDropdown();
```

:::note
Dropdown presentation is not enabled by default. If you omit `->asDropdown()`, your actions will appear inline as buttons or links based on each action's definition. Add `->asDropdown()` only when you want actions collapsed into a dropdown menu.
:::

For example, a row may expose actions such as:

```text
View
Edit
Delete
```

The actual actions are defined by your table's [action configuration](/core-concepts/row-actions/), while `ActionColumn` controls their placement and presentation inside the row.

---

## Combining column types

A typical table will use several column types together.

```php
public function columns(): array
{
    return [
        ImageColumn::make('avatar'),

        TextColumn::make('name')
            ->sortable()
            ->searchable(),

        TextColumn::make('email')
            ->searchable(),

        BadgeColumn::make('status')
            ->colors([
                'active' => 'success',
                'pending' => 'warning',
            ]),

        DateTimeColumn::make('created_at')
            ->label('Created')
            ->sortable(),

        ActionColumn::make()
            ->asDropdown(),
    ];
}
```

---

## Related API

- [`Column` API Reference](/api/column/)
- [`Table::columns()` API Reference](/api/table/#override-hooks)
- [Row Actions Guide](/core-concepts/row-actions/)
