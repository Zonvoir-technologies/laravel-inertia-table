<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\TableRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\DefaultSearchPostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestAuthor;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('matches plain and related columns during search', function (): void {
    [$alice, $bob] = createAuthors();
    createPost('Laravel tables', 'published', 10, $alice->id);
    createPost('Plain PHP', 'draft', 20, $bob->id);
    createPost('Vue table', 'archived', 30, $alice->id);

    $table = DefaultSearchPostsTable::make();

    expect($table->apply(request: TableRequest::fromArray(['search' => 'Laravel']))->pluck('title')->all())
        ->toBe(['Laravel tables'])
        ->and($table->apply(request: TableRequest::fromArray(['search' => 'Bob']))->pluck('title')->all())
        ->toBe(['Plain PHP']);
});

it('parses quoted search terms and requires every term to match', function (): void {
    [$alice] = createAuthors();
    createPost('Alpha Beta', 'published', 10, $alice->id);
    createPost('Alpha Gamma', 'draft', 20, $alice->id);

    $results = DefaultSearchPostsTable::make()
        ->apply(request: TableRequest::fromArray(['search' => '"Alpha Beta" Alice']))
        ->pluck('title')
        ->all();

    expect($results)->toBe(['Alpha Beta']);
});

it('uses table level custom search instead of default search columns', function (): void {
    [$alice] = createAuthors();
    createPost('Matches title', 'published', 10);
    createPost('Different', 'draft', 20, $alice->id);

    $results = PostsTable::make()
        ->apply(request: TableRequest::fromArray(['search' => 'Alice']))
        ->pluck('title')
        ->all();

    expect($results)->toBe([]);
});

it('applies default simple and related column sorting', function (): void {
    [$alice, $bob] = createAuthors();
    createPost('Middle', 'published', 20, $bob->id);
    createPost('Highest', 'published', 40, $alice->id);
    createPost('Lowest', 'draft', 10, $bob->id);

    expect(PostsTable::make()->apply()->pluck('title')->all())
        ->toBe(['Highest', 'Middle', 'Lowest'])
        ->and(DefaultSearchPostsTable::make()
            ->apply(request: TableRequest::fromArray(['sort' => 'title', 'direction' => 'desc']))
            ->pluck('title')
            ->all())
        ->toBe(['Middle', 'Lowest', 'Highest'])
        ->and(DefaultSearchPostsTable::make()
            ->apply(request: TableRequest::fromArray(['sort' => 'author', 'direction' => 'asc']))
            ->pluck('title')
            ->all())
        ->toBe(['Highest', 'Middle', 'Lowest']);
});

it('ignores invalid sort and blank search without changing the base query', function (): void {
    createPost('First', 'draft', 1);
    createPost('Second', 'published', 2);

    $titles = DefaultSearchPostsTable::make()
        ->apply(request: TableRequest::fromArray(['search' => '  ', 'sort' => 'status', 'direction' => 'desc']))
        ->pluck('title')
        ->all();

    expect($titles)->toBe(['First', 'Second']);
});

it('serializes rows actions selection and pagination in the results payload', function (): void {
    createPost('Draft', 'draft', 5);
    createPost('Archived', 'archived', 100);

    $payload = PostsTable::make()->results(request: TableRequest::fromArray(['perPage' => 15]));

    expect($payload['pagination'])->toBeTrue()
        ->and($payload['paginationType'])->toBe('full')
        ->and($payload['state']['perPage'])->toBe(15)
        ->and($payload['hasActions'])->toBeTrue()
        ->and($payload['hasBulkActions'])->toBeTrue()
        ->and($payload['hasExports'])->toBeFalse()
        ->and($payload['hasSearch'])->toBeTrue()
        ->and($payload['hasFilters'])->toBeFalse()
        ->and($payload['state']['sticky'])->toBe(['headline'])
        ->and($payload['results']['data'])->toHaveCount(2);

    $firstRow = $payload['results']['data'][0];

    expect($firstRow['headline'])->toBe('Archived')
        ->and($firstRow['votes'])->toBe('100')
        ->and($firstRow['_selectable'])->toBeFalse()
        ->and($firstRow['_url']['url'])->toBe('/posts/' . $firstRow['id'])
        ->and($firstRow['_url']['preserveScroll'])->toBeTrue()
        ->and(array_column($payload['actions'], 'key'))->toBe(['publish'])
        ->and(array_column($firstRow['_actions'], 'key'))->toBe(['publish', 'view']);
});

it('executes selected records through the action endpoint and skips unselectable rows', function (): void {
    PostsTable::resetActionLog();

    $draft = createPost('Draft', 'draft', 10);
    $archived = createPost('Archived', 'archived', 20);

    $response = $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'publish',
        'keys' => [$draft->id, $archived->id],
    ]);

    $response
        ->assertOk()
        ->assertJson([
            'ok' => true,
            'status' => 'success',
            'action' => 'publish',
            'processed' => 1,
            'skipped' => 1,
            'results' => [$draft->id],
        ]);

    expect(PostsTable::$handled)->toBe([$draft->id])
        ->and(PostsTable::$before)->toBe([[$draft->id, $archived->id]])
        ->and(PostsTable::$after)->toBe([
            [
                'models' => [$draft->id, $archived->id],
                'results' => [$draft->id],
            ],
        ]);
});

it('executes all records through the action endpoint in chunks', function (): void {
    PostsTable::resetActionLog();

    $first = createPost('First', 'draft', 10);
    $second = createPost('Second', 'published', 20);
    $archived = createPost('Archived', 'archived', 30);

    $response = $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'publish',
        'selectionMode' => 'all',
    ]);

    $response
        ->assertOk()
        ->assertJson([
            'ok' => true,
            'processed' => 2,
            'skipped' => 1,
            'results' => [$first->id, $second->id],
        ]);

    expect(PostsTable::$handled)->toBe([$first->id, $second->id])
        ->and(PostsTable::$before)->toBe([[$first->id, $second->id], [$archived->id]])
        ->and(PostsTable::$after)->toBe([
            ['models' => [$first->id, $second->id], 'results' => [$first->id, $second->id]],
            ['models' => [$archived->id], 'results' => []],
        ]);
});

it('validates invalid tables actions and non bulk action requests', function (): void {
    $post = createPost('Draft', 'draft', 10);

    $this->postJson('/zonvoir-table/actions', [
        'table' => TestPost::class,
        'action' => 'publish',
        'keys' => [$post->id],
    ])->assertStatus(422);

    $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'missing',
        'keys' => [$post->id],
    ])->assertNotFound();

    $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'view',
        'keys' => [$post->id],
    ])->assertNotFound();

    $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'view',
        'keys' => [$post->id, $post->id + 1],
    ])->assertNotFound();
});

it('has a basic performance baseline for core results serialization', function (): void {
    for ($i = 1; $i <= 200; $i++) {
        createPost('Post ' . $i, $i % 2 === 0 ? 'published' : 'draft', $i);
    }

    $startedAt = microtime(true);
    $payload = PostsTable::make()->results(request: TableRequest::fromArray(['perPage' => 50]));
    $elapsed = microtime(true) - $startedAt;

    expect($payload['results']['data'])->toHaveCount(50)
        ->and($elapsed)->toBeLessThan(2.0);
});

/**
 * @return array{0: TestAuthor, 1: TestAuthor}
 */
function createAuthors(): array
{
    return [
        TestAuthor::query()->create(['name' => 'Alice']),
        TestAuthor::query()->create(['name' => 'Bob']),
    ];
}

function createPost(string $title, string $status, int $votes, ?int $authorId = null): TestPost
{
    return TestPost::query()->create([
        'title' => $title,
        'status' => $status,
        'votes' => $votes,
        'author_id' => $authorId,
    ]);
}
