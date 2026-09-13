<?php

declare(strict_types=1);

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableEmptyState;
use Zonvoir\InertiaTable\TablePayloadBuilder;
use Zonvoir\InertiaTable\TableState;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('builds the base table payload', function (): void {
    $payload = app(TablePayloadBuilder::class)->build(PostsTable::make(), new TableState(perPage: 30, sort: 'votes'));

    expect($payload)->toMatchArray([
        'name' => 'posts',
        'rowSelectionKey' => 'id',
        'selectable' => true,
        'persistRowSelectionAcrossPages' => false,
    ])
        ->and($payload['state'])->toMatchArray(['perPage' => 30, 'sort' => 'votes']);
});

it('serializes collection results into table rows', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft', 'status' => 'draft', 'votes' => 5]);

    $payload = app(TablePayloadBuilder::class)->buildResults(PostsTable::make(), new TableState(perPage: 30), new Collection([$post]));

    expect($payload['results'])->toHaveCount(1)
        ->and($payload['results'][0])->toMatchArray([
            'id' => $post->id,
            '_primary_key' => $post->id,
            'headline' => 'Draft',
            '_selectable' => true,
        ])
        ->and($payload['columns'])->not->toBeEmpty()
        ->and($payload['paginationType'])->toBe('full');
});

it('returns an empty result payload for unsupported result types', function (): void {
    expect(app(TablePayloadBuilder::class)->buildResults(PostsTable::make(), new TableState(perPage: 30), 'bad')['results'])->toBe([]);
});

it('serializes paginator, rows, URLs, images, and empty states across result types', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?string $rowSelectionKey = 'title';

        protected \Zonvoir\InertiaTable\TableEmptyState|array|false|null $emptyState = ['title' => 'Empty'];

        public function columns(): array
        {
            return [TextColumn::make('title')->url('/posts')->image(static fn (): string => '/image.png')];
        }

        public function rowUrl(Model $model, Url $url): Url
        {
            return $url->to('/rows/'.$model->getKey());
        }
    };
    $post = TestPost::query()->create(['title' => 'Draft']);
    $builder = app(TablePayloadBuilder::class);
    $state = new TableState(perPage: 15);
    $simple = Mockery::mock(Paginator::class);
    $simple->shouldReceive('toArray')->andReturn(['data' => []]);
    $simple->shouldReceive('items')->andReturn([$post]);
    $simple->shouldReceive('onFirstPage')->andReturn(true);
    $simple->shouldReceive('hasMorePages')->andReturn(false);
    $arrayRows = $builder->buildResults($table, $state, new Collection([['id' => 5, 'title' => 'Array row']]));
    $modelRows = $builder->buildResults($table, $state, new Collection([$post]));
    $paginationType = new ReflectionMethod($builder, 'paginationType');
    $serializeUrl = new ReflectionMethod($builder, 'serializeUrl');
    $emptyTable = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected \Zonvoir\InertiaTable\TableEmptyState|array|false|null $emptyState;

        public function __construct()
        {
            $this->emptyState = TableEmptyState::make('No posts');
        }

        public function columns(): array
        {
            return [];
        }
    };

    expect($builder->buildResults($table, $state, $simple)['results']['on_last_page'])->toBeTrue()
        ->and($arrayRows['results'][0])->toMatchArray(['_primary_key' => 5, 'title' => 'Array row', '_actions' => []])
        ->and($modelRows['results'][0]['_url'])->toBe(['url' => '/rows/'.$post->id, 'target' => null])
        ->and($modelRows['results'][0]['_column_urls'])->toBe(['title' => '/posts'])
        ->and($modelRows['results'][0]['_column_images']['title']['url'])->toBe('/image.png')
        ->and($paginationType->invoke($builder, PaginationType::Simple))->toBe('simple')
        ->and($serializeUrl->invoke($builder, ['/x']))->toBe(['/x'])
        ->and($builder->buildResults($emptyTable, $state, new Collection())['emptyState'])->toMatchArray(['title' => 'No posts'])
        ->and($builder->buildResults($table, $state, new Collection())['emptyState'])->toBe(['title' => 'Empty']);
});
