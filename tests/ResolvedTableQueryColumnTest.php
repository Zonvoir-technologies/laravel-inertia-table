<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\ResolvedTableQueryColumn;

it('exposes resolved query column values and callbacks', function (): void {
    $search = static fn (): string => 'search';
    $sort = static fn (): string => 'sort';
    $column = new ResolvedTableQueryColumn('author', 'author.name', true, false, $search, $sort);

    expect($column->key())->toBe('author')
        ->and($column->field())->toBe('author.name')
        ->and($column->isSearchable())->toBeTrue()
        ->and($column->isSortable())->toBeFalse()
        ->and($column->searchCallback())->toBe($search)
        ->and($column->sortCallback())->toBe($sort)
        ->and($column->toArray())->toMatchArray([
            'key' => 'author',
            'field' => 'author.name',
            'searchable' => true,
            'sortable' => false,
            'hasCustomSearchCallback' => true,
            'hasCustomSortCallback' => true,
        ]);
});

it('serializes missing callbacks as false flags', function (): void {
    expect((new ResolvedTableQueryColumn('title', 'title', false, true))->toArray())->toMatchArray([
        'searchable' => false,
        'sortable' => true,
        'hasCustomSearchCallback' => false,
        'hasCustomSortCallback' => false,
    ]);
});
