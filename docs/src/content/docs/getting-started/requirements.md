---
title: System & Version Requirements
description: Supported PHP, Laravel, Inertia.js, Vue 3, and Tailwind CSS versions for installing and running Zonvoir Table.
---

Zonvoir Table is built for modern Laravel applications using Inertia.js and Vue 3. Before installing, verify that your environment meets the following requirements.

## Backend Requirements

Your Laravel application must meet the following minimum versions:

| Technology | Supported Version | Notes |
| --- | --- | --- |
| **PHP** | 8.3 or newer | Uses modern PHP typing and typed properties |
| **Laravel** | 11.x, 12.x, or 13.x | Fully compatible with modern Illuminate packages |

The Laravel package depends on the following core Illuminate components (installed automatically via Composer):

- `illuminate/database` (Eloquent queries, pagination, relations)
- `illuminate/http` (Request normalization and query string handling)
- `illuminate/support` (Collections and string helpers)

## Frontend Requirements

The first-party Vue adapter requires:

| Technology | Supported Version | Notes |
| --- | --- | --- |
| **Vue** | 3.4 or newer | Composition API with `<script setup>` |
| **Inertia.js** | 2.x or 3.x | Client-side routing, visit helpers, and URL state |
| **Tailwind CSS** | 3.4+ or 4.x | Utility classes and customizable design tokens |

Zonvoir Table currently provides a first-party Vue adapter (`@zonvoir/inertia-table-vue`). React and Svelte adapters are planned for future releases.

## Package Managers

You will need standard PHP and JavaScript package managers installed:

- **PHP**: Composer 2.x
- **Node.js**: Node 18+ with `npm`, `pnpm`, or `yarn`

## Next Steps

Once your environment meets these requirements:

- Follow the [Installation & Setup](/getting-started/installation/) guide.
- Read [Basic Usage](/core-concepts/basic-usage/) to configure your first table.
