<?php

declare(strict_types=1);

use Illuminate\Support\Collection;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TablePaginationBuilder;
use Zonvoir\InertiaTable\TableState;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('returns a collection when table pagination is disabled', function (): void {
    TestPost::query()->create(['title' => 'First']);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected bool $pagination = false;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    $results = app(TablePaginationBuilder::class)->paginate(TestPost::query(), $table, new TableState());

    expect($results)->toBeInstanceOf(Collection::class)
        ->and($results)->toHaveCount(1);
});

it('returns a length aware paginator for standard pagination', function (): void {
    TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);

    $results = app(TablePaginationBuilder::class)->paginate(TestPost::query(), PostsTable::make(), new TableState(perPage: 1));

    expect($results->items())->toHaveCount(1)
        ->and($results->total())->toBe(2);
});
it('returns a simple paginator for simple pagination', function (): void {
    TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected \Zonvoir\InertiaTable\Enums\PaginationType $paginationType = \Zonvoir\InertiaTable\Enums\PaginationType::Simple;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    $results = app(TablePaginationBuilder::class)->paginate(TestPost::query(), $table, new TableState(page: 1, perPage: 1));

    expect($results)->toBeInstanceOf(\Illuminate\Contracts\Pagination\Paginator::class)
        ->and($results->items())->toHaveCount(1)
        ->and($results->hasMorePages())->toBeTrue();
});

it('returns a cursor paginator for cursor pagination', function (): void {
    TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected \Zonvoir\InertiaTable\Enums\PaginationType $paginationType = \Zonvoir\InertiaTable\Enums\PaginationType::Cursor;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    $results = app(TablePaginationBuilder::class)->paginate(TestPost::query()->orderBy('id'), $table, new TableState(perPage: 1));

    expect($results)->toBeInstanceOf(\Illuminate\Contracts\Pagination\CursorPaginator::class)
        ->and($results->items())->toHaveCount(1)
        ->and($results->hasMorePages())->toBeTrue();
});
