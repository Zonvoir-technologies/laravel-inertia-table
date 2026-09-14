---
title: Normalized Table Payload Shape
description: JSON schema and structure for normalized table payloads serialized from Laravel to Inertia and Vue frontend adapters.
---

`Table::payload()` returns a table definition. `Table::results()` returns the full, renderable payload including queried rows; this is the payload consumed by the Vue adapter.

```json
{
    "name": "users",
    "results": {
        "data": [
            {
                "_column_urls": {},
                "_column_images": {},
                "_primary_key": 1,
                "id": 1,
                "name": "Ada Lovelace",
                "_selectable": true,
                "_actions": []
            }
        ],
        "current_page": 1,
        "per_page": 25,
        "from": 1,
        "to": 1,
        "total": 1,
        "last_page": 1,
        "on_first_page": true,
        "on_last_page": true
    },
    "meta": {
        "columns": [],
        "pagination": {},
        "queryString": {}
    },
    "search": [],
    "columns": [
        {
            "type": "text",
            "header": "Name",
            "attribute": "name",
            "sortable": true,
            "toggleable": true,
            "alignment": "left",
            "visibleByDefault": true,
            "meta": {
                "hidden": false,
                "sortable": true,
                "toggleable": true,
                "stickable": false,
                "defaultToSticky": false
            },
            "wrap": false,
            "tooltip": null,
            "truncate": null,
            "headerClass": null,
            "cellClass": null,
            "stickable": false
        }
    ],
    "actions": [],
    "exports": [],
    "state": {
        "columns": {
            "name": true
        },
        "perPage": 25,
        "search": null,
        "sort": "name",
        "sticky": []
    },
    "pagination": true,
    "paginationType": "full",
    "perPageOptions": [
        15,
        25,
        50
    ],
    "defaultPerPage": 25,
    "defaultSort": "name",
    "debounceTime": 300,
    "reloadProps": [],
    "hasActions": false,
    "hasBulkActions": false,
    "hasExports": false,
    "hasExportsThatLimitsToSelectedRows": false,
    "hasFilters": false,
    "hasSearch": true,
    "hasToggleableColumns": true,
    "scrollPositionAfterPageChange": "topOfPage",
    "autofocus": "search",
    "emptyState": false,
    "stickyHeader": false,
    "rowSelectionKey": "id",
    "selectable": true,
    "persistRowSelectionAcrossPages": false,
    "selection": {
        "mode": "page"
    },
    "inDefaultState": true
}
```

When actions exist, `meta.table` and `meta.actionEndpoint` are included so the adapter can dispatch actions back to Laravel.

## Rows and columns

Every serialized row includes `_primary_key`, `_column_urls`, `_column_images`, `_selectable`, and `_actions`. A row URL, when configured, is exposed as `_url`.

Normalized columns use `attribute` as their key and `header` as their label.
