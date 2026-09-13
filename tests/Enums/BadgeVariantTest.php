<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\BadgeVariant;

it('defines badge variant values', function (): void {
    expect(array_column(BadgeVariant::cases(), 'value'))->toBe(['solid', 'outline', 'ghost']);
});

it('resolves badge variants from string values', function (): void {
    expect(BadgeVariant::from('solid'))->toBe(BadgeVariant::Solid)
        ->and(BadgeVariant::tryFrom('missing'))->toBeNull();
});
