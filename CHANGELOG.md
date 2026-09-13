# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-13

### Added
- **Canonical Release Identity**: Published under `zonvoir/laravel-inertia-table` (Composer) and `@zonvoir/inertia-table-vue` (npm) with root PHP namespace `Zonvoir\InertiaTable`.
- **Apache 2.0 Licensing**: Transitioned entire repository to the Apache License 2.0 across PHP package, Vue adapter, and documentation.
- **Fluent Table Builder (Laravel)**:
  - Base `Table` class with declarative column, action, and filter definitions.
  - Multi-driver pagination support: LengthAware, Simple, and Cursor pagination.
  - Robust multi-column sorting and global/column-specific search.
  - Bulk actions and single-row actions with authorization and confirmation modals.
  - Data export pipeline with configurable formats and queueable jobs.
  - Artisan generator command: `php artisan make:zon-table`.
- **Vue 3 Adapter (`@zonvoir/inertia-table-vue`)**:
  - Headless composables: `useTable` (state, pagination, sorting, search, column visibility, sticky columns) and `useActions` (row selection, action execution).
  - Out-of-the-box UI component (`ZonvoirTable` / `Table`) with comprehensive slots and full Tailwind CSS v3.4 and v4 theme integration.
  - Configuration API via `configureTable` and `:config` component prop.
- **Documentation & Deployment**:
  - Astro & Starlight documentation site published at `zonvoir-table.com`.
  - Optimized hero media assets with modern WebP delivery.
  - Automated zero-downtime static documentation deployment workflow in CI with release artifact verification.
  - Full GitHub Actions CI pipeline covering PHP (8.3, 8.4), Vue quality gates, and release readiness assertions.
