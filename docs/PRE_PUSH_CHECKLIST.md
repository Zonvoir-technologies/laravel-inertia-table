# Pre-Push & Release Checklist

This document outlines the required verification gates and release checklist for Zonvoir Table (`zonvoir/laravel-inertia-table`, `@zonvoir/inertia-table-vue`, and the documentation site).

All checks must pass locally and in CI prior to pushing commits or creating releases.

---

## 1. Local Verification Commands

Run each verification gate from the repository root:

### A. Laravel / PHP Package

```bash
# 1. Validate composer.json metadata and lockfile strictly
composer validate --strict

# 2. Check code style via Laravel Pint
composer lint

# 3. Run full PHPUnit test suite
composer test
```

### B. Vue Adapter (`@zonvoir/inertia-table-vue`)

```bash
cd vue

# 1. Install dependencies (if needed)
npm install

# 2. Build production distribution bundles (ESM, CJS, TS declarations)
npm run build

# 3. TypeScript type checking (must pass with 0 errors)
npm run typecheck

# 4. ESLint verification (must pass with 0 errors)
npm run lint

# 5. Vitest automated test suite (all tests passing)
npm run test

# 6. Dry-run npm pack to ensure packaged artifacts include LICENSE, README, and dist files
npm pack --dry-run

cd ..
```

### C. Documentation Site (`zonvoir-table.com`)

```bash
cd docs

# 1. Install dependencies (if needed)
npm install

# 2. Build static production site and run automated SEO validations
npm run build

cd ..
```

---

## 2. Release Checklist Items

Before tagging a public release (e.g. `v0.1.0`):

- [ ] **Changelog**: [CHANGELOG.md](file:///Users/vis/vishal/office/projects/php/zonvoir-table/CHANGELOG.md) is updated with all notable changes under the target release header, adhering to [Keep a Changelog](https://keepachangelog.com/).
- [ ] **Package Metadata**:
  - `composer.json` has valid version or branches matching release constraints.
  - `vue/package.json` version matches the release milestone (e.g., `0.1.0`).
  - License SPDX identifier is `Apache-2.0` in `composer.json` and `vue/package.json`.
- [ ] **License Files**:
  - Root `LICENSE` exists with Apache License 2.0 and correct copyright notice (`Copyright 2026 Zonvoir Technologies Pvt Ltd`).
  - `vue/LICENSE` exists with identical Apache License 2.0 terms.
- [ ] **Documentation Assets**:
  - Hero image assets are optimized (WebP format prioritized, images under 500 KB).
  - Documentation links point to canonical repositories and URLs (`zonvoir/laravel-inertia-table`, `@zonvoir/inertia-table-vue`).
- [ ] **Working Tree State**:
  - `git status --porcelain` is clean (no untracked files or unstaged changes).
- [ ] **Continuous Integration**:
  - All CI workflows pass on GitHub Actions across the PHP matrix (8.3, 8.4), Vue build/typecheck/lint/test, and Docs build/SEO checks.
- [ ] **Tagging & Publishing**:
  - Git tag created (e.g. `git tag -a v0.1.0 -m "Release v0.1.0"`).
  - Push tag to remote (`git push origin v0.1.0`).
  - Packagist automatically triggers webhook for `zonvoir/laravel-inertia-table`.
  - Vue adapter published to npm: `cd vue && npm publish --access public`.
