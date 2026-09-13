<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\ButtonVariant;

it('defines button variant values', function (): void {
    expect(array_column(ButtonVariant::cases(), 'value'))->toBe(['solid', 'outline', 'ghost', 'link']);
});

it('resolves button variants from string values', function (): void {
    expect(ButtonVariant::from('link'))->toBe(ButtonVariant::Link)
        ->and(ButtonVariant::tryFrom('missing'))->toBeNull();
});
