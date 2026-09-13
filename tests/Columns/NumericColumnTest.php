<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\NumericColumn;

it('serializes as a numeric column with right alignment by default', function (): void {
    expect(NumericColumn::make('votes')->toArray())->toMatchArray([
        'type' => 'numeric',
        'alignment' => 'right',
    ]);
});

it('serializes numeric formatting metadata', function (): void {
    expect(NumericColumn::make('amount')
        ->precision(2)
        ->thousandsSeparator(',')
        ->decimalSeparator('.')
        ->prefix('$')
        ->suffix(' USD')
        ->placeholder('-')
        ->presentation('currency')
        ->toArray()['meta'])->toBe([
            'precision' => 2,
            'thousandsSeparator' => ',',
            'decimalSeparator' => '.',
            'prefix' => '$',
            'suffix' => ' USD',
            'placeholder' => '-',
            'presentation' => 'currency',
        ]);
});
