<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\DateColumn;

it('serializes as a date column', function (): void {
    expect(DateColumn::make('published_at')->type())->toBe('date');
});

it('serializes date display metadata', function (): void {
    expect(DateColumn::make('published_at')->format('Y-m-d')->placeholder('-')->toArray()['meta'])->toBe([
        'format' => 'Y-m-d',
        'placeholder' => '-',
    ]);
});
