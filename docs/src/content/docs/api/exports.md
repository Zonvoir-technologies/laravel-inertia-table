---
title: Exports API Reference
description: Detailed method reference for Zonvoir\InertiaTable\Export defining Excel and CSV spreadsheet export capabilities.
---

`Zonvoir\InertiaTable\Export` is a serializable export definition. Return exports from `Table::exports()` to expose export controls in the frontend payload.

## Class

| Item | Value |
| --- | --- |
| Class | `Zonvoir\InertiaTable\Export` |
| Implements | `JsonSerializable` |
| Traits | `Conditionable`, `ConfiguresExport`, `ExecutesExport`, `SerializesExport` |
| Factory methods | `make()`, `create()` |

## Factory Methods

```php
public static function make(
    ?string $label = null,
    ?string $filename = null,
    ?string $type = null,
    bool|callable|null $authorize = null,
    bool $limitToFilteredRows = false,
    bool $limitToSelectedRows = false,
    bool $queued = false,
    ?callable $using = null,
    array $meta = [],
    array $data = [],
    array $events = [],
): self
```

`create()` accepts the same arguments and delegates to `make()`.

## Static Defaults

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>defaultLimitToFilteredRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function defaultLimitToFilteredRows(bool $enabled = true): void</code></pre>
      <p>Change the default filtered-row limit for new exports.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultLimitToSelectedRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function defaultLimitToSelectedRows(bool $enabled = true): void</code></pre>
      <p>Change the default selected-row limit for new exports.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultQueueName()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function defaultQueueName(?string $queue = null): void</code></pre>
      <p>Set the default queue name for queued exports.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>defaultQueueDisk()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public static function defaultQueueDisk(?string $disk = null): void</code></pre>
      <p>Set the default queue disk for queued exports.</p>
    </div>
  </details>
</div>

## Configuration Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>key()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function key(?string $key): self</code></pre>
      <p>Override the serialized export key.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>keyName()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function keyName(): string</code></pre>
      <p>Resolve the configured key or a slug of the label.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>label()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function label(?string $label): self</code></pre>
      <p>Set the export label.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>filename()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function filename(?string $filename): self</code></pre>
      <p>Set the generated filename.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>type()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function type(?string $type): self</code></pre>
      <p>Set the Excel writer type. Defaults to XLSX.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>authorize()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function authorize(bool|callable $authorize = true): self</code></pre>
      <p>Set static or callback authorization.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>limitToFilteredRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function limitToFilteredRows(bool $limit = true): self</code></pre>
      <p>Export the filtered query instead of the unfiltered base query.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>limitToSelectedRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function limitToSelectedRows(bool $limit = true): self</code></pre>
      <p>Export only selected row keys.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queue()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queue(?string $filename = null, ?string $disk = null, ?callable $withQueuedJob = null): self</code></pre>
      <p>Mark the export as queued.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>withQueuedJob()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withQueuedJob(?callable $callback): self</code></pre>
      <p>Customize the queued job after it is created.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>using()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function using(?callable $callback): self</code></pre>
      <p>Provide custom export execution.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>asDownload()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function asDownload(bool $download = true): self</code></pre>
      <p>Configure whether execution returns a download.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>redirect()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function redirect(string|array|callable|null $to): self</code></pre>
      <p>Configure redirect behavior after export execution.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>redirectToRoute()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function redirectToRoute(string $route, array $parameters = []): self</code></pre>
      <p>Redirect to a Laravel route.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>redirectBackWithDialog()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function redirectBackWithDialog(?string $title = null, ?string $message = null): self</code></pre>
      <p>Redirect back with dialog metadata and disable direct download.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>events()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function events(array $events): self</code></pre>
      <p>Merge event metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>meta()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function meta(array $meta): self</code></pre>
      <p>Merge arbitrary export metadata.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>dataAttributes()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function dataAttributes(array $data): self</code></pre>
      <p>Merge serialized data attributes.</p>
    </div>
  </details>
</div>

## Execution Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>isAuthorized()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isAuthorized(Table $table): bool</code></pre>
      <p>Resolve static or callback authorization.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>executeUsing()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function executeUsing(Table $table, ExportRequest $request, Builder $query): mixed</code></pre>
      <p>Run the configured custom exporter callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>hasCustomExporter()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function hasCustomExporter(): bool</code></pre>
      <p>Check whether `using()` is configured.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isLimitedToFilteredRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isLimitedToFilteredRows(): bool</code></pre>
      <p>Inspect filtered-row limiting.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isLimitedToSelectedRows()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isLimitedToSelectedRows(): bool</code></pre>
      <p>Inspect selected-row limiting.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>isQueued()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function isQueued(): bool</code></pre>
      <p>Inspect queued mode.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>shouldDownload()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function shouldDownload(): bool</code></pre>
      <p>Inspect download behavior.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolvedFilename()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resolvedFilename(): string</code></pre>
      <p>Resolve the download filename.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queueFilename()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queueFilename(): string</code></pre>
      <p>Resolve the queued filename.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queueDisk()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queueDisk(): ?string</code></pre>
      <p>Resolve the queue disk.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queueName()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queueName(): ?string</code></pre>
      <p>Resolve the queue name.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>writerType()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function writerType(): string</code></pre>
      <p>Resolve the Excel writer type.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>queuedJob()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function queuedJob(mixed $job): mixed</code></pre>
      <p>Apply the queued job callback.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>redirectResponse()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function redirectResponse(): ?RedirectResponse</code></pre>
      <p>Build the configured redirect response.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>eventsDefinition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function eventsDefinition(): array</code></pre>
      <p>Return configured export events.</p>
    </div>
  </details>
</div>

## Serialization

`SerializesExport::toArray()` and `jsonSerialize()` expose the frontend metadata used by the Vue adapter. Table metadata includes `exportEndpoint` only when `Table::exportsDefinition()` is not empty.

## Guide

See [Exports](/core-concepts/exports/) for practical table examples.