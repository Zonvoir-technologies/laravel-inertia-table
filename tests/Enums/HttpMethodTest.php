<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\HttpMethod;

it('defines http method values', function (): void {
    expect(array_column(HttpMethod::cases(), 'value'))->toBe(['get', 'post', 'put', 'patch', 'delete']);
});

it('resolves http methods from string values', function (): void {
    expect(HttpMethod::from('post'))->toBe(HttpMethod::POST)
        ->and(HttpMethod::tryFrom('missing'))->toBeNull();
});
