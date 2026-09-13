<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\ColumnAlignment;

it('defines column alignment values', function (): void {
    expect(array_column(ColumnAlignment::cases(), 'value'))->toBe(['left', 'center', 'right']);
});

it('resolves column alignments from string values', function (): void {
    expect(ColumnAlignment::from('center'))->toBe(ColumnAlignment::Center)
        ->and(ColumnAlignment::tryFrom('missing'))->toBeNull();
});
