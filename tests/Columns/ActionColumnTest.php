<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\ActionColumn;

it('uses action column defaults', function (): void {
    expect(ActionColumn::make()->toArray())->toMatchArray([
        'key' => 'actions',
        'name' => 'actions',
        'type' => 'action',
        'alignment' => 'center',
        'toggleable' => true,
    ]);
});

it('can serialize dropdown mode from factory or method', function (): void {
    expect(ActionColumn::make(asDropdown: true)->toArray()['meta'])->toMatchArray([
        'asDropdown' => true,
        'dropdown' => true,
    ])
        ->and(ActionColumn::make()->asDropdown(false)->toArray()['meta'])->toMatchArray([
            'asDropdown' => false,
            'dropdown' => false,
        ]);
});

it('stores and appends inline action definitions', function (): void {
    $column = ActionColumn::make()
        ->actions([['key' => 'view']])
        ->addAction(['key' => 'edit']);

    expect($column->toArray()['meta']['actions'])->toBe([
        ['key' => 'view'],
        ['key' => 'edit'],
    ]);
});

it('creates action columns through the create factory', function (): void {
    expect(ActionColumn::create()->toArray())->toMatchArray(['type' => 'action']);
});
