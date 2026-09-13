<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Zonvoir\InertiaTable\ResolvedTableQueryColumn;
use Zonvoir\InertiaTable\TableQueryMetadata;
use Zonvoir\InertiaTable\TableSearchBuilder;
use Zonvoir\InertiaTable\Tests\Fixtures\TestAuthor;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('does not change queries for blank searches', function (): void {
    TestPost::query()->create(['title' => 'Visible']);

    $query = TestPost::query();
    app(TableSearchBuilder::class)->apply($query, new TableQueryMetadata([]), '   ');

    expect($query->pluck('title')->all())->toBe(['Visible']);
});

it('applies default search across plain fields', function (): void {
    TestPost::query()->create(['title' => 'Laravel Tables']);
    TestPost::query()->create(['title' => 'Plain PHP']);

    $metadata = new TableQueryMetadata([
        new ResolvedTableQueryColumn('title', 'title', true, false),
    ]);
    $query = TestPost::query();

    app(TableSearchBuilder::class)->apply($query, $metadata, 'Laravel');

    expect($query->pluck('title')->all())->toBe(['Laravel Tables']);
});

it('applies default search across relation fields', function (): void {
    $alice = TestAuthor::query()->create(['name' => 'Alice']);
    $bob = TestAuthor::query()->create(['name' => 'Bob']);
    TestPost::query()->create(['title' => 'First', 'author_id' => $alice->id]);
    TestPost::query()->create(['title' => 'Second', 'author_id' => $bob->id]);

    $metadata = new TableQueryMetadata([
        new ResolvedTableQueryColumn('author', 'author.name', true, false),
    ]);
    $query = TestPost::query();

    app(TableSearchBuilder::class)->apply($query, $metadata, 'Bob');

    expect($query->pluck('title')->all())->toBe(['Second']);
});

it('uses custom search callbacks with parsed terms', function (): void {
    TestPost::query()->create(['title' => 'Visible', 'status' => 'published']);
    TestPost::query()->create(['title' => 'Hidden', 'status' => 'draft']);

    $query = TestPost::query();

    app(TableSearchBuilder::class)->apply(
        $query,
        new TableQueryMetadata([]),
        'published extra',
        static function (Builder $query, string $search, Collection $terms): void {
            expect($search)->toBe('published extra')
                ->and($terms->all())->toBe(['published', 'extra']);

            $query->where('status', $terms->first());
        },
    );

    expect($query->pluck('title')->all())->toBe(['Visible']);
});

it('does not change queries without searchable columns and invokes custom callbacks', function (): void {
    TestPost::query()->create(['title' => 'Laravel']);
    $builder = app(TableSearchBuilder::class);
    $query = TestPost::query();
    $builder->apply($query, new TableQueryMetadata([]), 'Laravel');

    $custom = TestPost::query();
    $builder->apply($custom, new TableQueryMetadata([
        new ResolvedTableQueryColumn('custom', 'title', true, false, static function (Builder $query, string $term): void {
            $query->where('title', 'like', $term.'%');
        }),
    ]), 'Laravel');

    expect($query->pluck('title')->all())->toBe(['Laravel'])
        ->and($custom->pluck('title')->all())->toBe(['Laravel']);
});
