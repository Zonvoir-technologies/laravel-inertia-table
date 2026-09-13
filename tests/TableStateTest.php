<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\PaginationConfiguration;
use Zonvoir\InertiaTable\TableState;

it('normalizes table state from arrays', function (): void {
    $state = TableState::fromArray([
        'page' => '2',
        'perPage' => '30',
        'cursor' => '  abc  ',
        'search' => '  laravel  ',
        'sort' => ['column' => 'title', 'direction' => 'DESC'],
        'columns' => ['title', 'title', '', 123],
        'sticky' => ['title', ''],
    ], PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [15, 30]));

    expect($state->page())->toBe(2)
        ->and($state->perPage())->toBe(30)
        ->and($state->cursor())->toBe('abc')
        ->and($state->search())->toBe('laravel')
        ->and($state->sort())->toBe('title')
        ->and($state->direction())->toBe('desc')
        ->and($state->columns())->toBe(['title'])
        ->and($state->sticky())->toBe(['title'])
        ->and($state->hasStickyOverride())->toBeTrue();
});

it('falls back for invalid nullable and direction values', function (): void {
    $state = TableState::fromArray(['search' => [], 'sort' => '', 'direction' => 'sideways']);

    expect($state->search())->toBeNull()
        ->and($state->sort())->toBeNull()
        ->and($state->direction())->toBe('asc');
});

it('accepts enum directions', function (): void {
    expect(TableState::fromArray(['direction' => Direction::DESCENDING])->direction())->toBe('desc');
});

it('merges state while preserving current pagination defaults', function (): void {
    $state = TableState::fromArray(['perPage' => 30], PaginationConfiguration::make(defaultPerPage: 30, perPageOptions: [15, 30, 50]));
    $merged = $state->merge(['page' => 3], PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [15, 30, 50]));

    expect($merged->page())->toBe(3)
        ->and($merged->perPage())->toBe(30);
});

it('rejects invalid constructor values', function (): void {
    expect(fn () => new TableState(page: 0))->toThrow(InertiaTableException::class)
        ->and(fn () => new TableState(perPage: 0))->toThrow(InertiaTableException::class);
});

it('normalizes invalid state columns and directions and preserves sticky overrides', function (): void {
    $pagination = PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [15]);
    $state = TableState::fromArray(['columns' => 'bad', 'direction' => [], 'sticky' => ['title']], $pagination);

    expect($state->columns())->toBe([])
        ->and($state->direction())->toBe(Direction::ASCENDING->value)
        ->and($state->merge([], $pagination)->sticky())->toBe(['title']);
});
