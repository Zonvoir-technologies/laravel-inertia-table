<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\BooleanColumn;

it('serializes boolean column labels and icons', function (): void {
    expect(BooleanColumn::make('active')
        ->trueLabel('Yes')
        ->falseLabel('No')
        ->nullLabel('Unknown')
        ->trueIcon('check')
        ->falseIcon('x')
        ->toArray()['meta'])->toMatchArray([
            'trueLabel' => 'Yes',
            'falseLabel' => 'No',
            'nullLabel' => 'Unknown',
            'trueIcon' => 'check',
            'falseIcon' => 'x',
        ]);
});

it('serializes boolean display mode', function (): void {
    expect(BooleanColumn::make('active')->displayAs('badge')->toArray()['meta'])->toBe([
        'displayAs' => 'badge',
    ]);
});
