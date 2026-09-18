---
title: Table Pagination Modes
description: Configure standard, simple, and cursor pagination in Zonvoir Table with customizable page sizes and Inertia URL state.
---

Pagination is enabled by default in Zonvoir Table.

You can control the pagination strategy, available page sizes, and default number of rows shown per page from your table class.

## Configure pagination

Use the pagination properties on your table:

```php
use Zonvoir\InertiaTable\Enums\PaginationType;

class UsersTable extends Table
{
    protected PaginationType $paginationType = PaginationType::Standard;

    protected ?array $perPageOptions = [15, 30, 50, 100];

    protected ?int $defaultPerPage = 30;
}
```

This table will:

- Use standard Laravel pagination
- Show `30` rows by default
- Allow users to switch between `15`, `30`, `50`, and `100` rows per page

## Pagination types

Zonvoir Table supports three Laravel pagination strategies.

| Type | Laravel method | Best for |
| --- | --- | --- |
| `PaginationType::Standard` | `paginate()` | Most tables that need page numbers and total counts |
| `PaginationType::Simple` | `simplePaginate()` | Large datasets where total counts are unnecessary |
| `PaginationType::Cursor` | `cursorPaginate()` | Large or frequently changing datasets |

## Standard pagination

Standard pagination uses Laravel's `paginate()` method.

```php
protected PaginationType $paginationType = PaginationType::Standard;
```

This is the default and is usually the best choice for general-purpose tables.

It provides information such as:

- First and last page
- Previous and next page
- Current page number (X in `Page X of Y`)
- Total number of pages (Y in `Page X of Y`)

Example navigation:

```text
Page X of Y First Previous Next Last
```

## Simple pagination

Use simple pagination when you only need previous and next navigation.

```php
protected PaginationType $paginationType = PaginationType::Simple;
```

This uses Laravel's `simplePaginate()` method.

Because Laravel does not need to calculate the total number of records, simple pagination can be useful for larger datasets.

Example navigation:

```text
Previous    Next
```

## Cursor pagination

Use cursor pagination for large datasets where offset-based pagination may become expensive.

```php
protected PaginationType $paginationType = PaginationType::Cursor;
```

This uses Laravel's `cursorPaginate()` method.

Instead of navigating using numeric page offsets, Laravel uses a cursor representing the current position in the result set.

Cursor pagination can be useful for:

- Large tables
- Frequently changing datasets
- Feeds or sequential navigation
- Queries where deep offset pagination becomes expensive

<div class="docs-note">

Cursor pagination works best when the query has a stable and deterministic ordering.

</div>

## Rows per page

Use `$perPageOptions` to control the values available in the rows-per-page selector.

```php
protected ?array $perPageOptions = [ 10, 25, 50, 100 ];
```

Users can select one of these values from the table controls.

## Default rows per page

Use `$defaultPerPage` to choose the initial page size.

```php
protected ?int $defaultPerPage = 50;
```

The default value should normally be included in `$perPageOptions`.

```php
protected ?array $perPageOptions = [10, 25, 50, 100];

protected ?int $defaultPerPage = 50;
```

## Disable pagination

You can disable pagination entirely for a table.

```php
class UsersTable extends Table
{
    protected bool $pagination = false;
}
```

When pagination is disabled, the table returns the complete result set instead of a paginated result.

This is most appropriate for small datasets where loading every record at once is reasonable.

:::caution
Disabling pagination means all matching records may be loaded in a single request. Keep pagination enabled for tables that can grow significantly.
:::

## Pagination state

The active page and rows-per-page value are stored in the table's query string state.

For example:

```text
?page=3&perPage=50
```

With cursor pagination, the query string uses the active cursor instead of a numeric page.

When multiple named tables are rendered on the same page, pagination state remains isolated between them.

```text
?users[page]=2&users[perPage]=30&jobs[page]=4
```

Changing the users table will not affect the pagination state of the jobs table.

## Example configuration

A typical table might use:

```php
use Zonvoir\InertiaTable\Enums\PaginationType;

class UsersTable extends Table
{
    protected PaginationType $paginationType = PaginationType::Standard;

    protected ?array $perPageOptions = [ 10, 25, 50, 100 ];

    protected ?int $defaultPerPage = 25;
}
```

For a larger dataset, you might prefer:

```php
class ActivityTable extends Table
{
    protected PaginationType $paginationType = PaginationType::Cursor;

    protected ?array $perPageOptions = [ 25, 50, 100 ];

    protected ?int $defaultPerPage = 50;
}
```
