<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests;

use Zonvoir\InertiaTable\InertiaTable;

uses(TestCase::class);

test('version returns package version', function (): void {
    expect((new InertiaTable())->version())->toBe('0.1.0');
});
