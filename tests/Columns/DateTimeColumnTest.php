<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\DateTimeColumn;

it('serializes as a date time column', function (): void {
    expect(DateTimeColumn::make('published_at')->type())->toBe('date-time');
});

it('serializes date time display metadata', function (): void {
    expect(DateTimeColumn::make('published_at')->format('Y-m-d H:i')->timezone('UTC')->placeholder('-')->toArray()['meta'])->toBe([
        'format' => 'Y-m-d H:i',
        'timezone' => 'UTC',
        'placeholder' => '-',
    ]);
});
