<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\TableRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;

it('builds page navigation query state', function (): void {
    expect(PostsTable::make()->navigation()->page(2))->toMatchArray(['page' => 2]);
});

it('resets page and cursor when per page or search changes', function (): void {
    $navigation = PostsTable::make()->navigation(TableRequest::fromArray(['page' => 3, 'cursor' => 'abc', 'perPage' => 50]));

    expect($navigation->perPage(15))->toMatchArray(['page' => 1, 'perPage' => 15])
        ->and($navigation->search('  draft  '))->toMatchArray(['page' => 1, 'search' => 'draft']);
});

it('builds cursor navigation and includes cursor state', function (): void {
    expect(PostsTable::make()->navigation()->cursor(' next-cursor '))->toMatchArray([
        'page' => 1,
        'cursor' => 'next-cursor',
    ]);
});

it('normalizes sort directions and named table state', function (): void {
    expect(PostsTable::make()->navigation()->sort('headline', Direction::DESCENDING))->toMatchArray([
        'page' => 1,
        'sort' => 'headline',
        'direction' => 'desc',
    ])
        ->and(PostsTable::make()->named('archive')->navigation()->search('draft'))->toBe([
            'archive' => ['page' => 1, 'search' => 'draft', 'sort' => 'votes', 'direction' => 'desc'],
        ]);
});

it('removes direction for an empty sort and normalizes null search values', function (): void {
    $navigation = PostsTable::make()->navigation(TableRequest::fromArray([
        'page' => 3,
        'cursor' => 'cursor',
        'sort' => 'votes',
        'direction' => 'desc',
    ]));

    expect($navigation->sort('  ', 'invalid'))->toMatchArray(['page' => 3])
        ->and($navigation->search(null))->toBe(['page' => 1, 'sort' => 'votes', 'direction' => 'desc']);
});

it('removes page state through the private query-string normalizer', function (): void {
    $navigation = PostsTable::make()->navigation();
    $method = new \ReflectionMethod($navigation, 'queryStringState');

    expect($method->invoke($navigation, ['page' => 2, 'sort' => 'title'], false))->toBe(['sort' => 'title']);
});
