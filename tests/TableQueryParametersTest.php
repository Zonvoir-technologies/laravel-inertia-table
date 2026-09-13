<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\TableQueryParameters;
use Zonvoir\InertiaTable\TableState;

it('normalizes table query parameters', function (): void {
    $parameters = TableQueryParameters::fromArray(['search' => '  alpha  ', 'sort' => ['column' => 'title', 'direction' => 'DESC']]);

    expect($parameters->search())->toBe('alpha')
        ->and($parameters->sort())->toBe('title')
        ->and($parameters->direction())->toBe('desc');
});

it('falls back for invalid values', function (): void {
    $parameters = TableQueryParameters::fromArray(['search' => [], 'sort' => '', 'direction' => 'bad']);

    expect($parameters->search())->toBeNull()
        ->and($parameters->sort())->toBeNull()
        ->and($parameters->direction())->toBe('asc');
});

it('accepts enum directions and table state objects', function (): void {
    expect(TableQueryParameters::fromArray(['direction' => Direction::DESCENDING])->direction())->toBe('desc')
        ->and(TableQueryParameters::fromState(new TableState(search: 'alpha', sort: 'title', direction: Direction::DESCENDING))->direction())->toBe('desc');
});

it('normalizes non-string sort directions', function (): void {
    expect(TableQueryParameters::fromArray(['direction' => []])->direction())->toBe('asc');
});
