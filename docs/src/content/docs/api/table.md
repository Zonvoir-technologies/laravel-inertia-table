---
title: Table Base Class API Reference
description: Complete method reference for Zonvoir\InertiaTable\Table configuring Eloquent queries, columns, sorting, pagination, and actions.
---

`Zonvoir\InertiaTable\Table` is the abstract base class for backend table definitions.

## Class

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTable\Table` |
| Type | `abstract class` |
| Implements | `Arrayable`, `JsonSerializable` |
| Required override | `columns()` |
| Factory methods | `make()`, `create()` |

## Properties Designed For Table Classes

| Property | Type | Default | Purpose |
| --- | --- | --- | --- |
| `$resource` | `?string` | `null` | Eloquent model class used by `query()`. |
| `$search` | `array\|string\|null` | `null` | Table-level searchable fields. |
| `$defaultSort` | `?string` | `null` | Default sort key. Prefix with `-` for descending. |
| `$pagination` | `bool` | `true` | Enable pagination. |
| `$paginationType` | `PaginationType` | `PaginationType::Standard` | Select standard, simple, or cursor pagination. |
| `$perPageOptions` | `?array` | `[15, 30, 50, 100]` | Allowed per-page values. |
| `$defaultPerPage` | `?int` | `15` | Default per-page value. |
| `$scrollToTop` | `bool` | `true` | Frontend pagination scroll behavior. |
| `$stickyHeader` | `?bool` | `false` | Sticky header metadata. |
| `$rowSelectionKey` | `?string` | `'id'` | Row key used for selection. |
| `$selectable` | `bool` | `true` | Enable row selection. |
| `$persistRowSelectionAcrossPages` | `bool` | `false` | Preserve selected keys across page changes. |
| `$emptyState` | `TableEmptyState\|array\|false\|null` | `null` | Empty state metadata. |

## Core Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>make()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function make(): static</code></pre>
      <p><strong>Notes</strong></p>
      <p>Instantiate the table.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>create()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function create(): static</code></pre>
      <p><strong>Notes</strong></p>
      <p>Alias of `make()`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>name()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function name(): string</code></pre>
      <p><strong>Notes</strong></p>
      <p>Explicit or inferred table name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isNamed()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isNamed(): bool</code></pre>
      <p><strong>Notes</strong></p>
      <p>Check for an explicit table name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>id()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function id(): string</code></pre>
      <p><strong>Notes</strong></p>
      <p>Alias-style accessor for `name()`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>named()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function named(string $name): static</code></pre>
      <p><strong>Notes</strong></p>
      <p>Clone with a query namespace.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>as()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function as(string $name): static</code></pre>
      <p><strong>Notes</strong></p>
      <p>Alias of `named()`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>columns()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>abstract public function columns(): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Required. Return `list<Column>`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resource()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resource(): Builder|string|null</code></pre>
      <p><strong>Notes</strong></p>
      <p>Return a model class, builder, or null.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>query()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function query(): Builder</code></pre>
      <p><strong>Notes</strong></p>
      <p>Resolve the table query from `resource()`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>apply()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function apply(?Builder $query = null, ?TableRequest $request = null): Builder</code></pre>
      <p><strong>Notes</strong></p>
      <p>Apply search and sort to a query.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>paginate()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function paginate(?Builder $query = null, ?TableRequest $request = null): mixed</code></pre>
      <p><strong>Notes</strong></p>
      <p>Run the configured paginator.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>results()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function results(?Builder $query = null, ?TableRequest $request = null): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Return definition plus paginated rows.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>payload()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function payload(?TableRequest $request = null): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Build the table definition payload.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>definition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function definition(): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Alias-style definition payload without request input.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>toArray()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function toArray(): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Serialize results for the current request.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>jsonSerialize()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function jsonSerialize(): array</code></pre>
      <p><strong>Notes</strong></p>
      <p>Delegate to `toArray()`.</p>
    </div>
  </details>
</div>

## Override Hooks

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>transformModel()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function transformModel(Model $model, array $data): array</code></pre>
      <p>Modify serialized row data.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>rowUrl()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function rowUrl(Model $model, Url $url): string|Url|null</code></pre>
      <p>Add row navigation metadata.</p>
    </div>
  </details>
  <details id="actions" class="api-method" name="api-methods">
    <summary><code>actions()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function actions(): array</code></pre>
      <p>Return row and bulk `Action` definitions.</p>
    </div>
  </details>
  <details id="exports" class="api-method" name="api-methods">
    <summary><code>exports()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exports(): array</code></pre>
      <p>Return `Export` definitions.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isSelectable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isSelectable(Model $model): bool</code></pre>
      <p>Decide whether a row can be selected.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultState()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function defaultState(): array|TableStateContract</code></pre>
      <p>Override initial state.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>meta()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function meta(): array</code></pre>
      <p>Build table metadata. Usually extended with care.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>emptyState()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function emptyState(): TableEmptyState|array|false|null</code></pre>
      <p>Return empty state metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>withQueryBuilder()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withQueryBuilder(TableQueryBuilder $queryBuilder): ?TableQueryBuilder</code></pre>
      <p>Customize the query builder service.</p>
    </div>
  </details>
</div>

## State And Navigation

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>state()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function state(?TableRequest $request = null): TableState</code></pre>
      <p>Merge default state and table request input.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>stateFromRequest()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function stateFromRequest(Request $request): TableState</code></pre>
      <p>Build state from an HTTP request.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultSort()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function defaultSort(): ?string</code></pre>
      <p>Read default sort configuration.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>stickyHeader()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function stickyHeader(): bool</code></pre>
      <p>Read sticky header configuration.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>rowSelectionKey()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function rowSelectionKey(): ?string</code></pre>
      <p>Resolve selected row key name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>persistsRowSelectionAcrossPages()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function persistsRowSelectionAcrossPages(): bool</code></pre>
      <p>Read row selection persistence configuration.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>navigation()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function navigation(?TableRequest $request = null): TableNavigation</code></pre>
      <p>Build query string transitions.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>searchable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function searchable(): array</code></pre>
      <p>Normalize table-level search fields.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>pagination()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function pagination(): PaginationConfiguration</code></pre>
      <p>Resolve pagination configuration.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>pageName()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function pageName(): string</code></pre>
      <p>Resolve query string page key.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>cursorName()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function cursorName(): string</code></pre>
      <p>Resolve query string cursor key.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queryStringState()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queryStringState(Contracts\TableState $state, bool $includePage = false): array</code></pre>
      <p>Serialize state for URLs.</p>
    </div>
  </details>
</div>

## Definition Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>columnsDefinition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function columnsDefinition(): array</code></pre>
      <p>Validate and normalize column definitions.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>actionsDefinition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function actionsDefinition(): array</code></pre>
      <p>Validate and normalize action definitions.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>exportsDefinition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exportsDefinition(): array</code></pre>
      <p>Validate and normalize export definitions.</p>
    </div>
  </details>
</div>

## Example

```php
use App\Models\User;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;
    protected array|string|null $search = ['name', 'email'];
    protected ?string $defaultSort = 'name';

    public function columns(): array
    {
        return [
            TextColumn::make('name')->sortable()->searchable(),
            TextColumn::make('email')->searchable(),
        ];
    }
}
```
