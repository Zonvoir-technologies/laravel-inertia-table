---
title: Transform Table Row Data
description: Customize the serialized data for each Eloquent model in a Zonvoir Table.
---

Override `transformModel()` in your table class to shape the data sent to the Vue adapter for each Eloquent model. The hook runs after Zonvoir Table resolves the configured column values, URLs, images, selection state, and row actions.

## Transform a row

The first argument is the current Eloquent model. The second is the serialized row data built by the package.

```php
use IlluminateDatabaseEloquentModel;
use IlluminateSupportStr;

public function transformModel(Model $model, array $data): array
{
    return [
        'key' => $model->id,
        'name' => $model->fullName(),
    ];
}
```

Return keys that match the attributes used by your table columns. In this example, define columns with the `key`, `name`, and `email` attributes.

## Preserve package metadata

Returning a new array replaces the complete serialized row, including package metadata such as `_primary_key`, `_url`, `_actions`, `_column_urls`, and `_selectable`. Keep the existing data when you use row selection, row links, row actions, or column-level links and images.

```php
public function transformModel(Model $model, array $data): array
{
    return [
        ...$data,
        'key' => $model->id,
        'name' => $model->fullName(),
    ];
}
```

## Common uses

- Combine model attributes into a display value.
- Mask sensitive data before it reaches the browser.
- Format a value that is shared by multiple columns.
- Add computed values for columns defined in the table class.

Use a column's formatting methods when the transformation belongs to only one column. Use `transformModel()` when the row payload itself needs to change.
