---
title: Expressive Laravel & Inertia Vue Data Tables
description: Build expressive, configurable Eloquent data tables for Laravel and Inertia Vue with typed columns, live search, sorting, pagination, and actions.
template: splash
head:
    - tag: title
      content: Zonvoir Table — Expressive Laravel & Inertia Vue Data Tables
    - tag: meta
      attrs:
          property: og:title
          content: Zonvoir Table — Expressive Laravel & Inertia Vue Data Tables
    - tag: meta
      attrs:
          property: og:type
          content: website
hero:
    title: Tables that<br />speak <span>Laravel.</span>
    tagline: Define tables with expressive PHP classes and render them with our first-party Vue and Inertia adapters.
    actions:
        - text: Start building
          link: /getting-started/installation/
          icon: right-arrow
        - text: Browse API
          link: /api/
          icon: document
---

<section class="zv-ledger hm-page-tb" aria-label="Capability ledger">
<div class="shape-wrp-cl">
 <div class="shape-ring shape-ring-1"></div>
        <div class="shape-ring shape-ring-2"></div>
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-pattern pattern-left"></div>
        <div class="bg-pattern pattern-right"></div>
</div>
<div class="zv-ledger-head">
<p class="zv-eyebrow the-capability-ledger">The capability ledger</p>
<h2>Every row, <span>accounted for.</span></h2>
<p class="zn-tb-sb">Zonvoir Table's own feature set, kept in the same format your users will see it in.</p>
</div>
<div class="zv-ledger-grid" role="table" aria-label="Zonvoir Table capabilities">
<div class="zv-ledger-row zv-ledger-header" role="row"><span>No.</span><span>Capability</span><span>Layer</span><span>Status</span></div>
<div class="zv-ledger-row core" role="row"><span>01</span><span>Table Definition</span><span>PHP</span><span><em>Core</em></span></div>
<div class="zv-ledger-row core" role="row"><span>02</span><span>Typed Columns</span><span>PHP</span><span><em>Core</em></span></div>
<div class="zv-ledger-row live" role="row"><span>03</span><span>Search &amp; Sort</span><span>Query</span><span><em>Live</em></span></div>
<div class="zv-ledger-row cursor" role="row"><span>04</span><span>Pagination</span><span>Query</span><span><em>Standard / Cursor</em></span></div>
<div class="zv-ledger-row interactive" role="row"><span>05</span><span>Row &amp; Bulk Actions</span><span>Vue</span><span><em>Interactive</em></span></div>
<div class="zv-ledger-row interactive" role="row"><span>06</span><span>Column Visibility &amp; Sticky</span><span>Vue</span><span><em>Interactive</em></span></div>
<div class="zv-ledger-row filtered" role="row"><span>07</span><span>Excel Exports</span><span>Server</span><span><em>Filtered / Selected</em></span></div>
<div class="zv-ledger-row generated" role="row"><span>08</span><span>TypeScript Types</span><span>Frontend</span><span><em>Generated</em></span></div>
</div>

</section>

<section class="zv-code zv-code-wrapper" aria-label="Table definition example">
<div class="zv-code-copy">
<p class="zv-eyebrow">One class, one source of truth</p>
<h2>The query, columns and <span>payload</span> - defined once.</h2>
<p class="cd-desc">A table class drives the Eloquent query, the columns, URL state, row actions, and exports. The Vue adapter just renders what it's given.</p>
</div>

<div class="terminal-window" aria-label="UsersTable PHP example">
<div class="terminal-bar"><span></span><span></span><span></span><strong>UsersTable.php</strong></div>
<pre><code><span class="ln">1</span>  <b>use</b> App\Models\User;
<span class="ln">2</span>  <b>use</b> Zonvoir\InertiaTable\Columns\BadgeColumn;
<span class="ln">3</span>  <b>use</b> Zonvoir\InertiaTable\Columns\TextColumn;
<span class="ln">4</span>  <b>use</b> Zonvoir\InertiaTable\Export;
<span class="ln">5</span>  <b>use</b> Zonvoir\InertiaTable\Table;
<span class="ln">6</span>
<span class="ln">7</span>  <b>final class</b> UsersTable <b>extends</b> Table
<span class="ln">8</span>  {
<span class="ln">9</span>     <b>protected</b> ?string $resource = User::class;
<span class="ln">10</span>     <b>protected</b> array|string|null $search = ['name', 'email'];
<span class="ln">11</span>     <b>protected</b> ?string $defaultSort = 'name';
<span class="ln">12</span>
<span class="ln">13</span>     <b>public function</b> columns(): array
<span class="ln">14</span>     {
<span class="ln">15</span>         <b>return</b> [
<span class="ln">16</span>             TextColumn::make('name', 'Full Name')->searchable(),
<span class="ln">17</span>             TextColumn::make('email')->searchable(),
<span class="ln">18</span>         ];
<span class="ln">19</span>     }
<span class="ln">20</span>  }</code></pre>

<div class="floating-tags">
                    <div class="tag tag-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg> Query
                    </div>
                    <div class="tag tag-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> Columns
                    </div>
                    <div class="tag tag-green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> URL State
                    </div>
                    <div class="tag tag-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> Export
                    </div>
                </div>
</div>

</section>

<div class="shpcl-wr">
<div class="zv-ledger-head" bis_skin_checked="1">
<p class="zv-eyebrow the-capability-ledger">Features</p>
<h2>Built for every row.<span> Ready for</span> every workflow.
</h2>

</div>
<div class="shape-wrp-cl">
 <div class="shape-ring shape-ring-1"></div>
        <div class="shape-ring shape-ring-2"></div>
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-pattern pattern-left"></div>
        <div class="bg-pattern pattern-right"></div>
</div>

<section id="demo" class="feature-console wrap-console" aria-label="Feature overview">

<input class="feature-tab-input" type="radio" name="home-feature" id="feature-table" checked>
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-search">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-sorting">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-pagination">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-actions">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-bulk">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-columns">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-sticky">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-exports">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-url">
<input class="feature-tab-input" type="radio" name="home-feature" id="feature-multiple">
<aside class="feature-rail">
<!-- <div class="rail-path">~/features</div> -->
<p>Core</p>
<label for="feature-table">Table Definition</label>
<label for="feature-search">Search State</label>
<label for="feature-sorting">Sorting</label>
<label for="feature-pagination">Pagination</label>
<label for="feature-actions">Row Actions & Links</label>
<label for="feature-bulk">Bulk Actions</label>
<p>Presentation</p>
<label for="feature-columns">Columns</label>
<label for="feature-sticky">Sticky Columns</label>
<p>Data</p>
<label for="feature-exports">Excel Exports</label>
<label for="feature-url">URL State</label>
<label for="feature-multiple">Multiple Tables</label>
</aside>
<div class="feature-main">
<div class="feature-panel panel-table"><p class="feature-breadcrumb">features <span>/</span> table-definition.php</p><h2><span>#</span> Built-in Table Definition</h2><p>One PHP class drives the query, columns, URL state, row actions, exports, and frontend metadata.</p><div class="feature-content"><ul><li>Resolve an Eloquent model class or query builder.</li><li>Return typed column, action, and export definitions.</li><li>Serialize a stable payload for Inertia.</li></ul><pre><code>UsersTable::make();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/generate-tables/">Read the Table Generation Guide →</a></p></div></div>
<div class="feature-panel panel-search"><p class="feature-breadcrumb">features <span>/</span> search-state.php</p><h2><span>#</span> Search State</h2><p>Search can be table-level, column-level, or customized with callbacks in the query builder layer.</p><div class="feature-content"><ul><li>Set searchable fields on the table.</li><li>Mark individual columns as searchable.</li><li>Keep search state in the query string.</li></ul><pre><code>protected array|string|null $search = ['name', 'email'];

TextColumn::make('name')->searchable();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/searching/">Read the Searching Guide →</a></p></div></div>
<div class="feature-panel panel-sorting"><p class="feature-breadcrumb">features <span>/</span> sorting.php</p><h2><span>#</span> Sorting</h2><p>Sortable columns expose direction-aware query state while the backend stays in charge of the query.</p><div class="feature-content"><ul><li>Enable sorting per column.</li><li>Use `-column` for descending defaults.</li><li>Override sorting with `sortUsing()` when needed.</li></ul><pre><code>protected ?string $defaultSort = '-created_at';

TextColumn::make('name')->sortable();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/sorting/">Read the Sorting Guide →</a></p></div></div>
<div class="feature-panel panel-pagination"><p class="feature-breadcrumb">features <span>/</span> pagination.php</p><h2><span>#</span> Pagination</h2><p>Pagination configuration lives with the table, including allowed page sizes and pagination strategy.</p><div class="feature-content"><ul><li>Standard, simple, and cursor modes.</li><li>Configurable per-page options.</li><li>Normalized page, cursor, and per-page input.</li></ul><pre><code>protected ?int $defaultPerPage = 30;
protected ?array $perPageOptions = [15, 30, 50];</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/pagination/">Read the Pagination Guide →</a></p></div></div>
<div class="feature-panel panel-actions"><p class="feature-breadcrumb">features <span>/</span> row-actions.php</p><h2><span>#</span> Row Actions & Links</h2><p>Actions and row URLs are serialized as metadata so Vue can render the right controls.</p><div class="feature-content"><ul><li>Return actions from `actions()`.</li><li>Use `Url` for route and Inertia metadata.</li><li>Support authorization, disabled, hidden, and confirm states.</li></ul><pre><code>Action::make('Edit')
    ->url(fn ($user, $url) => $url->route('users.edit', $user));</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/row-actions/">Read the Row Actions Guide →</a></p></div></div>
<div class="feature-panel panel-bulk"><p class="feature-breadcrumb">features <span>/</span> bulk-actions.php</p><h2><span>#</span> Bulk Actions</h2><p>Bulk actions reuse the action API and execute against selected row keys.</p><div class="feature-content"><ul><li>Enable bulk mode with `asBulkAction()`.</li><li>Use `onlyAsBulkAction()` for bulk-only flows.</li><li>Control chunk size and strategy.</li></ul><pre><code>Action::make('Archive')
    ->asBulkAction(chunkSize: 100)
    ->confirm('Archive users?');</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/bulk-actions/">Read the Bulk Actions Guide →</a></p></div></div>
<div class="feature-panel panel-columns"><p class="feature-breadcrumb">features <span>/</span> columns.php</p><h2><span>#</span> Columns</h2><p>One Columns guide covers common options plus text, numeric, boolean, badge, image, date, date-time, and action columns.</p><div class="feature-content"><ul><li>Shared visibility, sizing, sticky, search, and sort metadata.</li><li>Column-specific display settings.</li><li>Export labels, values, formats, and styles.</li></ul><pre><code>BadgeColumn::make('status')
    ->colors(['active' => 'success'])
    ->solid();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/columns/">Read the Typed Columns Guide →</a></p></div></div>
<div class="feature-panel panel-sticky"><p class="feature-breadcrumb">features <span>/</span> sticky-columns.php</p><h2><span>#</span> Sticky Columns</h2><p>Sticky columns keep high-value identifiers visible while users scan wide data sets.</p><div class="feature-content"><ul><li>Enable sticky behavior per column.</li><li>Pair with width metadata for predictable layout.</li><li>Allow sticky overrides through table state.</li></ul><pre><code>TextColumn::make('name')
    ->sticky()
    ->width('16rem');</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/sticky-columns/">Read the Sticky Columns Guide →</a></p></div></div>
<div class="feature-panel panel-exports"><p class="feature-breadcrumb">features <span>/</span> exports.php</p><h2><span>#</span> Excel Exports</h2><p>Return export definitions from the table and choose filtered or selected-row export scope.</p><div class="feature-content"><ul><li>Expose export controls in table metadata.</li><li>Limit to filtered or selected rows.</li><li>Queue large exports when needed.</li></ul><pre><code>Export::make('Users', 'users.xlsx')
    ->limitToFilteredRows();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/exports/">Read the Exports Guide →</a></p></div></div>
<div class="feature-panel panel-url"><p class="feature-breadcrumb">features <span>/</span> url-state.php</p><h2><span>#</span> URL State</h2><p>Table state is represented in query string keys for page, per-page, cursor, search, sort, direction, columns, and sticky overrides.</p><div class="feature-content"><ul><li>Name tables to namespace query state.</li><li>Generate navigation URLs from the current state.</li><li>Keep reloads and browser history predictable.</li></ul><pre><code>$table->navigation()->search('olivia');
$table->navigation()->sort('name');</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/api/configuration/#tablestate">Read the Table State & URL API →</a></p></div></div>
<div class="feature-panel panel-multiple"><p class="feature-breadcrumb">features <span>/</span> multiple-tables.php</p><h2><span>#</span> Multiple Tables</h2><p>Name each table to avoid query string collisions when a page renders more than one table.</p><div class="feature-content"><ul><li>Use `named()` or `as()`.</li><li>Separate page, search, sort, columns, and sticky state.</li><li>Render multiple independent table payloads.</li></ul><pre><code>UsersTable::make()->named('users')->results();
OrdersTable::make()->named('orders')->results();</code></pre><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/multiple-tables/">Read the Multiple Tables Guide →</a></p></div></div>
</div>
</section>
</div>

<section class="home-docs-grid-new" aria-label="Documentation paths">
  <a href="/getting-started/installation/" class="docs-card card-red">
    <div class="docs-card-header">
      <div class="docs-card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
      </div>
      <div class="docs-card-dots">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="20" cy="4" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="4" cy="20" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="20" cy="20" r="1.5"/></svg>
      </div>
    </div>
    <div class="docs-card-body">
      <span class="docs-card-label">GUIDES</span>
      <h3 class="docs-card-title">Start with a real table</h3>
      <div class="docs-card-dash"></div>
      <p class="docs-card-text">Create a table, render it, then add behavior feature by feature.</p>
    </div>
    <div class="docs-card-wave">
      <svg viewBox="0 0 100 25" preserveAspectRatio="none"><path d="M0,25 C30,10 70,35 100,10 L100,25 L0,25 Z" fill="currentColor" opacity="0.08"></path></svg>
    </div>
  </a>

  <a href="/core-concepts/columns/" class="docs-card card-purple">
    <div class="docs-card-header">
      <div class="docs-card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.954.954 0 0 0-.253.921c.226.79.1 1.654-.352 2.333a3.633 3.633 0 0 1-2.094 1.494 3.737 3.737 0 0 1-2.47-.411 1.002 1.002 0 0 0-1.127.135l-1.424 1.424C11.484 21.683 10.867 21.919 10.25 21.919c-.618 0-1.233-.236-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.79.225-1.654.1-2.333-.352A3.633 3.633 0 0 1 2.274 16.91a3.737 3.737 0 0 1 .411-2.47c.137-.417-.008-.887-.367-1.173L.973 11.922C.503 11.45.267 10.833.267 10.216c0-.617.236-1.232.706-1.704l1.568-1.568a1.026 1.026 0 0 0 .29-.877c-.225-.79-.1-1.654.352-2.333a3.633 3.633 0 0 1 2.094-1.494 3.737 3.737 0 0 1 2.47.411c.365.228.84.18 1.168-.124L10.279 1.16C10.749.689 11.366.453 11.983.453c.618 0 1.233.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.79-.225 1.654-.1 2.333.352a3.633 3.633 0 0 1 1.494 2.094 3.737 3.737 0 0 1-.411 2.47l-.109.317z"/></svg>
      </div>
      <div class="docs-card-dots">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="20" cy="4" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="4" cy="20" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="20" cy="20" r="1.5"/></svg>
      </div>
    </div>
    <div class="docs-card-body">
      <span class="docs-card-label">CONCEPTS</span>
      <h3 class="docs-card-title">Understand the moving parts</h3>
      <div class="docs-card-dash"></div>
      <p class="docs-card-text">Columns, state, row links, selection, pagination, and payload shape.</p>
    </div>
    <div class="docs-card-wave">
      <svg viewBox="0 0 100 25" preserveAspectRatio="none"><path d="M0,25 C30,10 70,35 100,10 L100,25 L0,25 Z" fill="currentColor" opacity="0.08"></path></svg>
    </div>
  </a>

  <a href="/api/table/" class="docs-card card-green">
    <div class="docs-card-header">
      <div class="docs-card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
      </div>
      <div class="docs-card-dots">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="20" cy="4" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="4" cy="20" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="20" cy="20" r="1.5"/></svg>
      </div>
    </div>
    <div class="docs-card-body">
      <span class="docs-card-label">API REFERENCE</span>
      <h3 class="docs-card-title">Check exact signatures</h3>
      <div class="docs-card-dash"></div>
      <p class="docs-card-text">Classes, methods, enum cases, callback signatures, and Vue exports.</p>
    </div>
    <div class="docs-card-wave">
      <svg viewBox="0 0 100 25" preserveAspectRatio="none"><path d="M0,25 C30,10 70,35 100,10 L100,25 L0,25 Z" fill="currentColor" opacity="0.08"></path></svg>
    </div>
  </a>
</section>

<style>
.home-docs-grid-new {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
  margin-bottom: 60px;
}

.docs-card {
  display: flex;
  flex-direction: column;
  background: var(--zv-surface) ;
  border-radius: 16px;
  border: 1px solid var(--theme-border);
  padding: 20px;
  text-decoration: none !important;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 280px;
}

.docs-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.docs-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0px;
}

.docs-card-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--theme-bg);
  color: var(--theme-color);
outline: 4px solid var(--theme-bg);
    outline-offset: 4px;

}

.docs-card-icon svg {
  width: 35px;
  height: 35px;
}

.docs-card-dots {
  color: var(--theme-color);
  opacity: 0.5;
}

.docs-card-body {
  position: relative;
  z-index: 2;
  flex: 1;
}

.docs-card-label {
 display: inline-block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--theme-color);
    margin-bottom: 12px;
    background-color: var(--theme-color);
    color: white;
    padding: 5px 15px;
    border-radius: 49px;

  


}

.docs-card-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--sl-color-white) !important;
  line-height: 1.3;
  margin: 0 0 10px 0 !important;
  border: none !important; /* Override Starlight's h3 border */
}

.docs-card-dash {
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background-color: var(--theme-color);
  margin-bottom: 6px;
  margin-top: 6px;
}

.docs-card-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--sl-color-gray-3) !important;
  margin: 0 !important;
}

.docs-card-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1;
  color: var(--theme-color);
  pointer-events: none;
}

.docs-card-dots svg {
    width: 30px;
}

.docs-card-wave svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Themes */
.card-red {
  --theme-color: #f05a45;
  --theme-bg: #fff1f0;
  --theme-border: #fecaca;
}

.card-purple {
  --theme-color: #8b5cf6;
  --theme-bg: #f5f3ff;
  --theme-border: #ddd6fe;
}

.card-green {
  --theme-color: #10b981;
  --theme-bg: #ecfdf5;
  --theme-border: #a7f3d0;
}


.the-capability-ledger{display: inline-block;
    background-color: #f05a452e;
    color: #f05a45 !important;
    padding: 6px 18px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .5px;
    margin-bottom: 24px; 
    border: 1px solid #f05a4521;
    text-transform: uppercase;}



/* Responsive */
@media (max-width: 1024px) {
  .home-docs-grid-new {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .home-docs-grid-new {
    grid-template-columns: 1fr;
  }





</style>
