<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\TableColor;

it('defines table color values', function (): void {
    expect(array_column(TableColor::cases(), 'value'))->toContain('default', 'primary', 'red', 'slate');
});

it('resolves table colors from string values', function (): void {
    expect(TableColor::from('red'))->toBe(TableColor::Red)
        ->and(TableColor::tryFrom('missing'))->toBeNull();
});
