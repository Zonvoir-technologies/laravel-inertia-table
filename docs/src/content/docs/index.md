---
title: Free Laravel Inertia Tables for Vue
description: Build Laravel Inertia tables with Zonvoir Table, a free, open-source Vue data table package with server-side search, sorting and pagination.
template: splash
head:
    - tag: title
      content: Zonvoir Table — Free Laravel Inertia Table for Vue
    - tag: meta
      attrs:
          property: og:title
          content: Zonvoir Table — Free Laravel Inertia Table for Vue
    - tag: meta
      attrs:
          property: og:description
          content: Build Laravel Inertia tables with Zonvoir Table, a free, open-source Vue data table package with server-side search, sorting and pagination.
    - tag: meta
      attrs:
          property: og:type
          content: website
hero:
    title: Free Laravel Inertia <br />Tables for <span>Vue.</span>
    tagline: Zonvoir Table is a free, open-source Laravel Inertia table package for Vue applications. Define tables in PHP using Eloquent, then render searchable, sortable, paginated tables with the Vue adapter.
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

<section class="zv-code zv-code-wrapper" aria-label="Table definition and Vue adapter example">
<div class="zv-code-copy">
<p class="zv-eyebrow">PHP Backend + Vue Adapter</p>
<h2>Define in PHP. <span>Render in Vue.</span></h2>
<p class="cd-desc">A single PHP class defines the Eloquent query, columns, URL state, row actions, and exports. In Vue, the first-party adapter renders a responsive, interactive data table with zero boilerplate.</p>
</div>

<div class="zv-terminal-shell">
<input class="hero-tab-radio" type="radio" name="hero-code-tab" id="hero-code-php" checked>
<input class="hero-tab-radio" type="radio" name="hero-code-tab" id="hero-code-vue">

<div class="terminal-window" aria-label="UsersTable PHP and Vue example">
<div class="terminal-bar">
<div class="terminal-dots"><span></span><span></span><span></span></div>
<div class="terminal-tabs" role="tablist" aria-label="Code language tabs"><label for="hero-code-php" class="hero-tab-btn tab-btn-php" role="tab" tabindex="0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg><span class="tab-label">UsersTable.php</span></label><label for="hero-code-vue" class="hero-tab-btn tab-btn-vue" role="tab" tabindex="0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 3h3.5L12 14 18.5 3H22L12 21 2 3z" fill="#41B883"/><path d="M6.5 3h3.5L12 7 14 3h3.5L12 11.5 6.5 3z" fill="#35495E"/></svg><span class="tab-label">UsersIndex.vue</span></label></div>
</div>

<div class="hero-code-pane pane-php">
<pre><code><span class="ln">1</span>  <b>use</b> App\Models\User;
<span class="ln">2</span>  <b>use</b> Zonvoir\InertiaTable\Columns\TextColumn;
<span class="ln">3</span>  <b>use</b> Zonvoir\InertiaTable\Table;
<span class="ln">4</span>
<span class="ln">5</span>  <b>final class</b> UsersTable <b>extends</b> Table
<span class="ln">6</span>  {
<span class="ln">7</span>     <b>protected</b> ?string $resource = User::class;
<span class="ln">8</span>     <b>protected</b> ?string $defaultSort = 'name';
<span class="ln">9</span>
<span class="ln">10</span>     <b>public function</b> columns(): array
<span class="ln">11</span>     {
<span class="ln">12</span>         <b>return</b> [
<span class="ln">13</span>             TextColumn::make('name')->searchable()->sortable(),
<span class="ln">14</span>             TextColumn::make('email')->searchable(),
<span class="ln">15</span>         ];
<span class="ln">16</span>     }
<span class="ln">17</span>  }</code></pre>
</div>

<div class="hero-code-pane pane-vue">
<pre><code><span class="ln">1</span>  &lt;<b>script</b> setup lang="ts"&gt;
<span class="ln">2</span>  <b>import</b> { ZonvoirTable, <b>type</b> TableResource } <b>from</b> '@zonvoir/inertia-table-vue';
<span class="ln">3</span>
<span class="ln">4</span>  defineProps&lt;{ users: TableResource }&gt;();
<span class="ln">5</span>  &lt;/<b>script</b>&gt;
<span class="ln">6</span>
<span class="ln">7</span>  &lt;<b>template</b>&gt;
<span class="ln">8</span>    &lt;<b>ZonvoirTable</b> :table="users" /&gt;
<span class="ln">9</span>  &lt;/<b>template</b>&gt;</code></pre>
</div>

</div>

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
<div class="feature-panel panel-table"><p class="feature-breadcrumb">features <span>/</span> table-definition.php</p><h2><span>#</span> Built-in Table Definition</h2><p>One PHP class drives the query, columns, URL state, row actions, exports, and frontend metadata.</p><div class="feature-content"><ul><li>Resolve an Eloquent model class or query builder.</li><li>Return typed column, action, and export definitions.</li><li>Serialize a stable payload for Inertia.</li></ul><div class="terminal-window" aria-label="Table definition PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>table-definition.php</strong></div><pre><code><span class="ln">1</span>  UsersTable::make();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/generate-tables/">Read the Table Generation Guide →</a></p></div></div>
<div class="feature-panel panel-search"><p class="feature-breadcrumb">features <span>/</span> search-state.php</p><h2><span>#</span> Search State</h2><p>Search can be table-level, column-level, or customized with callbacks in the query builder layer.</p><div class="feature-content"><ul><li>Set searchable fields on the table.</li><li>Mark individual columns as searchable.</li><li>Keep search state in the query string.</li></ul><div class="terminal-window" aria-label="Search state PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>search-state.php</strong></div><pre><code><span class="ln">1</span>  <b>protected</b> array|string|null $search = ['name', 'email'];
<span class="ln">2</span>
<span class="ln">3</span>  TextColumn::make('name')->searchable();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/searching/">Read the Searching Guide →</a></p></div></div>
<div class="feature-panel panel-sorting"><p class="feature-breadcrumb">features <span>/</span> sorting.php</p><h2><span>#</span> Sorting</h2><p>Sortable columns expose direction-aware query state while the backend stays in charge of the query.</p><div class="feature-content"><ul><li>Enable sorting per column.</li><li>Use `-column` for descending defaults.</li><li>Override sorting with `sortUsing()` when needed.</li></ul><div class="terminal-window" aria-label="Sorting PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>sorting.php</strong></div><pre><code><span class="ln">1</span>  <b>protected</b> ?string $defaultSort = '-created_at';
<span class="ln">2</span>
<span class="ln">3</span>  TextColumn::make('name')->sortable();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/sorting/">Read the Sorting Guide →</a></p></div></div>
<div class="feature-panel panel-pagination"><p class="feature-breadcrumb">features <span>/</span> pagination.php</p><h2><span>#</span> Pagination</h2><p>Pagination configuration lives with the table, including allowed page sizes and pagination strategy.</p><div class="feature-content"><ul><li>Standard, simple, and cursor modes.</li><li>Configurable per-page options.</li><li>Normalized page, cursor, and per-page input.</li></ul><div class="terminal-window" aria-label="Pagination PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>pagination.php</strong></div><pre><code><span class="ln">1</span>  <b>protected</b> ?int $defaultPerPage = 30;
<span class="ln">2</span>  <b>protected</b> ?array $perPageOptions = [15, 30, 50];</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/pagination/">Read the Pagination Guide →</a></p></div></div>
<div class="feature-panel panel-actions"><p class="feature-breadcrumb">features <span>/</span> row-actions.php</p><h2><span>#</span> Row Actions & Links</h2><p>Actions and row URLs are serialized as metadata so Vue can render the right controls.</p><div class="feature-content"><ul><li>Return actions from `actions()`.</li><li>Use `Url` for route and Inertia metadata.</li><li>Support authorization, disabled, hidden, and confirm states.</li></ul><div class="terminal-window" aria-label="Row actions PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>row-actions.php</strong></div><pre><code><span class="ln">1</span>  Action::make('Edit')
<span class="ln">2</span>      ->url(<b>fn</b> ($user, $url) =&gt; $url->route('users.edit', $user));</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/row-actions/">Read the Row Actions Guide →</a></p></div></div>
<div class="feature-panel panel-bulk"><p class="feature-breadcrumb">features <span>/</span> bulk-actions.php</p><h2><span>#</span> Bulk Actions</h2><p>Bulk actions reuse the action API and execute against selected row keys.</p><div class="feature-content"><ul><li>Enable bulk mode with `asBulkAction()`.</li><li>Use `onlyAsBulkAction()` for bulk-only flows.</li><li>Control chunk size and strategy.</li></ul><div class="terminal-window" aria-label="Bulk actions PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>bulk-actions.php</strong></div><pre><code><span class="ln">1</span>  Action::make('Archive')
<span class="ln">2</span>      ->asBulkAction(chunkSize: 100)
<span class="ln">3</span>      ->confirm('Archive users?');</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/bulk-actions/">Read the Bulk Actions Guide →</a></p></div></div>
<div class="feature-panel panel-columns"><p class="feature-breadcrumb">features <span>/</span> columns.php</p><h2><span>#</span> Columns</h2><p>One Columns guide covers common options plus text, numeric, boolean, badge, image, date, date-time, and action columns.</p><div class="feature-content"><ul><li>Shared visibility, sizing, sticky, search, and sort metadata.</li><li>Column-specific display settings.</li><li>Export labels, values, formats, and styles.</li></ul><div class="terminal-window" aria-label="Columns PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>columns.php</strong></div><pre><code><span class="ln">1</span>  BadgeColumn::make('status')
<span class="ln">2</span>      ->colors(['active' =&gt; 'success'])
<span class="ln">3</span>      ->solid();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/columns/">Read the Typed Columns Guide →</a></p></div></div>
<div class="feature-panel panel-sticky"><p class="feature-breadcrumb">features <span>/</span> sticky-columns.php</p><h2><span>#</span> Sticky Columns</h2><p>Sticky columns keep high-value identifiers visible while users scan wide data sets.</p><div class="feature-content"><ul><li>Enable sticky behavior per column.</li><li>Pair with width metadata for predictable layout.</li><li>Allow sticky overrides through table state.</li></ul><div class="terminal-window" aria-label="Sticky columns PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>sticky-columns.php</strong></div><pre><code><span class="ln">1</span>  TextColumn::make('name')
<span class="ln">2</span>      ->sticky()
<span class="ln">3</span>      ->width('16rem');</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/sticky-columns/">Read the Sticky Columns Guide →</a></p></div></div>
<div class="feature-panel panel-exports"><p class="feature-breadcrumb">features <span>/</span> exports.php</p><h2><span>#</span> Excel Exports</h2><p>Return export definitions from the table and choose filtered or selected-row export scope.</p><div class="feature-content"><ul><li>Expose export controls in table metadata.</li><li>Limit to filtered or selected rows.</li><li>Queue large exports when needed.</li></ul><div class="terminal-window" aria-label="Excel exports PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>exports.php</strong></div><pre><code><span class="ln">1</span>  Export::make('Users', 'users.xlsx')
<span class="ln">2</span>      ->limitToFilteredRows();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/exports/">Read the Exports Guide →</a></p></div></div>
<div class="feature-panel panel-url"><p class="feature-breadcrumb">features <span>/</span> url-state.php</p><h2><span>#</span> URL State</h2><p>Table state is represented in query string keys for page, per-page, cursor, search, sort, direction, columns, and sticky overrides.</p><div class="feature-content"><ul><li>Name tables to namespace query state.</li><li>Generate navigation URLs from the current state.</li><li>Keep reloads and browser history predictable.</li></ul><div class="terminal-window" aria-label="URL state PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>url-state.php</strong></div><pre><code><span class="ln">1</span>  $table->navigation()->search('olivia');
<span class="ln">2</span>  $table->navigation()->sort('name');</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/api/configuration/#tablestate">Read the Table State & URL API →</a></p></div></div>
<div class="feature-panel panel-multiple"><p class="feature-breadcrumb">features <span>/</span> multiple-tables.php</p><h2><span>#</span> Multiple Tables</h2><p>Name each table to avoid query string collisions when a page renders more than one table.</p><div class="feature-content"><ul><li>Use `named()` or `as()`.</li><li>Separate page, search, sort, columns, and sticky state.</li><li>Render multiple independent table payloads.</li></ul><div class="terminal-window" aria-label="Multiple tables PHP example"><div class="terminal-bar"><span></span><span></span><span></span><strong>multiple-tables.php</strong></div><pre><code><span class="ln">1</span>  UsersTable::make()->named('users')->results();
<span class="ln">2</span>  OrdersTable::make()->named('orders')->results();</code></pre></div><p class="read-mr" style="margin-top: 1rem;"><a href="/core-concepts/multiple-tables/">Read the Multiple Tables Guide →</a></p></div></div>
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

<section class="zv-free-scope" aria-label="Free edition scope and license">
<div class="zv-section-header">
<p class="zv-eyebrow">100% Free &amp; Open Source</p>
<h2>Complete Laravel Inertia Table functionality. <span>Zero paywalls.</span></h2>
<p class="zv-section-desc">Zonvoir Table is published under the permissive Apache License 2.0. Both the Laravel Eloquent backend package (<code>zonvoir/laravel-inertia-table</code>) and the Inertia Vue 3 adapter (<code>@zonvoir/inertia-table-vue</code>) are completely free for personal and commercial applications.</p>
</div>

<div class="zv-free-grid">
<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
</div>
<h3>Live Server-Side Search</h3>
<p>Global table search and column-specific filters orchestrated directly through Eloquent queries with query-string synchronization.</p>
<a href="/core-concepts/searching/" class="zv-card-link">Searching Guide →</a>
</div>

<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 16l-4 4-4-4M7 20V4M13 8l4-4 4 4M17 4v16"/></svg>
</div>
<h3>Multi-Column Sorting</h3>
<p>Direction-aware sorting with descending defaults (<code>-column</code>), custom sort callbacks, and URL state preservation.</p>
<a href="/core-concepts/sorting/" class="zv-card-link">Sorting Guide →</a>
</div>

<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/><path d="M6 18h12M6 6h12"/></svg>
</div>
<h3>Standard &amp; Cursor Pagination</h3>
<p>Built-in support for length-aware, simple, and cursor pagination with configurable per-page options (e.g. 15, 30, 50).</p>
<a href="/core-concepts/pagination/" class="zv-card-link">Pagination Guide →</a>
</div>

<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
</div>
<h3>Row &amp; Bulk Actions</h3>
<p>Single-row actions and multi-row selection with batch chunking, confirmation dialogs, and authorization checks.</p>
<a href="/core-concepts/bulk-actions/" class="zv-card-link">Bulk Actions Guide →</a>
</div>

<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
</div>
<h3>Column Visibility &amp; Sticky Pins</h3>
<p>Users can toggle column visibility dynamically and pin high-value identification columns during wide horizontal scrolling.</p>
<a href="/core-concepts/sticky-columns/" class="zv-card-link">Sticky Columns Guide →</a>
</div>

<div class="zv-free-card">
<div class="zv-free-card-icon">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
</div>
<h3>Excel &amp; CSV Exports</h3>
<p>Download filtered subsets or selected rows directly from table state, with background queue support for large datasets.</p>
<a href="/core-concepts/exports/" class="zv-card-link">Exports Guide →</a>
</div>
</div>
</section>

<section class="zv-faq" aria-label="Frequently asked questions">
<div class="zv-section-header">
<p class="zv-eyebrow">Developer FAQ</p>
<h2>Clear answers for your <span>Laravel &amp; Inertia</span> stack.</h2>
<p class="zv-section-desc">Everything you need to know about integrating Zonvoir Table into your Laravel Inertia Vue applications.</p>
</div>

<div class="zv-faq-list">
<div class="zv-faq-item">
<h3>Is Zonvoir Table really free for commercial projects?</h3>
<p>Yes. Zonvoir Table is 100% free and open-source software licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache License 2.0</a>. There is no "Pro" version, paid license, or feature gating. You can use it in commercial SaaS apps, internal dashboards, and client deliverables with no restrictions.</p>
</div>

<div class="zv-faq-item">
<h3>What stack versions does Zonvoir Table support?</h3>
<p>Zonvoir Table is tested against modern releases: PHP 8.3+, Laravel 11, 12, and 13, Inertia.js 2.x and 3.x, Vue 3.4+, and Tailwind CSS 3.4+ or 4.0+. Full TypeScript type declarations are packaged with the Vue adapter. See the <a href="/getting-started/requirements/">Requirements guide</a> for details.</p>
</div>

<div class="zv-faq-item">
<h3>How does server-side data fetching work without separate API routes?</h3>
<p>You define tables using PHP classes (e.g., <code>UsersTable extends Table</code>). In your Inertia controller, return <code>UsersTable::make()</code>. The table orchestrates the Eloquent query, applies current search/sort/pagination filters from the request, and passes a normalized payload to your Vue template. The Inertia adapter updates the page via standard Inertia partial reloads.</p>
</div>

<div class="zv-faq-item">
<h3>Can I customize the design, colors, and cell components?</h3>
<p>Yes. Zonvoir Table is styled with Tailwind CSS utility classes and includes built-in dark mode support. You can customize theme colors, apply column-level classes, or use Vue slots to render custom interactive components, avatars, status badges, and action dropdowns in any cell. Explore the <a href="/advanced/slots/">Slots guide</a> and <a href="/advanced/styling/">Styling guide</a>.</p>
</div>
</div>
</section>

<section class="zv-ecosystem" aria-label="Official ecosystem listings">
<div class="zv-ecosystem-card">
<div class="zv-ecosystem-info">
<p class="zv-eyebrow">Official Packages &amp; Resources</p>
<h2>Ready to build fast, expressive tables?</h2>
<p>Install via Composer and npm, or inspect the source code and interactive demo:</p>
</div>
<div class="zv-ecosystem-links">
<a href="https://packagist.org/packages/zonvoir/laravel-inertia-table" target="_blank" rel="noopener noreferrer" class="zv-eco-link">
<span class="zv-eco-badge">Composer</span>
<strong>zonvoir/laravel-inertia-table</strong>
<span class="zv-eco-arrow">↗</span>
</a>
<a href="https://www.npmjs.com/package/@zonvoir/inertia-table-vue" target="_blank" rel="noopener noreferrer" class="zv-eco-link">
<span class="zv-eco-badge">npm</span>
<strong>@zonvoir/inertia-table-vue</strong>
<span class="zv-eco-arrow">↗</span>
</a>
<a href="https://github.com/Zonvoir-technologies/laravel-inertia-table" target="_blank" rel="noopener noreferrer" class="zv-eco-link">
<span class="zv-eco-badge">GitHub</span>
<strong>Repository &amp; Releases</strong>
<span class="zv-eco-arrow">↗</span>
</a>
<a href="https://demo.zonvoir-table.com" target="_blank" rel="noopener noreferrer" class="zv-eco-link">
<span class="zv-eco-badge">Demo</span>
<strong>Live Interactive Preview</strong>
<span class="zv-eco-arrow">↗</span>
</a>
</div>
</div>
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
}

/* Free Scope, FAQ & Ecosystem Sections */
.zv-section-header {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 40px auto;
}

.zv-section-header h2 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--sl-color-white) !important;
  margin-bottom: 16px;
  border: none !important;
}

.zv-section-header h2 span {
  color: #f05a45;
}

.zv-section-desc {
  font-size: 16px;
  line-height: 1.6;
  color: var(--sl-color-gray-3) !important;
  margin: 0;
}

.zv-free-scope {
  margin: 80px 0 60px 0;
  padding: 60px 0 20px 0;
  border-top: 1px solid var(--theme-border);
}

.zv-free-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.zv-free-card {
  background: var(--zv-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.zv-free-card:hover {
  transform: translateY(-3px);
  border-color: #f05a45;
  box-shadow: 0 10px 25px rgba(240, 90, 69, 0.08);
}

.zv-free-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff1f0;
  color: #f05a45;
  margin-bottom: 16px;
}

.zv-free-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--sl-color-white) !important;
  margin: 0 0 8px 0 !important;
  border: none !important;
}

.zv-free-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--sl-color-gray-3) !important;
  margin: 0 0 16px 0 !important;
  flex: 1;
}

.zv-card-link {
  font-size: 13px;
  font-weight: 600;
  color: #f05a45 !important;
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.15s ease;
}

.zv-card-link:hover {
  gap: 8px;
}

.zv-faq {
  margin: 60px 0;
  padding: 60px 0 20px 0;
  border-top: 1px solid var(--theme-border);
}

.zv-faq-list {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.zv-faq-item {
  background: var(--zv-surface);
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  padding: 24px 28px;
}

.zv-faq-item h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--sl-color-white) !important;
  margin: 0 0 10px 0 !important;
  border: none !important;
}

.zv-faq-item p {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--sl-color-gray-3) !important;
  margin: 0 !important;
}

.zv-faq-item a {
  color: #f05a45 !important;
  text-decoration: underline !important;
}

.zv-ecosystem {
  margin: 60px 0 80px 0;
}

.zv-ecosystem-card {
  background: var(--zv-surface);
  border: 1px solid var(--theme-border);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.zv-ecosystem-info {
  flex: 1;
  max-width: 480px;
}

.zv-ecosystem-info h2 {
  font-size: 26px;
  font-weight: 800;
  color: var(--sl-color-white) !important;
  margin: 8px 0 12px 0 !important;
  border: none !important;
}

.zv-ecosystem-info p {
  font-size: 15px;
  color: var(--sl-color-gray-3) !important;
  margin: 0 !important;
}

.zv-ecosystem-links {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.zv-eco-link {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  text-decoration: none !important;
  transition: all 0.2s ease;
  position: relative;
}

.zv-eco-link:hover {
  background: rgba(240, 90, 69, 0.08);
  border-color: #f05a45;
  transform: translateY(-2px);
}

.zv-eco-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #f05a45;
  margin-bottom: 6px;
}

.zv-eco-link strong {
  font-size: 13.5px;
  color: var(--sl-color-white);
  word-break: break-all;
}

.zv-eco-arrow {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 14px;
  color: var(--sl-color-gray-3);
  transition: transform 0.15s ease;
}

.zv-eco-link:hover .zv-eco-arrow {
  color: #f05a45;
  transform: translate(2px, -2px);
}

@media (max-width: 1024px) {
  .zv-free-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .zv-ecosystem-card {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .zv-free-grid {
    grid-template-columns: 1fr;
  }
  .zv-ecosystem-links {
    grid-template-columns: 1fr;
  }
  .zv-section-header h2 {
    font-size: 24px;
  }
}
</style>
