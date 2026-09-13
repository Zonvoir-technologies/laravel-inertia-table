---
title: PHP Enums Reference
description: Complete reference for all PHP enums in Zonvoir Table, covering sorting directions, pagination types, alignments, colors, button and badge variants, and image sizing.
---

Zonvoir Table provides a suite of strongly-typed PHP 8.1+ backed enums in the `Zonvoir\InertiaTable\Enums` namespace. These enums eliminate magic strings, provide IDE autocompletion, and serialize cleanly into the frontend payload.

## Summary of Enums

| Enum | Backed Type | Cases Count | Purpose |
| --- | --- | --- | --- |
| [`PaginationType`](#paginationtype) | `string` | 3 | Selects between standard, simple, and cursor pagination |
| [`ColumnAlignment`](#columnalignment) | `string` | 3 | Aligns column header and cell contents (left, center, right) |
| [`Direction`](#direction) | `string` | 2 | Sort direction values (`asc`, `desc`) |
| [`ButtonVariant`](#buttonvariant) | `string` | 4 | Action button visual variants (solid, outline, ghost, link) |
| [`BadgeVariant`](#badgevariant) | `string` | 3 | Badge column visual presentations (solid, outline, ghost) |
| [`TableColor`](#tablecolor) | `string` | 25 | Semantic intent and Tailwind palette color presets |
| [`HttpMethod`](#httpmethod) | `string` | 5 | HTTP request methods for action navigation and handlers |
| [`ImageSize`](#imagesize) | `string` | 4 | Preset image dimensions with Tailwind class mapping |
| [`ImagePosition`](#imageposition) | `string` | 2 | Image placement relative to text (start, end) |

---

## PaginationType

`Zonvoir\InertiaTable\Enums\PaginationType` specifies which Laravel pagination engine the table uses to query and slice Eloquent models.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `PaginationType::Standard` | `'standard'` | Full length-aware pagination (`$query->paginate()`). Computes total rows, calculates total pages, and renders numbered page controls. |
| `PaginationType::Simple` | `'simple'` | Simple pagination (`$query->simplePaginate()`). Provides Previous and Next controls without running an expensive `COUNT(*)` query. Ideal for large datasets. |
| `PaginationType::Cursor` | `'cursor'` | Cursor-based pagination (`$query->cursorPaginate()`). Uses unique keys to seek records forward and backward. High performance for infinite scroll or massive datasets. |

### Usage Example

```php
use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    // Configure as class property default
    protected PaginationType $paginationType = PaginationType::Standard;

    public function configure(): void
    {
        // Or set fluently in configure()
        $this->paginationType(PaginationType::Cursor);
    }
}
```

---

## ColumnAlignment

`Zonvoir\InertiaTable\Enums\ColumnAlignment` controls horizontal text and content alignment for both the column header and cell bodies.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `ColumnAlignment::Left` | `'left'` | Aligns headers and cell contents to the left. Default for text, date, and general data columns. |
| `ColumnAlignment::Center` | `'center'` | Centers headers and cell contents. Recommended for badges, status indicators, icons, and action controls. |
| `ColumnAlignment::Right` | `'right'` | Aligns headers and cell contents to the right. Recommended for numeric values, currency, totals, and metrics. |

### Usage Example

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\NumericColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\ColumnAlignment;

public function columns(): array
{
    return [
        TextColumn::make('name')
            ->alignment(ColumnAlignment::Left),

        BadgeColumn::make('status')
            ->alignment(ColumnAlignment::Center),

        NumericColumn::make('total_revenue')
            ->alignment(ColumnAlignment::Right),
    ];
}
```

---

## Direction

`Zonvoir\InertiaTable\Enums\Direction` represents SQL and table sort ordering directions.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `Direction::ASCENDING` | `'asc'` | Sorts records in ascending order (A to Z, lowest to highest number, oldest to newest date). |
| `Direction::DESCENDING` | `'desc'` | Sorts records in descending order (Z to A, highest to lowest number, newest to oldest date). |

### Usage Example

```php
use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\Table;

class InvoicesTable extends Table
{
    protected ?string $defaultSort = '-created_at';

    public function configure(): void
    {
        // Fluent configuration with typed Direction
        $this->defaultSort('created_at', Direction::DESCENDING);
    }
}
```

---

## ButtonVariant

`Zonvoir\InertiaTable\Enums\ButtonVariant` defines the visual appearance and weight of action buttons rendered for rows or bulk actions.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `ButtonVariant::Solid` | `'solid'` | High-emphasis button with solid background fill and contrasting text. Default for primary actions. |
| `ButtonVariant::Outline` | `'outline'` | Medium-emphasis button with a visible colored border and transparent background. |
| `ButtonVariant::Ghost` | `'ghost'` | Subtle button with transparent background and no border. Highlights with background tint on hover. |
| `ButtonVariant::Link` | `'link'` | Rendered as a simple hyperlink with colored text and no button container padding. |

### Usage Example

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Enums\ButtonVariant;
use Zonvoir\InertiaTable\Enums\TableColor;

public function actions(): array
{
    return [
        Action::make('view')
            ->label('View')
            ->variant(ButtonVariant::Link),

        Action::make('edit')
            ->label('Edit')
            ->variant(ButtonVariant::Outline),

        Action::make('publish')
            ->label('Publish')
            ->variant(ButtonVariant::Solid)
            ->color(TableColor::Primary),
    ];
}
```

---

## BadgeVariant

`Zonvoir\InertiaTable\Enums\BadgeVariant` defines the container style of pill badges rendered in `BadgeColumn`.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `BadgeVariant::Solid` | `'solid'` | High-contrast badge with solid background fill and contrasting white/dark text. |
| `BadgeVariant::Outline` | `'outline'` | Transparent badge with a colored perimeter border and matching text color. |
| `BadgeVariant::Ghost` | `'ghost'` | Soft, translucent background tint with matching colored text and no border. |

### Usage Example

```php
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Enums\BadgeVariant;
use Zonvoir\InertiaTable\Enums\TableColor;

BadgeColumn::make('order_status')
    ->label('Status')
    ->variant(BadgeVariant::Ghost)
    ->colors([
        TableColor::Success => 'completed',
        TableColor::Warning => 'pending',
        TableColor::Danger => 'canceled',
    ]);
```

---

## TableColor

`Zonvoir\InertiaTable\Enums\TableColor` supplies semantic intent colors and Tailwind CSS color palette keys used across actions, badges, and empty states.

### Semantic Intent Colors

| Case | Value | Recommended Usage |
| --- | --- | --- |
| `TableColor::Default` | `'default'` | Standard neutral / base UI element. |
| `TableColor::Primary` | `'primary'` | Main call-to-action button or highlighted status. |
| `TableColor::Secondary` | `'secondary'` | Secondary supporting action. |
| `TableColor::Success` | `'success'` | Positive outcome, published status, or completed task. |
| `TableColor::Warning` | `'warning'` | Cautionary state, pending approval, or expiring item. |
| `TableColor::Danger` | `'danger'` | Error, failure, or destructive action. |
| `TableColor::Destructive` | `'destructive'` | Deletions, account closures, and permanent removals. |
| `TableColor::Info` | `'info'` | Informational status or active process. |
| `TableColor::Muted` | `'muted'` | Low-emphasis secondary information. |

### Tailwind Palette Presets

`TableColor` also includes specific color cases for fine-grained palette customization:

- **Cool & Neutral**: `Neutral` (`'neutral'`), `Slate` (`'slate'`), `Gray` (`'gray'`)
- **Warm & Vibrant**: `Red` (`'red'`), `Orange` (`'orange'`), `Amber` (`'amber'`), `Yellow` (`'yellow'`)
- **Nature & Green**: `Green` (`'green'`), `Emerald` (`'emerald'`)
- **Blue & Tech**: `Blue` (`'blue'`), `Sky` (`'sky'`), `Indigo` (`'indigo'`), `Violet` (`'violet'`), `Purple` (`'purple'`), `Pink` (`'pink'`)

### Usage Example

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Enums\TableColor;

// Styling actions with semantic colors
Action::make('delete')
    ->label('Delete')
    ->color(TableColor::Destructive)
    ->confirm('Are you sure you want to delete this record?');

// Mapping badge colors
BadgeColumn::make('role')
    ->colors([
        TableColor::Purple => 'admin',
        TableColor::Indigo => 'editor',
        TableColor::Gray => 'subscriber',
    ]);
```

---

## HttpMethod

`Zonvoir\InertiaTable\Enums\HttpMethod` specifies the HTTP verb used when an action triggers an Inertia navigation or AJAX callback.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `HttpMethod::GET` | `'get'` | Standard GET navigation request. |
| `HttpMethod::POST` | `'post'` | HTTP POST request for state changes. |
| `HttpMethod::PUT` | `'put'` | HTTP PUT request for full resource updates. |
| `HttpMethod::PATCH` | `'patch'` | HTTP PATCH request for partial updates. |
| `HttpMethod::DELETE` | `'delete'` | HTTP DELETE request for removing resources. |

### Usage Example

```php
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Enums\HttpMethod;

Action::make('archive')
    ->label('Archive')
    ->url(fn ($row) => route('users.archive', $row))
    ->method(HttpMethod::PATCH);
```

---

## ImageSize

`Zonvoir\InertiaTable\Enums\ImageSize` defines standardized avatar and thumbnail dimensions for `ImageColumn` and column inline images.

### Cases & Dimensions

| Case | Value | Tailwind Class | Pixel Dimension |
| --- | --- | --- | --- |
| `ImageSize::Small` | `'small'` | `size-4` | 16px × 16px |
| `ImageSize::Medium` | `'medium'` | `size-6` | 24px × 24px |
| `ImageSize::Large` | `'large'` | `size-8` | 32px × 32px |
| `ImageSize::ExtraLarge` | `'extra-large'` | `size-10` | 40px × 40px |

### Helper Method

`ImageSize` provides a built-in helper method to resolve the corresponding Tailwind size utility:

```php
public function classes(): string
```

### Usage Example

```php
use Zonvoir\InertiaTable\Columns\ImageColumn;
use Zonvoir\InertiaTable\Enums\ImageSize;

ImageColumn::make('avatar')
    ->label('Avatar')
    ->size(ImageSize::Large);
```

---

## ImagePosition

`Zonvoir\InertiaTable\Enums\ImagePosition` configures the placement of an image relative to accompanying text within columns that support inline imagery.

### Cases

| Case | Value | Description |
| --- | --- | --- |
| `ImagePosition::Start` | `'start'` | Positions the image before the text (left side in left-to-right writing mode). Default. |
| `ImagePosition::End` | `'end'` | Positions the image after the text (right side in left-to-right writing mode). |

### Usage Example

```php
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\ImagePosition;

TextColumn::make('author')
    ->image(fn ($row) => $row->avatar_url)
    ->imagePosition(ImagePosition::Start);
```
