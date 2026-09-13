---
title: Normalized Table Payload Shape
description: JSON schema and structure for normalized table payloads serialized from Laravel to Inertia and Vue frontend adapters.
---

`Table::payload()` and `Table::results()` return normalized arrays that the frontend adapter can consume.

```json
{
  "name": "users",
  "state": {
    "page": 1,
    "perPage": 25,
    "cursor": null,
    "search": null,
    "sort": "name",
    "direction": "asc"
  },
  "meta": {
    "columns": [],
    "pagination": {},
    "queryString": {
      "namespace": "users",
      "page": "users[page]",
      "perPage": "users[perPage]",
      "cursor": "users[cursor]",
      "search": "users[search]",
      "sort": "users[sort]",
      "direction": "users[direction]",
      "columns": "users[columns]",
      "sticky": "users[sticky]"
    }
  }
}
```

When actions exist, `meta.table` and `meta.actionEndpoint` are included so the adapter can dispatch actions back to Laravel.

## Column Payload

Columns serialize metadata such as:

- `key`, `name`, `type`, and `label`
- visibility, sortability, searchability, toggleability, and sticky state
- alignment and width constraints
- label and cell classes
- default value
- export metadata
- adapter metadata
- optional tooltip

Callbacks such as `mapAs()`, `sortUsing()`, `searchUsing()`, image callbacks, and URL callbacks run server-side and are not serialized.
