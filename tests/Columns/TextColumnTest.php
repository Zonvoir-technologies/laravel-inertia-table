<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\TextColumn;

it('serializes as a text column', function (): void {
    expect(TextColumn::make('title')->type())->toBe('text');
});

it('inherits column create factory behavior', function (): void {
    expect(TextColumn::create('title', label: 'Title')->toArray())->toMatchArray([
        'name' => 'title',
        'label' => 'Title',
        'type' => 'text',
    ]);
});
