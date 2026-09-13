<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Contracts\TableState as TableStateContract;
use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\TableState;

it('exposes table state behavior through the contract', function (): void {
    $state = new TableState(
        page: 2,
        perPage: 30,
        cursor: 'cursor-token',
        search: 'draft',
        sort: 'title',
        direction: Direction::DESCENDING,
        columns: ['title'],
        sticky: ['title'],
        hasStickyOverride: true,
    );

    $read = static fn (TableStateContract $state): array => [
        'page' => $state->page(),
        'perPage' => $state->perPage(),
        'cursor' => $state->cursor(),
        'search' => $state->search(),
        'sort' => $state->sort(),
        'direction' => $state->direction(),
        'columns' => $state->columns(),
        'sticky' => $state->sticky(),
        'hasStickyOverride' => $state->hasStickyOverride(),
        'array' => $state->toArray(),
    ];

    expect($state)->toBeInstanceOf(TableStateContract::class)
        ->and($read($state))->toMatchArray([
            'page' => 2,
            'perPage' => 30,
            'cursor' => 'cursor-token',
            'search' => 'draft',
            'sort' => 'title',
            'direction' => 'desc',
            'columns' => ['title'],
            'sticky' => ['title'],
            'hasStickyOverride' => true,
            'array' => [
                'page' => 2,
                'perPage' => 30,
                'cursor' => 'cursor-token',
                'search' => 'draft',
                'sort' => 'title',
                'direction' => 'desc',
            ],
        ]);
});
