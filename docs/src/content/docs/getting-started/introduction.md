---
title: Introduction & Overview
description: 'A practical overview of Zonvoir Table for Laravel and Inertia Vue: expressive PHP classes, typed columns, live search, sorting, and UI adapters.'
---

<div class="not-content my-8 relative overflow-hidden rounded-2xl border border-[#f05a45]/20 bg-gradient-to-br from-[#fff5f2] via-slate-50/70 to-[#fff0ed] p-6 sm:p-8 md:p-10 shadow-lg shadow-[#f05a45]/5 dark:border-[#f05a45]/25 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#1a0f0d] dark:shadow-black/40" aria-label="Zonvoir Table Overview">
<div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#f05a45]/15 blur-3xl dark:bg-[#f05a45]/10" aria-hidden="true"></div>
<div class="relative z-10 flex flex-col gap-5 sm:gap-6">
<div class="flex items-center gap-3.5">
<div class="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7e6b] to-[#f05a45] text-white shadow-md shadow-[#f05a45]/30">
<svg class="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="4" width="4" height="3" rx="1.5" fill="white" fill-opacity="0.9"/>
<rect x="9" y="4" width="12" height="3" rx="1.5" fill="white"/>
<rect x="3" y="10.5" width="4" height="3" rx="1.5" fill="white" fill-opacity="0.9"/>
<rect x="9" y="10.5" width="12" height="3" rx="1.5" fill="white"/>
<rect x="3" y="17" width="4" height="3" rx="1.5" fill="white" fill-opacity="0.9"/>
<rect x="9" y="17" width="12" height="3" rx="1.5" fill="white"/>
</svg>
</div>
<div class="flex flex-col">
<span class="text-xl sm:text-2xl font-extrabold tracking-wider text-slate-900 dark:text-white uppercase leading-none font-['Bricolage_Grotesque',sans-serif]">ZONVOIR TABLE</span>
<span class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Tables for Laravel, done right.</span>
</div>
</div>
<div class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-['Bricolage_Grotesque',sans-serif]">Powerful, beautiful data tables for Laravel &amp; Inertia.js</div>
<p class="max-w-3xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed m-0">Build feature-rich data tables with server-side search, sorting, pagination, column management, row &amp; bulk actions and more — without repetitive frontend work.</p>
<div class="flex flex-wrap items-center gap-3 pt-1">
<a href="https://github.com/Zonvoir-technologies/laravel-inertia-table" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-[#f05a45] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#f05a45]/30 transition-all hover:bg-[#e04833] hover:-translate-y-0.5 no-underline">
<svg class="h-4.5 w-4.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
<path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3Z"/>
</svg>
<span>View on GitHub</span>
</a>
<a href="https://github.com/Zonvoir-technologies/laravel-inertia-table/issues" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg border border-[#f05a45]/30 bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#f05a45] shadow-sm transition-all hover:bg-[#fff0ed] hover:border-[#f05a45]/50 hover:-translate-y-0.5 dark:border-[#f05a45]/30 dark:bg-slate-800/80 dark:text-[#ff8a73] dark:hover:bg-[#4a160f]/30 dark:hover:border-[#f05a45]/50 no-underline">
<svg class="h-4.5 w-4.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"></circle>
<line x1="12" y1="8" x2="12" y2="12"></line>
<line x1="12" y1="16" x2="12.01" y2="16"></line>
</svg>
<span>Open Issues</span>
</a>
</div>
<div class="flex flex-wrap items-center gap-6 sm:gap-10 pt-4 border-t border-slate-200/80 dark:border-slate-800">
<a href="https://packagist.org/packages/zonvoir/laravel-inertia-table" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 no-underline group">
<svg class="h-5 w-5 text-[#f05a45] shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
<polyline points="7 10 12 15 17 10"/>
<line x1="12" y1="15" x2="12" y2="3"/>
</svg>
<div class="flex flex-col leading-tight">
<span id="zt-download-count" class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#f05a45] transition-colors font-['Bricolage_Grotesque',sans-serif]">190+</span>
<span class="text-xs text-slate-500 dark:text-slate-400">Downloads</span>
</div>
</a>
<a href="https://github.com/Zonvoir-technologies/laravel-inertia-table" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 no-underline group">
<svg class="h-5 w-5 text-[#f05a45] shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>
<div class="flex flex-col leading-tight">
<span id="zt-star-count" class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#f05a45] transition-colors font-['Bricolage_Grotesque',sans-serif]">17</span>
<span class="text-xs text-slate-500 dark:text-slate-400">GitHub Stars</span>
</div>
</a>
<div class="flex items-center gap-3">
<svg class="h-5 w-5 text-[#f05a45] shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
<line x1="12" y1="22.08" x2="12" y2="12"/>
</svg>
<div class="flex flex-col leading-tight">
<span class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-['Bricolage_Grotesque',sans-serif]">Free &amp; Open Source</span>
<span class="text-xs text-slate-500 dark:text-slate-400">Apache 2.0 License</span>
</div>
</div>
</div>
</div>
</div>
<script is:inline>
(function() {
  async function fetchZtStats() {
    try {
      const res = await fetch('https://packagist.org/packages/zonvoir/laravel-inertia-table.json');
      if (!res.ok) return;
      const data = await res.json();
      const count = data && data.package && data.package.downloads ? data.package.downloads.total : null;
      const stars = data && data.package ? data.package.github_stars : null;
      const dEl = document.getElementById('zt-download-count');
      const sEl = document.getElementById('zt-star-count');
      if (count !== null && count !== undefined && dEl) {
        dEl.textContent = Number(count).toLocaleString() + '+';
      }
      if (stars !== null && stars !== undefined && sEl) {
        sEl.textContent = Number(stars).toLocaleString();
      }
    } catch (e) {}
  }
  fetchZtStats();
  document.addEventListener('astro:page-load', fetchZtStats);
})();
</script>

Zonvoir Table helps you build data tables for Laravel and Inertia applications without scattering table behavior across controllers, query strings, and frontend components.

You define the table once in PHP: its query, columns, search behavior, sorting, pagination, actions, exports, and UI metadata. The frontend adapter receives a predictable payload and renders the interactive table experience.

## What You Get

Zonvoir Table is designed for application tables that need to do more than display rows.

- **[Backend table classes](/core-concepts/generate-tables/)** keep query behavior, columns, state, actions, and exports in one place.
- **[Typed columns](/core-concepts/columns/)** describe text, numeric, boolean, badge, image, date, date-time, and action cells.
- **[Search](/core-concepts/searching/) and [sorting](/core-concepts/sorting/)** are applied through the backend query layer, with URL state for predictable navigation.
- **[Pagination controls](/core-concepts/pagination/)** support standard, simple, and cursor pagination flows.
- **[Column visibility](/core-concepts/toggle-columns/) and [sticky columns](/core-concepts/sticky-columns/)** let users scan wide datasets without losing important context.
- **[Row actions](/core-concepts/row-actions/) and [bulk actions](/core-concepts/bulk-actions/)** provide interactive workflows from the table surface.
- **[Excel exports](/core-concepts/exports/)** can be limited to filtered rows or selected rows.
- **[Vue 3 adapter support](/api/frontend-api/)** renders the normalized table payload in Inertia-powered pages.

## Why It Exists

Most tables start simple, then slowly collect behavior: filters, sorting, row links, actions, bulk operations, exports, hidden columns, sticky columns, and URL state.

Zonvoir Table gives those concerns a home. Instead of rebuilding the same table plumbing on every page, you create a table class that explains how the resource should behave.

## Example

Create a table class for your resource:

```php
use App\Models\User;
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    protected ?string $defaultSort = 'name';

    public function columns(): array
    {
        return [
            TextColumn::make('name', 'Full Name')
                ->searchable()
                ->sortable()
                ->sticky(),

            TextColumn::make('email')
                ->searchable(),

            BadgeColumn::make('status')
                ->colors(['active' => 'success'])
                ->solid(),
        ];
    }
}
```

Render the table payload with the frontend adapter:

```vue
<script setup lang="ts">
import { ZonvoirTable, type TableResource } from '@zonvoir/inertia-table-vue';

const props = defineProps<{
  users: TableResource;
}>();
</script>

<template>
  <ZonvoirTable :table="props.users" />
</template>
```

## Core Idea

Define table behavior once on the backend, then send a stable payload to the frontend. Laravel owns the data and query rules. The adapter owns rendering and browser interaction.

## Next Steps

- Check [Requirements](/getting-started/requirements/) for supported PHP, Laravel, and Vue versions.
- Follow [Installation](/getting-started/installation/) to install the Composer and npm packages.
- Read [Basic Usage](/core-concepts/basic-usage/) to configure your first table controller and Vue page.
- Explore [Table Generation](/core-concepts/generate-tables/) to scaffold table classes with Artisan.
