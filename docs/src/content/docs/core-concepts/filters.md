---
title: Table Filters & Query Clauses
description: Filter Eloquent table records in Laravel and Inertia with TextFilter, NumericFilter, SetFilter, DateFilter, BooleanFilter, and custom clauses.
---

:::tip[Zonvoir Table Pro Feature]
Table Filters is a premium capability included with **Zonvoir Table Pro**. It provides typed filter builders, rich clause comparators, slide-out drawer & header filter layouts, and filtered export retention.
:::

Zonvoir Table provides an expressive, strongly-typed filtering system that allows users to narrow table records by column criteria. Filters persist their state in URL query parameters, so filtered table views can be bookmarked, refreshed, and shared.

## Filter types

Use the filter type that matches the underlying value. Each type supplies an appropriate input and a safe set of default clauses.

<div class="column-grid">

<a href="#textfilter" class="column-card">
<div class="column-icon">Aa</div>
<div>
<strong>TextFilter</strong>
<span>Names, emails, identifiers, and other string values.</span>
</div>
</a>

<a href="#numericfilter" class="column-card">
<div class="column-icon">123</div>
<div>
<strong>NumericFilter</strong>
<span>Amounts, quantities, scores, and numeric ranges.</span>
</div>
</a>

<a href="#booleanfilter" class="column-card">
<div class="column-icon">0/1</div>
<div>
<strong>BooleanFilter</strong>
<span>True, false, and nullable boolean values.</span>
</div>
</a>

<a href="#setfilter" class="column-card">
<div class="column-icon">Set</div>
<div>
<strong>SetFilter</strong>
<span>Statuses, enums, categories, and related models.</span>
</div>
</a>

<a href="#datefilter" class="column-card">
<div class="column-icon">17</div>
<div>
<strong>DateFilter</strong>
<span>Date-only values, boundaries, and date ranges.</span>
</div>
</a>

<a href="#datetimefilter" class="column-card">
<div class="column-icon">12:30</div>
<div>
<strong>DateTimeFilter</strong>
<span>Date and time values with timezone-aware comparison.</span>
</div>
</a>

</div>

---

## Enabling Filters in Table Classes

:::tip[Single Vue Package]
All filter components (`TableFilterButton`, `TableFilterDrawer`, `TableFilterHeader`, `TableFilterPanel`, and typed filter inputs) are built directly into `@zonvoir/inertia-table-vue`. You do not need to install any separate Pro package on the frontend!
:::

To activate filters on your table, use one of the two Pro traits:

| Trait | Best For | What it Includes |
| --- | --- | --- |
| `HasFilters` | Tables needing **only filters** | Standalone filter engine, URL query persistence, filter drawer/header layouts |
| `HasProFeatures` | Tables needing **all Pro capabilities** | Includes `HasFilters` + `HasColumnPersistence` (filters + column reordering & database persistence) |

:::tip[Trait Flexibility]
- If you only want filters on a table, use `use HasFilters;`.
- If you want all Pro features (filters, column drag-and-drop, and preference persistence), use `use HasProFeatures;`.
- You can also combine `use HasFilters;` and `use HasColumnPersistence;` directly on the same table without any trait collisions.
:::

---

## Adding Filters to a Table

Define the filters available on your table by adding the trait and returning them from the `filters()` method in your Table class:

```php
namespace App\Tables;

use App\Models\User;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTablePro\Concerns\HasFilters; // Or use HasProFeatures for all Pro features
use Zonvoir\InertiaTablePro\Filters\DateFilter;
use Zonvoir\InertiaTablePro\Filters\SetFilter;
use Zonvoir\InertiaTablePro\Filters\TextFilter;

class UsersTable extends Table
{
    use HasFilters; // <-- Enables filtering on this table

    protected ?string $resource = User::class;

    public function filters(): array
    {
        return [
            TextFilter::make('name', 'Full Name'),
            SetFilter::make('role')
                ->options([
                    'admin' => 'Administrator',
                    'editor' => 'Editor',
                    'viewer' => 'Viewer',
                ]),
            DateFilter::make('created_at', 'Registered Date'),
        ];
    }
}
```

If the label is omitted, Zonvoir Table automatically generates a title-cased label based on the attribute name.

---

## Common options

All built-in filters extend the base `Filter` class and share the same core configuration methods.

<div class="method-table">

| Method | Description |
| --- | --- |
| `label()` | Set the label shown in the filter interface. |
| `key()` | Override the key used in serialized filter state. |
| `nullable()` | Allow explicit filtering for null values. |
| `clauses()` | Restrict or reorder the available clauses. |
| `comparators()` | Alias of `clauses()`. |
| `default()` | Set the initial value and optional clause. |
| `validateUsing()` | Validate or transform a submitted value. |
| `applyUsing()` | Replace the built-in Eloquent query behavior. |
| `applyUnwrapped()` | Apply custom conditions without a nested `where()` group. |
| `meta()` | Attach custom frontend metadata. |
| `component()` | Render the filter with a custom Vue component. |

</div>

Specialized filters add methods for their own input type. For example, `SetFilter` manages option lists while `DateFilter` configures calendars, ranges, and timezones.

---

## TextFilter

`TextFilter` is the general-purpose choice for string columns.

```php
use Zonvoir\InertiaTablePro\Filters\TextFilter;

TextFilter::make('name', 'Full Name');
```

Its default clauses are `Equals`, `NotEquals`, `Contains`, `DoesNotContain`, `StartsWith`, and `EndsWith`.

Typical uses include:

- Names and email addresses
- Reference numbers and identifiers
- Titles and descriptions
- Text fields on related models

### Restricting text clauses

Use `clauses()` when users only need a smaller set of comparisons.

```php
use Zonvoir\InertiaTablePro\Enums\Clause;

TextFilter::make('email')
    ->clauses([
        Clause::Contains,
        Clause::StartsWith,
        Clause::Equals,
    ]);
```

Dot notation can target a related model field:

```php
TextFilter::make('company.name', 'Company');
```

---

## NumericFilter

`NumericFilter` validates numeric input and supports exact, threshold, and range comparisons.

```php
use Zonvoir\InertiaTablePro\Filters\NumericFilter;

NumericFilter::make('total', 'Order Total');
```

Its default clauses are `Equals`, `NotEquals`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, and `Between`.

Typical uses include:

- Prices and totals
- Quantities and inventory counts
- Scores and percentages
- Minimum and maximum thresholds

### Numeric range example

```php
NumericFilter::make('price')
    ->clauses([
        Clause::GreaterThanOrEqual,
        Clause::LessThanOrEqual,
        Clause::Between,
    ]);
```

The `Between` clause renders two values and validates that the lower bound does not exceed the upper bound.

---

## BooleanFilter

`BooleanFilter` provides a true/false selector and normalizes common boolean request values.

```php
use Zonvoir\InertiaTablePro\Filters\BooleanFilter;

BooleanFilter::make('is_active', 'Active');
```

Its default clauses are `Equals` and `NotEquals`.

The Vue editor presents these semantics as a single value selector rather than a separate clause selector. Users choose `Yes` or `No`; nullable filters also offer `Is null` and `Is not null`.

For a nullable database column, enable explicit null filtering:

```php
BooleanFilter::make('email_verified', 'Email Verified')
    ->nullable();
```

---

## SetFilter

`SetFilter` is designed for a known collection of allowed values. It is the right choice for statuses, enums, categories, foreign keys, and related records.

Its default clauses are `Equals`, `NotEquals`, `In`, and `NotIn`.

### Static options

Provide options as `value => label` pairs:

```php
use Zonvoir\InertiaTablePro\Filters\SetFilter;

SetFilter::make('status')
    ->options([
        'draft' => 'Draft',
        'published' => 'Published',
        'archived' => 'Archived',
    ]);
```

Option values are submitted to the backend; labels are displayed to the user.

### Searchable options

Add a client-side search field to a long option list:

```php
SetFilter::make('company_id', 'Company')
    ->searchable()
    ->pluckOptionsFromModel(Company::class, 'name', 'id');
```

The search matches option labels and supports keyboard navigation.

### Multiple selection

Allow users to select more than one option:

```php
SetFilter::make('role')
    ->multiple()
    ->options([
        'admin' => 'Administrator',
        'editor' => 'Editor',
        'viewer' => 'Viewer',
    ]);
```

### Single-clause mode

Hide the clause selector when the filter only needs direct equality:

```php
SetFilter::make('status')
    ->withoutClause()
    ->options([
        'active' => 'Active',
        'inactive' => 'Inactive',
    ]);
```

`withoutClause()` restricts the filter to `Clause::Equals`.

### Options from a model

Resolve labels and values from an Eloquent model:

```php
use App\Models\Company;

SetFilter::make('company_id', 'Company')
    ->pluckOptionsFromModel(Company::class, 'name', 'id');
```

### Options from a relationship

For a relation filter, use dot notation for the related value and resolve its options from that relationship:

```php
SetFilter::make('department.id', 'Department')
    ->pluckOptionsFromRelation('name');
```

The related model's primary key is used as the option value by default. Pass a second column name when a different value column is required.

### Lazy options

Defer option resolution until the frontend requests the filter's choices:

```php
SetFilter::make('company_id', 'Company')
    ->lazy()
    ->searchable()
    ->pluckOptionsFromModel(Company::class, 'name', 'id');
```

Lazy loading is useful when resolving the full option list would make the initial table payload unnecessarily expensive.

---

## DateFilter

`DateFilter` renders a date picker and compares date-only values.

```php
use Zonvoir\InertiaTablePro\Filters\DateFilter;

DateFilter::make('created_at', 'Created Date');
```

Its default clauses are `Equals`, `NotEquals`, `Before`, `After`, `OnOrBefore`, `OnOrAfter`, and `Between`.

### Date picker options

```php
DateFilter::make('published_at', 'Published')
    ->minDate('2025-01-01')
    ->maxDate('2026-12-31')
    ->numberOfMonths(2)
    ->weekStartsOn(1)
    ->showWeekNumbers()
    ->clearable();
```

| Method | Description |
| --- | --- |
| `minDate()` | Set the earliest accepted date. |
| `maxDate()` | Set the latest accepted date. |
| `numberOfMonths()` | Control how many calendar months are displayed. |
| `weekStartsOn()` | Set the first weekday from `0` (Sunday) to `6` (Saturday). |
| `showWeekNumbers()` | Display calendar week numbers. |
| `clearable()` | Allow the selected date to be cleared. |
| `presets()` | Add named date or range shortcuts. |
| `timezone()` | Interpret values in a configured timezone. |
| `browserTimezone()` | Use the browser timezone supplied by the frontend. |
| `withTime()` | Turn the date filter into a date-time filter. |

### Date presets

```php
DateFilter::make('created_at', 'Created Date')
    ->presets([
        'Today' => now(),
        'Last 7 days' => [now()->subDays(7), now()],
    ]);
```

---

## DateTimeFilter

`DateTimeFilter` is the convenience type for timestamp comparisons. It enables time selection automatically and otherwise supports the same methods and clauses as `DateFilter`.

```php
use Zonvoir\InertiaTablePro\Filters\DateTimeFilter;

DateTimeFilter::make('processed_at', 'Processed At')
    ->timezone('UTC')
    ->browserTimezone();
```

To use a 24-hour input with `DateFilter`, call `withTime(time24h: true)`:

```php
DateFilter::make('scheduled_at', 'Scheduled At')
    ->withTime(time24h: true);
```

---

## Combining filter types

A typical table can expose several focused filter types together:

```php
public function filters(): array
{
    return [
        TextFilter::make('name', 'Customer'),

        SetFilter::make('status')
            ->withoutClause()
            ->options([
                'pending' => 'Pending',
                'paid' => 'Paid',
                'cancelled' => 'Cancelled',
            ]),

        SetFilter::make('company_id', 'Company')
            ->searchable()
            ->pluckOptionsFromModel(Company::class, 'name', 'id'),

        NumericFilter::make('total', 'Order Total'),

        BooleanFilter::make('is_priority', 'Priority'),

        DateFilter::make('created_at', 'Created Date'),
    ];
}
```

---

## Clauses & Comparators

Each filter operates through one or more **clauses** (comparators) that govern how matching records are queried. Clauses are defined in the `Clause` enum (aliased to `Comparator`):

```php
use Zonvoir\InertiaTablePro\Enums\Clause;
```

### Available Clauses

| Clause | Identifier | Description |
| --- | --- | --- |
| `Clause::Equals` | `'equals'` | Exact match (`=`) |
| `Clause::NotEquals` | `'not_equals'` | Does not equal (`!=`) |
| `Clause::Contains` | `'contains'` | Partial match (`LIKE %value%`) |
| `Clause::DoesNotContain` | `'does_not_contain'` | Does not contain substring |
| `Clause::StartsWith` | `'starts_with'` | Matches prefix (`LIKE value%`) |
| `Clause::EndsWith` | `'ends_with'` | Matches suffix (`LIKE %value`) |
| `Clause::GreaterThan` | `'greater_than'` | Greater than (`>`) |
| `Clause::GreaterThanOrEqual` | `'greater_than_or_equal'` | Greater than or equal (`>=`) |
| `Clause::LessThan` | `'less_than'` | Less than (`<`) |
| `Clause::LessThanOrEqual` | `'less_than_or_equal'` | Less than or equal (`<=`) |
| `Clause::Between` | `'between'` | Inclusive range (`BETWEEN a AND b`) |
| `Clause::NotBetween` | `'not_between'` | Outside range (`NOT BETWEEN a AND b`) |
| `Clause::In` | `'in'` | Value in collection (`WHERE IN (...)`) |
| `Clause::NotIn` | `'not_in'` | Value not in collection (`WHERE NOT IN (...)`) |
| `Clause::IsSet` | `'is_set'` | Value is not null and not empty |
| `Clause::IsNotSet` | `'is_not_set'` | Value is null or empty |

### Customizing Allowed Clauses

By default, each filter type provides sensible default clauses. You can restrict or reorder allowed clauses using `clauses()`:

```php
TextFilter::make('name')
    ->clauses([
        Clause::Contains,
        Clause::StartsWith,
        Clause::Equals,
    ]);
```

### Setting a Default Clause & Value

You can specify a default value and default clause to pre-populate the filter:

```php
TextFilter::make('status')
    ->default('active', Clause::Equals);
```

---

## Validating & Mutating Input

Use `validateUsing()` to validate or transform filter inputs before Eloquent queries are executed:

```php
TextFilter::make('name')
    ->validateUsing(function ($value, Clause $clause, $query) {
        if (!is_string($value) || strlen(trim($value)) < 2) {
            // Returning null prevents the filter from applying
            return null;
        }

        return trim($value);
    });
```

---

## Custom Query Execution

When a column requires custom query logic (such as searching computed columns or joining external tables), use `applyUsing()`:

```php
TextFilter::make('full_name')
    ->applyUsing(function ($query, string $attribute, Clause $clause, mixed $value) {
        $query->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$value}%"]);
    });
```

### Unwrapped Queries

By default, filters wrap query conditions in a nested `where()` group. When integrating raw joins or top-level clauses, use `applyUnwrapped()`:

```php
TextFilter::make('search')
    ->applyUnwrapped()
    ->applyUsing(function ($query, $attribute, $clause, $value) {
        $query->where('title', 'like', "%{$value}%")
            ->orWhere('sku', '=', $value);
    });
```

---

## Custom Metadata & Components

You can attach arbitrary metadata or specify a custom Vue component:

```php
TextFilter::make('sku')
    ->meta(['placeholder' => 'e.g. PRD-1234'])
    ->component('CustomSkuFilter');
```

---

## Frontend Customization (Vue)

### Custom Clause Symbols

By default, the header displays clauses by name (e.g., `Contains`, `Equals`). You can configure compact custom symbols using `setClauseSymbols()`:

```ts
import { setClauseSymbols } from '@zonvoir/inertia-table-vue';

setClauseSymbols({
  contains: '~',
  equals: '=',
  not_equals: '!=',
  starts_with: '^',
  ends_with: '$',
  greater_than: '>',
  less_than: '<',
  between: '..',
  is_set: '∃',
  is_not_set: '∄',
});
```

### Custom Filter Slot `#filter(attribute)`

In your Vue template, you can customize the editor UI for any filter using the `#filter(name)` slot:

```vue
<template>
  <Table :table="users">
    <template #filter(status)="{ filter, value, update, setDisplayValue, table }">
      <div class="p-3 flex flex-col gap-2">
        <label class="text-xs font-semibold">{{ filter.label }}</label>
        <select
          :value="value"
          @change="update(($event.target as HTMLSelectElement).value)"
          class="rounded border px-2 py-1 text-xs"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="button"
          @click="table.resetAllFilters()"
          class="text-xs text-slate-500 hover:text-red-600"
        >
          Reset Filters
        </button>
      </div>
    </template>
  </Table>
</template>
```

#### Slot Props

| Prop | Type | Description |
| --- | --- | --- |
| `filter` | `FilterDefinition` | The complete filter metadata object. |
| `value` | `any` | The current value of the filter draft. |
| `update` | `(value: any) => void` | Updates the filter value. |
| `setDisplayValue` | `(text: string) => void` | Overrides the display text shown in the header pill. |
| `table` | `object` | The table instance, including `table.resetAllFilters()`. |

### Resetting All Filters

Call `resetAllFilters()` on the table instance, header component, or `useTableFilters` composable:

```ts
// In script
const onClearAll = () => {
  table.resetAllFilters();
};
```

---

### Replacing Filter Containers (`#filter-panel`, `#filter-button`, `#filter-header`)

If you want to replace entire filter UI containers rather than individual filter inputs:

- **`#filter-panel`** (or **`#filters`**): Replaces the entire slide-out filter panel / sidebar container. Receives `{ table, open, close, tableApi }`.
- **`#filter-button`**: Replaces the toolbar filter toggle button. Receives `{ table, open, toggle, tableApi }`.
- **`#filter-header`**: Replaces the horizontal filter bar in header layout. Receives `{ table, open, close, tableApi }`.

```vue
<template>
  <Table :table="users">
    <!-- Replace the entire filter panel / sidebar section -->
    <template #filter-panel="{ open, close, table }">
      <aside v-if="open" class="w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shrink-0 ml-2">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 class="font-semibold text-sm text-slate-800">Custom Filter Panel</h3>
          <button type="button" @click="close" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="py-4 space-y-4">
          <!-- Custom filter controls -->
        </div>
      </aside>
    </template>
  </Table>
</template>
```

For more details on slot properties, see the [Slots Guide](/advanced/slots/#filter-slots).

