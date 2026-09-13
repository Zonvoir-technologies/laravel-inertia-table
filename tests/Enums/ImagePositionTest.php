<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\ImagePosition;

it('defines image position values', function (): void {
    expect(array_column(ImagePosition::cases(), 'value'))->toBe(['start', 'end']);
});

it('resolves image positions from string values', function (): void {
    expect(ImagePosition::from('end'))->toBe(ImagePosition::End)
        ->and(ImagePosition::tryFrom('missing'))->toBeNull();
});
