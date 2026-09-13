<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests;

use Zonvoir\InertiaTable\InertiaTable;
use Zonvoir\InertiaTable\TablePaginationBuilder;
use Zonvoir\InertiaTable\TablePayloadBuilder;
use Zonvoir\InertiaTable\TableQueryBuilder;
use Zonvoir\InertiaTable\TableQueryMetadataResolver;

uses(TestCase::class);

test('service provider registers singletons', function (): void {
    expect($this->app->make(InertiaTable::class))->toBeInstanceOf(InertiaTable::class)
        ->and($this->app->make(TableQueryMetadataResolver::class))->toBeInstanceOf(TableQueryMetadataResolver::class)
        ->and($this->app->make(TableQueryBuilder::class))->toBeInstanceOf(TableQueryBuilder::class)
        ->and($this->app->make(TablePaginationBuilder::class))->toBeInstanceOf(TablePaginationBuilder::class)
        ->and($this->app->make(TablePayloadBuilder::class))->toBeInstanceOf(TablePayloadBuilder::class);
});

test('service provider merges configuration', function (): void {
    expect(config('zonvoir-table.package_name'))->toBe('zonvoir-table')
        ->and(config('zonvoir-table.pagination.default_per_page'))->toBe(15);
});
