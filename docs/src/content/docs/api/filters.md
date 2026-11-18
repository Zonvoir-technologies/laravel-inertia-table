---
title: Filters API Reference
description: Complete PHP and Vue API reference for Zonvoir Table filters, including Filter base class, typed filters, Clause enum, and frontend filter helpers.
---

:::tip[Zonvoir Table Pro Feature]
This API reference covers the commercial **Zonvoir Table Pro** package.
:::

`Zonvoir\InertiaTablePro\Filters\Filter` is the abstract base class for table filter definitions in Zonvoir Table.

## PHP Traits: HasFilters & HasProFeatures

| Trait | Best For | What it Includes |
| --- | --- | --- |
| Zonvoir\InertiaTablePro\Concerns\HasFilters | Tables needing **only filters** | Standalone filter builder, URL query state serialization, query clause execution |
| Zonvoir\InertiaTablePro\Concerns\HasProFeatures | Tables needing **all Pro features** | Includes HasFilters + HasColumnPersistence (filters + column reordering & database persistence) |

---

## Class Summary

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\Filter` |
| Type | `abstract class` |
| Concrete Classes | `TextFilter`, `NumericFilter`, `SetFilter`, `DateFilter`, `DateTimeFilter`, `BooleanFilter` |
| Factory Methods | `make()`, `create()` |

---

## Filter Types

| Filter Class | Serialized Type | Description |
| --- | --- | --- |
| [`TextFilter`](#textfilter) | `'text'` | String attributes with contains, starts_with, ends_with, and exact match clauses |
| [`NumericFilter`](#numericfilter) | `'numeric'` | Numbers with comparisons (`>`, `<`, `>=`, `<=`), range (`between`), and equality |
| [`SetFilter`](#setfilter-methods) | `'set'` | Predefined options, multi-select, search, lazy loading, and model/relation plucking |
| [`DateFilter`](#datefilter-methods) | `'date'` | Date comparisons (`before`, `after`, `between`, `equals`) |
| [`DateTimeFilter`](#datetimefilter) | `'datetime'` | Timestamp comparisons with precision |
| [`BooleanFilter`](#booleanfilter) | `'boolean'` | True / false / null boolean filtering |

---

## Base Filter Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>make()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function make(
    string $name,
    string|callable|null $label = null,
    ?string $key = null,
    bool $nullable = false,
    bool $wrapped = true,
    ?array $comparators = null,
    mixed $default = null,
    string|Comparator|null $defaultComparator = null,
    ?callable $apply = null,
    ?array $clauses = null,
    bool $applyUnwrapped = false,
    ?callable $applyUsing = null,
    ?callable $validateUsing = null,
    ?array $meta = null,
    ?string $component = null,
): static</code></pre>
      <p>Create a new filter definition instance.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>create()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function create(...$args): static</code></pre>
      <p>Alias of <code>make()</code>.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>key()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function key(string $key): static</code></pre>
      <p>Explicitly configure the query parameter and serialization key.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>label()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function label(?string $label): static</code></pre>
      <p>Set the human-readable display label for the filter.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>clauses()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function clauses(array $clauses): static</code></pre>
      <p>Configure the allowed clauses/comparators for this filter. Alias of <code>comparators()</code>.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>default()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function default(mixed $value, string|Comparator|Clause|null $comparator = null): static</code></pre>
      <p>Set the default value and optional default clause.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>nullable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function nullable(bool $nullable = true): static</code></pre>
      <p>Allow the filter to explicitly match null values in the database.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>validateUsing()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function validateUsing(callable $callback): static</code></pre>
      <p>Validate or mutate the filter value before query execution. Accepts <code>($value, $clause, $query)</code>. Returning <code>null</code> skips applying the filter.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>applyUsing()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function applyUsing(callable $callback, bool $applyUnwrapped = false): static</code></pre>
      <p>Override the default query callback. Supports 4-argument signature <code>($query, $attribute, $clause, $value)</code> or 3-argument signature <code>($query, $value, $clause)</code>.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>applyUnwrapped()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function applyUnwrapped(bool $unwrapped = true): static</code></pre>
      <p>Prevent wrapping the filter conditions in a nested <code>where()</code> closure.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>meta()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function meta(array $meta): static</code></pre>
      <p>Attach custom metadata array serialized into the filter definition payload.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>component()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function component(string $component): static</code></pre>
      <p>Specify the name of a custom Vue component used to render the filter editor.</p>
    </div>
  </details>
</div>

---

## TextFilter

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\TextFilter` |
| Serialized type | `'text'` |
| Default clauses | `Equals`, `NotEquals`, `Contains`, `DoesNotContain`, `StartsWith`, `EndsWith` |

`TextFilter` inherits all [base filter methods](#base-filter-methods) and does not add type-specific fluent methods. Values must be strings, except that a nullable filter can use `null` with `Equals` or `NotEquals`.

---

## NumericFilter

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\NumericFilter` |
| Serialized type | `'numeric'` |
| Default clauses | `Equals`, `NotEquals`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, `Between` |

`NumericFilter` inherits all [base filter methods](#base-filter-methods). It accepts finite integers, floats, and numeric strings. `Between` requires two values in ascending order.

---

## BooleanFilter

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\BooleanFilter` |
| Serialized type | `'boolean'` |
| Default clauses | `Equals`, `NotEquals` |

`BooleanFilter` inherits all [base filter methods](#base-filter-methods). It normalizes `true`, `false`, `1`, `0`, `'1'`, `'0'`, `'true'`, and `'false'` to booleans before applying the query.

---

## SetFilter Methods

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\SetFilter` |
| Serialized type | `'set'` |
| Default clauses | `Equals`, `NotEquals`, `In`, `NotIn` |

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>options()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function options(array $options): static</code></pre>
      <p>Provide an associative array of <code>[value => label]</code> options for the set filter.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>withoutClause()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withoutClause(bool $withoutClause = true): static</code></pre>
      <p>Hide the clause dropdown in the UI and default the filter to <code>Clause::Equals</code>.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>multiple()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function multiple(bool $multiple = true): static</code></pre>
      <p>Enable multi-select mode, allowing multiple values to be selected simultaneously.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>searchable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function searchable(bool $searchable = true): static</code></pre>
      <p>Add a client-side search field to the set filter's option dropdown.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>lazy()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function lazy(bool $lazy = true): static</code></pre>
      <p>Defer option resolution until requested by the frontend.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>pluckOptionsFromModel()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function pluckOptionsFromModel(string $modelClass, string $labelColumn = 'name', string $valueColumn = 'id'): static</code></pre>
      <p>Dynamically pluck options from an Eloquent model query.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>pluckOptionsFromRelation()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function pluckOptionsFromRelation(string $labelColumn = 'name', ?string $valueColumn = null, ?string $modelClass = null): static</code></pre>
      <p>Dynamically pluck options from the related Eloquent relationship.</p>
    </div>
  </details>
</div>

---

## DateFilter Methods

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\DateFilter` |
| Serialized type | `'date'`, or `'datetime'` after `withTime()` |
| Default clauses | `Equals`, `NotEquals`, `Before`, `After`, `OnOrBefore`, `OnOrAfter`, `Between` |

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>withTime()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withTime(bool $time24h = false): static</code></pre>
      <p>Enable time selection and serialize the filter as <code>datetime</code>. Pass <code>true</code> for a 24-hour input.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>presets()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function presets(array $presets): static</code></pre>
      <p>Configure named date or date-range shortcuts as <code>label =&gt; value</code> pairs.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>timezone()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function timezone(DateTimeZone|string $timezone): static</code></pre>
      <p>Set the timezone used to interpret filter values before querying.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>browserTimezone()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function browserTimezone(bool $browser = true): static</code></pre>
      <p>Use timezone information supplied by the browser.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>minDate()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function minDate(string|DateTimeInterface $minDate): static</code></pre>
      <p>Set the earliest value accepted by the UI and backend validator.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>maxDate()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function maxDate(string|DateTimeInterface $maxDate): static</code></pre>
      <p>Set the latest value accepted by the UI and backend validator.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>numberOfMonths()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function numberOfMonths(int $numberOfMonths = 2): static</code></pre>
      <p>Set the number of calendar months displayed, with a minimum of one.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>showWeekNumbers()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function showWeekNumbers(bool $show = true): static</code></pre>
      <p>Show or hide calendar week numbers.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>weekStartsOn()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function weekStartsOn(int $day = 0): static</code></pre>
      <p>Set the first weekday from <code>0</code> (Sunday) through <code>6</code> (Saturday).</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>clearable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function clearable(bool $clearable = true): static</code></pre>
      <p>Allow the current picker value to be cleared.</p>
    </div>
  </details>
</div>

---

## DateTimeFilter

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTablePro\Filters\DateTimeFilter` |
| Serialized type | `'datetime'` |
| Default clauses | `Equals`, `NotEquals`, `Before`, `After`, `OnOrBefore`, `OnOrAfter`, `Between` |

`DateTimeFilter` extends `DateFilter` and enables time selection during construction. It supports every [DateFilter method](#datefilter-methods).

---

## Clause / Comparator Enum

`Zonvoir\InertiaTablePro\Enums\Clause` is an alias of `Comparator`.

| Case | Value | Min Values | Max Values | Description |
| --- | --- | --- | --- | --- |
| `Clause::Equals` | `'equals'` | 1 | 1 | Exact match |
| `Clause::NotEquals` | `'not_equals'` | 1 | 1 | Not equal |
| `Clause::Contains` | `'contains'` | 1 | 1 | Substring match |
| `Clause::DoesNotContain` | `'does_not_contain'` | 1 | 1 | Excludes substring |
| `Clause::StartsWith` | `'starts_with'` | 1 | 1 | Prefix match |
| `Clause::EndsWith` | `'ends_with'` | 1 | 1 | Suffix match |
| `Clause::GreaterThan` | `'greater_than'` | 1 | 1 | Greater than |
| `Clause::GreaterThanOrEqual` | `'greater_than_or_equal'` | 1 | 1 | Greater than or equal |
| `Clause::LessThan` | `'less_than'` | 1 | 1 | Less than |
| `Clause::LessThanOrEqual` | `'less_than_or_equal'` | 1 | 1 | Less than or equal |
| `Clause::Between` | `'between'` | 2 | 2 | Value within inclusive range |
| `Clause::NotBetween` | `'not_between'` | 2 | 2 | Value outside range |
| `Clause::In` | `'in'` | 1 | `null` | Value in array |
| `Clause::NotIn` | `'not_in'` | 1 | `null` | Value not in array |
| `Clause::IsSet` | `'is_set'` | 0 | 0 | Column has non-null value |
| `Clause::IsNotSet` | `'is_not_set'` | 0 | 0 | Column is null or blank |

---

## Frontend Vue API Reference

Filter components and composables are exported directly by `@zonvoir/inertia-table-vue`:

```ts
import {
  setClauseSymbols,
  getClauseSymbol,
  resetClauseSymbols,
  useTableFilters,
  TableFilterButton,
  TableFilterDrawer,
  TableFilterHeader,
  TableFilterPanel,
  ActiveFilters,
  TextFilter,
  NumericFilter,
  SetFilter,
  DateFilter,
  BooleanFilter,
} from '@zonvoir/inertia-table-vue';
```

### Methods

| Function | Signature | Description |
| --- | --- | --- |
| `setClauseSymbols()` | `(symbols: Record<string, string>) => void` | Register custom symbols for filter clauses in header pills. |
| `getClauseSymbol()` | `(key: string) => string \| undefined` | Retrieve the symbol configured for a clause. |
| `resetClauseSymbols()` | `() => void` | Clear custom clause symbols and restore default labels. |
| `useTableFilters()` | `(table, options?) => UseTableFiltersReturn` | Filter management composable powering table filter states. |

### Filter Slots

| Slot | Scope Props | Description |
| --- | --- | --- |
| `filter-button` | `table`, `open`, `toggle`, `table-api` | Replaces the filter toggle button in the toolbar. |
| `filter-panel` | `table`, `open`, `close`, `table-api` | Replaces the entire slide-out filter panel / sidebar container. |
| `filters` | `table`, `open`, `close`, `layout`, `table-api` | Container wrapper slot around `filter-panel`. |
| `filter-header` | `table`, `open`, `close`, `table-api` | Replaces the horizontal filter bar in header layout. |
| `filter(attribute)` | `filter`, `value`, `update`, `table`, `close` | Replaces the editor input for a specific filter attribute. |

For detailed examples, see the [Vue Slots Guide](/advanced/slots/#filter-slots).

