---
title: Column Base Class API Reference
description: Detailed method reference for the abstract Zonvoir\InertiaTable\Columns\Column base class and concrete column types.
---

`Zonvoir\InertiaTable\Columns\Column` is the abstract base class for backend column definitions. Concrete column classes include `TextColumn`, `NumericColumn`, `BooleanColumn`, `BadgeColumn`, `ImageColumn`, `DateColumn`, `DateTimeColumn`, `SerialNumberColumn`, and `ActionColumn`.

## Class

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTable\Columns\Column` |
| Type | `abstract class` |
| Constructor | `protected function __construct(string $name)` |
| Factory methods | `make()`, `create()` |

## Factory Signature

```php
public static function make(
    string $name,
    string|callable|null $label = null,
    bool $sortable = false,
    bool $toggleable = true,
    bool $searchable = false,
    string|ColumnAlignment|null $alignment = null,
    ?callable $mapAs = null,
    bool $visible = true,
    ?callable $sortUsing = null,
    array $meta = [],
    bool $sticky = false,
    ?callable $searchUsing = null,
    ?string $key = null,
    ?string $labelClass = null,
    ?string $cellClass = null,
    false|callable|null $exportAs = null,
    string|callable|null $exportLabel = null,
    ?string $exportFormat = null,
    array|callable|null $exportStyle = null,
): static
```

`create()` accepts the same arguments and delegates to `make()`.

## Display And State Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>type()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function type(): string</code></pre>
      <p>Infer the serialized type from the concrete class name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>name()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function name(): string</code></pre>
      <p>Return the backend field name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>key()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function key(?string $key): static</code></pre>
      <p>Override the serialized key.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>label()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function label(string|callable|null $label): static</code></pre>
      <p>Set the display label. Label callbacks are invoked with no arguments.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>visible()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function visible(bool $visible = true): static</code></pre>
      <p>Set initial visibility.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>toggleable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function toggleable(bool $toggleable = true): static</code></pre>
      <p>Disable user column toggling when passed `false`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>sticky()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function sticky(bool $sticky = true): static</code></pre>
      <p>Mark the column as sticky in metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>alignment()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function alignment(string|ColumnAlignment|null $alignment): static</code></pre>
      <p>Set alignment metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>width()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function width(string|int|null $width): static</code></pre>
      <p>Set width metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>minWidth()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function minWidth(string|int|null $minWidth): static</code></pre>
      <p>Set minimum width metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>maxWidth()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function maxWidth(string|int|null $maxWidth): static</code></pre>
      <p>Set maximum width metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>labelClass()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function labelClass(?string $labelClass): static</code></pre>
      <p>Set header label class metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>cellClass()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function cellClass(?string $cellClass): static</code></pre>
      <p>Set cell class metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>tooltip()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function tooltip(?string $tooltip): static</code></pre>
      <p>Add tooltip metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultValue()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function defaultValue(mixed $defaultValue): static</code></pre>
      <p>Add fallback value metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>meta()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function meta(array $meta): static</code></pre>
      <p>Merge arbitrary adapter metadata.</p>
    </div>
  </details>
</div>

## Query Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>searchable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function searchable(bool $searchable = true): static</code></pre>
      <p>Enable column search metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>searchUsing()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function searchUsing(?callable $callback): static</code></pre>
      <p>Register a custom search callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>searchCallback()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function searchCallback(): ?Closure</code></pre>
      <p>Return the configured search callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isSearchable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isSearchable(): bool</code></pre>
      <p>Inspect searchable state.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>sortable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function sortable(bool $sortable = true): static</code></pre>
      <p>Enable sort metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>sortUsing()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function sortUsing(?callable $callback): static</code></pre>
      <p>Register a custom sort callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>sortCallback()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function sortCallback(): ?Closure</code></pre>
      <p>Return the configured sort callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isSortable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isSortable(): bool</code></pre>
      <p>Inspect sortable state.</p>
    </div>
  </details>
</div>

## Value Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>mapAs()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function mapAs(?callable $mapAs): static</code></pre>
      <p>Transform a cell value.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolveValue()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolveValue(mixed $record): mixed</code></pre>
      <p>Resolve `data_get($record, $name)` and apply `mapAs()`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>url()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function url(string|Url|callable|null $url): static</code></pre>
      <p>Configure cell URL metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolveUrl()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolveUrl(mixed $record): string|array|null</code></pre>
      <p>Resolve string, `Url`, or callback URL metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>image()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function image(string|callable|null $image, ?callable $configure = null): static</code></pre>
      <p>Configure image metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolveImage()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolveImage(mixed $record): ?array</code></pre>
      <p>Resolve image configuration to serialized metadata.</p>
    </div>
  </details>
</div>

`mapAs()` callbacks are invoked as `fn (mixed $value, mixed $record): mixed`.

URL callbacks are invoked as `fn (mixed $record, Url $url): string|Url|array|null`.

Image callbacks support either record-first or `Image`-first parameters. The implementation accepts `fn ($record)`, `fn ($record, Image $image)`, `fn (Image $image)`, or `fn (Image $image, $record)`.

## Export Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>export()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function export(array $configuration): static</code></pre>
      <p>Store arbitrary export metadata on the column.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>exportAs()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exportAs(false|callable|null $exportAs = null): static</code></pre>
      <p>Transform the value used by generated exports, or disable export with `false`.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>exportFormat()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exportFormat(?string $format): static</code></pre>
      <p>Set column format metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>exportStyle()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exportStyle(array|callable|null $style): static</code></pre>
      <p>Set static or callback style metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>exportLabel()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function exportLabel(string|callable|null $label): static</code></pre>
      <p>Override the export heading label.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>dontExport()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function dontExport(bool $condition = true): static</code></pre>
      <p>Exclude this column from generated exports.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isExportable()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isExportable(): bool</code></pre>
      <p>Inspect exportable state.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolvedExportLabel()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolvedExportLabel(): string</code></pre>
      <p>Resolve export heading text.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolveExportValue()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolveExportValue(mixed $record): mixed</code></pre>
      <p>Resolve the value passed to export rows.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolvedExportFormat()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolvedExportFormat(): ?string</code></pre>
      <p>Resolve export format metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolvedExportStyle()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolvedExportStyle(mixed $sheet = null): ?array</code></pre>
      <p>Resolve export style metadata.</p>
    </div>
  </details>
</div>

`exportAs()` callbacks are invoked as `fn (mixed $value, mixed $record): mixed`.

`exportStyle()` callbacks are invoked as `fn (mixed $sheet, Column $column): ?array`.

## Serialization

`toArray()` serializes the column key, name, type, label, visibility, search/sort/toggle/sticky flags, alignment, sizing, classes, default value, export metadata, arbitrary metadata, and optional tooltip.