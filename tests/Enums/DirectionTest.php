<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\Direction;

it('defines sorting directions', function (): void {
    expect(Direction::ASCENDING->value)->toBe('asc')
        ->and(Direction::DESCENDING->value)->toBe('desc');
});

it('resolves directions from string values', function (): void {
    expect(Direction::from('asc'))->toBe(Direction::ASCENDING)
        ->and(Direction::tryFrom('missing'))->toBeNull();
});
