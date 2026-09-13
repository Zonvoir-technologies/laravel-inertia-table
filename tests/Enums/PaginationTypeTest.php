<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\PaginationType;

it('defines pagination type values', function (): void {
    expect(array_column(PaginationType::cases(), 'value'))->toBe(['standard', 'simple', 'cursor']);
});

it('resolves pagination types from string values', function (): void {
    expect(PaginationType::from('cursor'))->toBe(PaginationType::Cursor)
        ->and(PaginationType::tryFrom('missing'))->toBeNull();
});
