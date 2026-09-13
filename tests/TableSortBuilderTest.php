<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Zonvoir\InertiaTable\ResolvedTableQueryColumn;
use Zonvoir\InertiaTable\TableQueryMetadata;
use Zonvoir\InertiaTable\TableSortBuilder;
use Zonvoir\InertiaTable\Tests\Fixtures\TestAuthor;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('does not change queries for invalid sort keys', function (): void {
    TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);

    $query = TestPost::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([]), 'missing', 'desc');

    expect($query->pluck('title')->all())->toBe(['First', 'Second']);
});

it('sorts by plain sortable columns', function (): void {
    TestPost::query()->create(['title' => 'B']);
    TestPost::query()->create(['title' => 'A']);

    $query = TestPost::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('title', 'title', false, true),
    ]), 'title', 'asc');

    expect($query->pluck('title')->all())->toBe(['A', 'B']);
});

it('sorts by relation fields with joins', function (): void {
    $bob = TestAuthor::query()->create(['name' => 'Bob']);
    $alice = TestAuthor::query()->create(['name' => 'Alice']);
    TestPost::query()->create(['title' => 'Second', 'author_id' => $bob->id]);
    TestPost::query()->create(['title' => 'First', 'author_id' => $alice->id]);

    $query = TestPost::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('author', 'author.name', false, true),
    ]), 'author', 'asc');

    expect($query->pluck('title')->all())->toBe(['First', 'Second']);
});

it('uses custom sort callbacks', function (): void {
    TestPost::query()->create(['title' => 'B', 'votes' => 10]);
    TestPost::query()->create(['title' => 'A', 'votes' => 20]);

    $query = TestPost::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('custom', 'votes', false, true, null, static function (Builder $query, string $direction): void {
            $query->orderBy('votes', $direction);
        }),
    ]), 'custom', 'desc');

    expect($query->pluck('title')->all())->toBe(['A', 'B']);
});

it('leaves queries unchanged when a relation sort cannot be resolved safely', function (string $field): void {
    TestPost::query()->create(['title' => 'Existing']);
    $query = TestPost::query()->select('zonvoir_test_posts.title')->where('votes', '>=', 0)->orderBy('title');
    $sql = $query->toSql();
    $bindings = $query->getBindings();

    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('relation', $field, false, true),
    ]), 'relation', 'desc');

    expect($query->toSql())->toBe($sql)
        ->and($query->getBindings())->toBe($bindings)
        ->and($query->pluck('title')->all())->toBe(['Existing']);
})->with([
    'unsafe column' => 'author.name; DROP TABLE users',
    'unsafe relation' => 'author-name.name',
    'missing relation' => 'missing.name',
    'method returning a non-relation' => 'getTable.name',
    'missing nested relation' => 'author.missing.name',
    'unsafe nested segment' => 'author.bad-name.title',
]);

it('sorts through has-many relations while retaining authors without posts', function (): void {
    $first = TestAuthor::query()->create(['name' => 'First']);
    $second = TestAuthor::query()->create(['name' => 'Second']);
    $empty = TestAuthor::query()->create(['name' => 'No posts']);
    TestPost::query()->create(['title' => 'Alpha', 'author_id' => $first->id]);
    TestPost::query()->create(['title' => 'Zulu', 'author_id' => $second->id]);

    $query = TestAuthor::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('post', 'posts.title', false, true),
    ]), 'post', 'desc');

    expect($query->get()->modelKeys())->toBe([$second->id, $first->id, $empty->id])
        ->and($query->getQuery()->columns)->toBe(['zonvoir_test_authors.*']);
});

it('sorts through has-one relations without replacing an explicit select', function (): void {
    $first = TestAuthor::query()->create(['name' => 'First']);
    $second = TestAuthor::query()->create(['name' => 'Second']);
    TestPost::query()->create(['title' => 'Zulu', 'author_id' => $first->id]);
    TestPost::query()->create(['title' => 'Alpha', 'author_id' => $second->id]);

    $model = new class () extends Model {
        protected $table = 'zonvoir_test_authors';

        public function post(): HasOne
        {
            return $this->hasOne(TestPost::class, 'author_id');
        }
    };
    $query = $model->newQuery()->select('zonvoir_test_authors.id', 'zonvoir_test_authors.name');
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('post', 'post.title', false, true),
    ]), 'post', 'asc');

    expect($query->get()->modelKeys())->toBe([$second->id, $first->id])
        ->and($query->getQuery()->columns)->toBe(['zonvoir_test_authors.id', 'zonvoir_test_authors.name']);
});

it('sorts through nested relations using distinct join aliases', function (): void {
    $bob = TestAuthor::query()->create(['name' => 'Bob']);
    $alice = TestAuthor::query()->create(['name' => 'Alice']);
    $second = TestPost::query()->create(['title' => 'Second', 'author_id' => $bob->id]);
    $first = TestPost::query()->create(['title' => 'First', 'author_id' => $alice->id]);

    $query = TestPost::query();
    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('nested', 'author.posts.author.name', false, true),
    ]), 'nested', 'asc');

    expect($query->get()->modelKeys())->toBe([$first->id, $second->id])
        ->and(array_column($query->getQuery()->joins, 'table'))->toBe([
            'zonvoir_test_authors as zonvoir_sort_author',
            'zonvoir_test_posts as zonvoir_sort_author_posts',
            'zonvoir_test_authors as zonvoir_sort_author_posts_author',
        ]);
});

it('ignores unsupported relation types without adding partial joins', function (): void {
    $model = new class () extends Model {
        protected $table = 'zonvoir_test_posts';

        public function authors(): BelongsToMany
        {
            return $this->belongsToMany(TestAuthor::class, 'unused_pivot', 'post_id', 'author_id');
        }
    };
    TestPost::query()->create(['title' => 'Existing']);
    $query = $model->newQuery();
    $sql = $query->toSql();

    app(TableSortBuilder::class)->apply($query, new TableQueryMetadata([
        new ResolvedTableQueryColumn('unsupported', 'authors.name', false, true),
    ]), 'unsupported', 'asc');

    expect($query->toSql())->toBe($sql)
        ->and($query->pluck('title')->all())->toBe(['Existing']);
});
