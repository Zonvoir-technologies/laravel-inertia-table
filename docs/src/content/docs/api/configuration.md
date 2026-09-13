---
title: Configuration & State API
description: Reference for Zonvoir Table configuration, request state, pagination, navigation, URL metadata, empty states, and image presentation value objects.
---

<h3 id="paginationconfiguration">PaginationConfiguration</h3>

```php
PaginationConfiguration::make(
    bool $enabled = true,
    PaginationType $type = PaginationType::Standard,
    int $defaultPerPage = 15,
    ?array $perPageOptions = null,
    bool $scrollToTop = true,
): PaginationConfiguration
```

`PaginationConfiguration` validates allowed page sizes and controls pagination behavior.

- `normalizePage(mixed $page): int`: Safely normalizes page number input.
- `normalizePerPage(mixed $perPage): int`: Ensures page size is within configured `$perPageOptions`.
- `normalizeCursor(mixed $cursor): ?string`: Normalizes cursor tokens for cursor-based pagination.

## State and request input

<h3 id="tablestate">TableState</h3>

```php
TableState::fromArray(array $state, ?PaginationConfiguration $pagination = null): TableState
TableState::merge(array $state, ?PaginationConfiguration $pagination = null): TableState
```

`TableState` represents the normalized table state across page, per-page, cursor, search query, sort column, sort direction, hidden columns, and sticky-column preferences.

<h3 id="tablerequest">TableRequest</h3>

```php
TableRequest::fromRequest(Request $request): TableRequest
TableRequest::fromArray(array $input): TableRequest
TableRequest::for(Table $table): array
```

`TableRequest` extracts state from either a named table query namespace (`?users[search]=...`) or top-level query parameters.

## Navigation and presentation metadata

<h3 id="tablenavigation">TableNavigation</h3>

```php
TableNavigation::page(int $page): array
TableNavigation::cursor(?string $cursor): array
TableNavigation::perPage(int $perPage): array
TableNavigation::search(?string $search): array
TableNavigation::sort(?string $sort, string|Direction|null $direction = null): array
```

`TableNavigation` produces query-string parameter arrays used to build client-side pagination, search, and sorting links.

<h3 id="url">Url</h3>

```php
Url::make(string $url): Url
Url::route(string $name, mixed $parameters = []): Url
```

`Url` configures action URLs, route names, query parameters, Inertia partial reloads, and external navigation for rows and action buttons.

<h3 id="image">Image</h3>

```php
Image::make(?string $url = null): Image
```

`Image` is a serializable value object configuring avatar URLs, rounded borders, display dimensions, and alternative text for image columns.

<h3 id="tableemptystate">TableEmptyState</h3>

```php
TableEmptyState::make(string $title, ?string $description = null, ?string $icon = null): TableEmptyState
```

`TableEmptyState` configures title, description, icon string, and action buttons displayed by the frontend adapter when zero records match the query.
