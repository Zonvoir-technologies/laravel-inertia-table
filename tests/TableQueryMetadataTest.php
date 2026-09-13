<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\ResolvedTableQueryColumn;
use Zonvoir\InertiaTable\TableQueryMetadata;

it('finds sortable columns and searchable columns', function (): void {
    $title = new ResolvedTableQueryColumn('title', 'title', true, true);
    $status = new ResolvedTableQueryColumn('status', 'status', false, false);
    $metadata = new TableQueryMetadata([$title, $status]);

    expect($metadata->columns())->toBe([$title, $status])
        ->and($metadata->sortableColumn('title'))->toBe($title)
        ->and($metadata->sortableColumn('status'))->toBeNull()
        ->and($metadata->sortableColumn(null))->toBeNull()
        ->and($metadata->searchableColumns())->toBe([$title]);
});

it('does not return non sortable columns for matching keys', function (): void {
    $metadata = new TableQueryMetadata([
        new ResolvedTableQueryColumn('title', 'title', true, false),
    ]);

    expect($metadata->sortableColumn('title'))->toBeNull();
});
