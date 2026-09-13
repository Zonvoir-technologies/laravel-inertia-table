<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Enums\BadgeVariant;
use Zonvoir\InertiaTable\Enums\TableColor;

it('serializes badge color metadata from strings and enums', function (): void {
    expect(BadgeColumn::make('status')->colors(['draft' => 'gray', 'published' => TableColor::Green])->toArray()['meta']['colors'])
        ->toBe(['draft' => 'gray', 'published' => 'green']);
});

it('serializes badge variants from helpers strings and enums', function (): void {
    expect(BadgeColumn::make('status')->solid()->toArray()['meta']['variant'])->toBe('solid')
        ->and(BadgeColumn::make('status')->outline()->toArray()['meta']['variant'])->toBe('outline')
        ->and(BadgeColumn::make('status')->ghost()->toArray()['meta']['variant'])->toBe('ghost')
        ->and(BadgeColumn::make('status')->variant(BadgeVariant::Outline)->toArray()['meta']['variant'])->toBe('outline')
        ->and(BadgeColumn::make('status')->variant('custom')->toArray()['meta']['variant'])->toBe('custom');
});

it('serializes badge icons', function (): void {
    expect(BadgeColumn::make('status')->icons(['draft' => 'clock'])->icon('tag')->toArray()['meta'])->toMatchArray([
        'icons' => ['draft' => 'clock'],
        'icon' => 'tag',
    ]);
});
