<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Zonvoir\InertiaTable\TableQueryBuilder;
use Zonvoir\InertiaTable\TableQueryParameters;
use Zonvoir\InertiaTable\TableState;
use Zonvoir\InertiaTable\Tests\Fixtures\DefaultSearchPostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('applies array query parameters', function (): void {
    TestPost::query()->create(['title' => 'B Laravel', 'votes' => 10]);
    TestPost::query()->create(['title' => 'A Laravel', 'votes' => 20]);
    TestPost::query()->create(['title' => 'Hidden PHP', 'votes' => 30]);

    $results = app(TableQueryBuilder::class)
        ->apply(TestPost::query(), DefaultSearchPostsTable::make(), ['search' => 'Laravel', 'sort' => 'title', 'direction' => 'asc'])
        ->pluck('title')
        ->all();

    expect($results)->toBe(['A Laravel', 'B Laravel']);
});

it('accepts table state and query parameter objects', function (): void {
    TestPost::query()->create(['title' => 'B']);
    TestPost::query()->create(['title' => 'A']);

    expect(app(TableQueryBuilder::class)->apply(TestPost::query(), DefaultSearchPostsTable::make(), new TableState(sort: 'title'))->pluck('title')->all())->toBe(['A', 'B'])
        ->and(app(TableQueryBuilder::class)->apply(TestPost::query(), DefaultSearchPostsTable::make(), new TableQueryParameters(sort: 'title', direction: 'desc'))->pluck('title')->all())->toBe(['B', 'A']);
});

it('uses cloned custom search builders without mutating the original', function (): void {
    TestPost::query()->create(['title' => 'Visible', 'status' => 'published']);
    TestPost::query()->create(['title' => 'Hidden', 'status' => 'draft']);

    $builder = app(TableQueryBuilder::class);
    $custom = $builder->searchUsing(static function (Builder $query): void {
        $query->where('status', 'published');
    });

    expect($custom->apply(TestPost::query(), DefaultSearchPostsTable::make(), ['search' => 'anything'])->pluck('title')->all())->toBe(['Visible'])
        ->and($builder->apply(TestPost::query(), DefaultSearchPostsTable::make(), ['search' => 'anything'])->pluck('title')->all())->toBe([]);
});

it('accepts null search callbacks and unknown parameter values', function (): void {
    $builder = app(TableQueryBuilder::class);
    $method = new ReflectionMethod($builder, 'normalizeParameters');

    expect($builder->searchUsing(null))->toBe($builder)
        ->and($method->invoke($builder, null))->toEqual(new TableQueryParameters());
});
