<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\TableEmptyState;

it('serializes default empty state configuration', function (): void {
    expect(TableEmptyState::make()->toArray())->toMatchArray([
        'title' => 'No results found.',
        'message' => null,
        'icon' => null,
        'action' => null,
    ]);
});

it('serializes configured empty state values', function (): void {
    expect(TableEmptyState::make('No posts')->message('Try again')->icon('search')->toArray())->toMatchArray([
        'title' => 'No posts',
        'message' => 'Try again',
        'icon' => 'search',
    ]);
});

it('serializes nested empty state actions and json payloads', function (): void {
    $emptyState = TableEmptyState::make(action: Action::make('Create post')->url('/posts/create'));

    expect($emptyState->toArray()['action'])->toMatchArray([
        'key' => 'create-post',
        'label' => 'Create post',
        'type' => 'link',
    ])
        ->and($emptyState->jsonSerialize())->toBe($emptyState->toArray());
});
it('creates empty states through the create alias and can clear optional values', function (): void {
    $emptyState = TableEmptyState::create('Nothing here', 'Try changing filters', 'search')
        ->title(null)
        ->message(null)
        ->icon(null)
        ->action(null);

    expect($emptyState->toArray())->toBe([
        'title' => null,
        'message' => null,
        'icon' => null,
        'action' => null,
    ]);
});
