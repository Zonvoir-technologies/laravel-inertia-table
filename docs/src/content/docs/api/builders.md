---
title: Table Builders API Reference
description: Reference for Zonvoir Table internal query, search, sorting, pagination, and payload builder classes.
---

These classes are public package internals. Prefer the methods on `Table` for ordinary application code; use builders when customizing or debugging the pipeline.

## Query pipeline

```php
TableQueryBuilder::apply(Table $table, Builder $query, TableStateContract $state): Builder
TableSearchBuilder::apply(Builder $query, Table $table, ?string $search): Builder
TableSortBuilder::apply(Builder $query, Table $table, ?string $sort, string $direction): Builder
TablePaginationBuilder::paginate(Builder $query, Table $table, TableStateContract $state): mixed
```

- `TableQueryBuilder` coordinates search and sorting.
- `TableSearchBuilder` applies table-level and column search callbacks.
- `TableSortBuilder` resolves sortable columns, custom callbacks, and relation sorting.
- `TablePaginationBuilder` selects standard, simple, or cursor pagination from the table configuration.

## Payload pipeline

```php
TablePayloadBuilder::definition(Table $table, TableStateContract $state): array
TablePayloadBuilder::results(Table $table, mixed $results, TableStateContract $state): array
```

`TablePayloadBuilder` serializes columns, rows, actions, exports, pagination, and state for the Vue adapter. `TableQueryMetadataResolver` and `RelationFieldResolver` resolve queryable column and relation metadata; `SearchTermParser` normalizes the search terms passed into the query pipeline.