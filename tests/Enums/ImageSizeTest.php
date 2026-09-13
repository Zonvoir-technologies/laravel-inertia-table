<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\ImageSize;

it('defines image size values', function (): void {
    expect(array_column(ImageSize::cases(), 'value'))->toBe(['small', 'medium', 'large', 'extra-large']);
});

it('maps image sizes to css classes', function (): void {
    expect(ImageSize::Small->classes())->toBe('size-4')
        ->and(ImageSize::Medium->classes())->toBe('size-6')
        ->and(ImageSize::Large->classes())->toBe('size-8')
        ->and(ImageSize::ExtraLarge->classes())->toBe('size-10');
});
