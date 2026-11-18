---
title: Column Persistence API Reference
description: Complete PHP and Vue API reference for Zonvoir Table column persistence, including HasColumnPersistence, TablePreferenceService, and useColumnPersistence composable.
---

:::tip[Zonvoir Table Pro Feature]
This API reference covers the commercial **Zonvoir Table Pro** package.
:::

Column Persistence allows user-customized column ordering to be stored in the database and applied automatically when rendering tables.

---

## PHP Trait: HasColumnPersistence

`Zonvoir\InertiaTablePro\Concerns\HasColumnPersistence` provides backend column ordering persistence for table classes.

### Trait Summary

| Item | Value |
| --- | --- |
| Trait | `Zonvoir\InertiaTablePro\Concerns\HasColumnPersistence` |
| Included By | `Zonvoir\InertiaTablePro\Concerns\HasProFeatures` |
| Used In | Table definitions extending `Zonvoir\InertiaTable\Table` |

### Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>persistsColumns()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function persistsColumns(): bool</code></pre>
      <p>Determine whether column persistence is currently enabled on the table instance, based on instance configuration and global package settings.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>withoutColumnPersistence()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withoutColumnPersistence(): static</code></pre>
      <p>Disable column persistence for this table instance.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>withColumnPersistence()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function withColumnPersistence(bool $enable = true): static</code></pre>
      <p>Explicitly enable or disable column persistence for this table instance.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>persistenceIdentifier()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function persistenceIdentifier(): string</code></pre>
      <p>Resolve the stable identifier used to look up and store user preferences. Explicitly named tables use that name; otherwise the core table name is used.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>savedColumnOrder()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function savedColumnOrder(): ?array</code></pre>
      <p>Retrieve the cached or persisted column order array for the current authenticated user.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resolvePersistenceUser()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>protected function resolvePersistenceUser(): ?Authenticatable</code></pre>
      <p>Resolve the authenticatable user model against which preferences are stored. Defaults to <code>auth()->user()</code>.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>applyColumnOrder()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function applyColumnOrder(array $columns, ?array $savedOrder = null): array</code></pre>
      <p>Reorder a list of column instances or column definitions based on saved column keys, preserving any newly introduced columns at the end.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>columnsDefinition()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function columnsDefinition(): array</code></pre>
      <p>Overrides the core table method to automatically apply the authenticated user's saved column order before returning column definitions.</p>
    </div>
  </details>
</div>

---

## PHP Service: TablePreferenceService

`Zonvoir\InertiaTablePro\Services\TablePreferenceService` manages database preference records.

### Service Methods

<div class="api-methods">
  <details class="api-method" name="api-methods">
    <summary><code>findForUser()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function findForUser(?Authenticatable $user, string $tableName): ?TableUserPreference</code></pre>
      <p>Find the user preference record matching the user and table name. Returns <code>null</code> when no user is provided.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>saveForUser()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function saveForUser(Authenticatable $user, string $tableName, array $columns, ?array $settings = null): TableUserPreference</code></pre>
      <p>Create or update the preference record for the specified user and table name with the given column order.</p>
    </div>
  </details>
  <details class="api-method" name="api-methods">
    <summary><code>resetForUser()</code></summary>
    <div class="api-method-body">
      <p><strong>Signature</strong></p>
      <pre><code>public function resetForUser(Authenticatable $user, string $tableName): bool</code></pre>
      <p>Delete the stored preference record for the user and table name.</p>
    </div>
  </details>
</div>

---

## Eloquent Model: TableUserPreference

`Zonvoir\InertiaTablePro\Models\TableUserPreference` is the Eloquent model representing stored user table preferences.

### Schema Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `int` | Primary key |
| `user_type` | `?string` | Polymorphic morph class of the authenticatable model |
| `user_id` | `?string` | User identifier |
| `table_name` | `string` | Table identifier string |
| `columns` | `?array` | JSON-casted array of column attribute strings |
| `settings` | `?array` | JSON-casted additional preferences or view settings |
| `created_at` | `DateTime` | Record creation timestamp |
| `updated_at` | `DateTime` | Record modification timestamp |

---

## Persistence Payload

When persistence is enabled, the backend adds `reorderable: true` at the top level of the table payload and merges these values into `meta`:

```json
{
  "reorderable": true,
  "meta": {
    "reorderable": true,
    "preferenceEndpoint": "/zonvoir-table/preferences",
    "preferenceResetEndpoint": "/zonvoir-table/preferences"
  }
}
```

Endpoint values are present when the corresponding named routes are registered.

---

## HTTP Endpoints

| Method | Route name | Default path | Request body |
| --- | --- | --- | --- |
| `POST` | `zonvoir-table.preferences.store` | `/zonvoir-table/preferences` | `{ "table": string, "columns": string[], "settings"?: object }` |
| `DELETE` | `zonvoir-table.preferences.destroy` | `/zonvoir-table/preferences` | `{ "table": string }` |

Both endpoints use the configured `zonvoir-table.persistence.middleware` stack plus `AuthenticateTablePreferences`. Unauthenticated requests return `401`; invalid authenticated requests return `422`.

Store validation limits the table name to 255 characters, the order to 100 column keys, each key to 255 characters, and optional settings to 50 entries.

---

## Vue Composable: useColumnPersistence

`useColumnPersistence` is exported by `@zonvoir/inertia-table-vue` for interacting with the column persistence API.

### Options: `UseColumnPersistenceOptions`

```ts
export interface UseColumnPersistenceOptions {
  table?: TableDefinition | TableResource;
  tableName?: string;
  endpoint?: string;
  resetEndpoint?: string;
  debounceMs?: number;
}
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `table` | `TableDefinition \| TableResource` | `undefined` | Table payload containing its name and optional metadata endpoints |
| `tableName` | `string` | `''` | Explicit table name override |
| `endpoint` | `string` | `'/zonvoir-table/preferences'` | Endpoint for storing column preferences |
| `resetEndpoint` | `string` | `'/zonvoir-table/preferences'` | Endpoint for deleting stored preferences |
| `debounceMs` | `number` | `300` | Debounce duration in milliseconds before saving |

### Return Value: `UseColumnPersistenceReturn`

```ts
export interface UseColumnPersistenceReturn {
  isSaving: Ref<boolean>;
  persistColumnOrder: (columns: Array<string | TableColumn>) => Promise<boolean>;
  resetColumnOrder: () => Promise<boolean>;
}
```

| Property | Type | Description |
| --- | --- | --- |
| `isSaving` | `Ref<boolean>` | Reactive ref indicating whether an HTTP save or reset request is currently executing. Built-in components do not render this state. |
| `persistColumnOrder` | `(columns) => Promise<boolean>` | Debounced function to persist a new column ordering array to the server |
| `resetColumnOrder` | `() => Promise<boolean>` | Deletes the stored preference for this table and resolves `true` on success |

The composable sends JSON with same-origin credentials. When Laravel's `XSRF-TOKEN` cookie is available, it is decoded and forwarded through the `X-XSRF-TOKEN` header. Both methods return `false` for a missing table identifier, a network error, or a non-successful response.

---

## Vue Components

Column reordering and persistence components are included directly in `@zonvoir/inertia-table-vue`. When a table definition has reordering enabled (`reorderable: true` from `HasColumnPersistence` or `HasProFeatures`), standard table components automatically activate drag-and-drop and persistence:

### `TableHeader`

Supports interactive HTML5 drag-and-drop column reordering across header cells:

- **Props**: `columns`, `allColumns`, `sorting`, `sticky`, `stickyOffsets`, `stickySides`, `isColumnSticky`, `reorderable`, `tableApi`, `table`
- **Emits**: `sort`, `stick`, `hide`, `reorder`

### `ToggleColumnsDropdown`

Supports vertical 6-dot reordering handles and one-click reset to default order:

- **Props**: `columns`, `allColumns`, `isColumnVisible`, `reorderable`, `tableApi`, `table`
- **Emits**: `toggle`, `reorder`
