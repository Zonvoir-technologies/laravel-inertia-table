<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('serializes table configuration and default state', function (): void {
    $payload = PostsTable::make()->payload();

    expect($payload['name'])->toBe('posts')
        ->and($payload['state'])->toBe([
            'page' => 1,
            'perPage' => 30,
            'cursor' => null,
            'search' => null,
            'sort' => 'votes',
            'direction' => 'desc',
        ])
        ->and($payload['rowSelectionKey'])->toBe('id')
        ->and($payload['selectable'])->toBeTrue()
        ->and($payload['persistRowSelectionAcrossPages'])->toBeFalse();

    $meta = $payload['meta'];

    expect($meta['table'])->toBe(PostsTable::class)
        ->and($meta['actionEndpoint'])->toBe('/zonvoir-table/actions')
        ->and($meta)->not->toHaveKey('exportEndpoint')
        ->and($meta['columns'][0]['key'])->toBe('headline')
        ->and($meta['columns'][0]['label'])->toBe('Headline')
        ->and($meta['columns'][0]['sortable'])->toBeTrue()
        ->and($meta['columns'][0]['searchable'])->toBeTrue()
        ->and($meta['columns'][0]['sticky'])->toBeTrue()
        ->and($meta['columns'][0]['width'])->toBe(240)
        ->and($meta['columns'][0]['labelClass'])->toBe('font-semibold')
        ->and($meta['columns'][0]['cellClass'])->toBe('text-slate-900')
        ->and($meta['columns'][0]['tooltip'])->toBe('Post title')
        ->and($meta['pagination'])->toBe([
            'enabled' => true,
            'type' => 'standard',
            'defaultPerPage' => 30,
            'perPageOptions' => [15, 30, 50],
            'scrollToTop' => true,
        ])
        ->and($meta['queryString'])->toBe([
            'namespace' => null,
            'page' => 'page',
            'perPage' => 'perPage',
            'cursor' => 'cursor',
            'search' => 'search',
            'sort' => 'sort',
            'direction' => 'direction',
            'columns' => 'columns',
            'sticky' => 'sticky',
        ]);
});

it('merges named request state and preserves column and sticky preferences', function (): void {
    $table = PostsTable::make()->named('archive');
    $request = TableRequest::fromArray([
        'archive' => [
            'page' => '2',
            'perPage' => '50',
            'search' => '  laravel  ',
            'sort' => ['column' => 'headline', 'direction' => 'DESC'],
            'columns' => ['headline', 'votes', 'headline', '', 123],
            'sticky' => ['author', 'author', ' '],
        ],
    ]);

    $state = $table->state($request);

    expect($state->page())->toBe(2)
        ->and($state->perPage())->toBe(50)
        ->and($state->search())->toBe('laravel')
        ->and($state->sort())->toBe('headline')
        ->and($state->direction())->toBe('desc')
        ->and($state->columns())->toBe(['headline', 'votes'])
        ->and($state->sticky())->toBe(['author'])
        ->and($state->hasStickyOverride())->toBeTrue()
        ->and($table->queryStringState($state, includePage: true))->toBe([
            'archive' => [
                'page' => 2,
                'perPage' => 50,
                'search' => 'laravel',
                'sort' => 'headline',
                'direction' => 'desc',
                'columns' => ['headline', 'votes'],
                'sticky' => ['author'],
            ],
        ]);
});

it('reflects hidden column visibility and sticky state in the results payload', function (): void {
    TestPost::query()->create(['title' => 'Draft', 'status' => 'draft', 'votes' => 10]);

    $payload = PostsTable::make()->results(request: TableRequest::fromArray([
        'columns' => ['headline', 'votes'],
        'sticky' => ['votes'],
    ]));

    expect($payload['state']['columns'])->toBe([
        'headline' => false,
        'status' => false,
        'votes' => false,
        'author' => true,
    ])
        ->and($payload['state']['sticky'])->toBe(['votes'])
        ->and(array_column($payload['columns'], 'attribute'))->toBe(['headline', 'status', 'votes', 'author']);
});

it('rejects empty table names', function (): void {
    PostsTable::make()->named('   ');
})->throws(InertiaTableException::class, 'Table name cannot be empty.');

it('rejects invalid column definitions', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return ['not a column'];
        }
    };

    $table->columnsDefinition();
})->throws(InertiaTableException::class, 'expects columns definitions');

it('rejects missing or invalid resources', function (): void {
    $missingResourceTable = new class () extends Table {
        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    $invalidResourceTable = new class () extends Table {
        protected ?string $resource = 'not-a-model';

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect(fn () => $missingResourceTable->query())
        ->toThrow(InertiaTableException::class, 'does not define a resource')
        ->and(fn () => $invalidResourceTable->query())
        ->toThrow(InertiaTableException::class, 'resource must be an Eloquent builder or model class-string');
});

it('clones resource builders before applying them', function (): void {
    TestPost::query()->create(['title' => 'Visible', 'status' => 'published']);
    TestPost::query()->create(['title' => 'Hidden', 'status' => 'draft']);

    $baseQuery = TestPost::query()->where('status', 'published');
    $table = new class ($baseQuery) extends Table {
        public function __construct(private readonly Builder $builder)
        {
        }

        public function resource(): Builder
        {
            return $this->builder;
        }

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->query()->pluck('title')->all())->toBe(['Visible'])
        ->and($baseQuery->pluck('title')->all())->toBe(['Visible']);
});

it('resolves pagination from configuration when table properties are not defined', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => 25,
        'zonvoir-table.pagination.per_page_options' => [10, 25, 50],
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(25)
        ->and($table->pagination()->perPageOptions())->toBe([10, 25, 50]);
});

it('allows table properties defaultPerPage and perPageOptions to override configuration', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => 25,
        'zonvoir-table.pagination.per_page_options' => [10, 25, 50],
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?int $defaultPerPage = 40;

        protected ?array $perPageOptions = [20, 40, 80];

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(40)
        ->and($table->pagination()->perPageOptions())->toBe([20, 40, 80]);
});

it('resolves pagination when only defaultPerPage is defined on table', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => 15,
        'zonvoir-table.pagination.per_page_options' => [10, 20, 30],
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?int $defaultPerPage = 20;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(20)
        ->and($table->pagination()->perPageOptions())->toBe([10, 20, 30]);
});

it('auto-includes defaultPerPage in perPageOptions when perPageOptions is not defined on table', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => 15,
        'zonvoir-table.pagination.per_page_options' => [15, 30, 50],
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?int $defaultPerPage = 25;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(25)
        ->and($table->pagination()->perPageOptions())->toBe([15, 25, 30, 50]);
});

it('resolves pagination when only perPageOptions is defined on table', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => 20,
        'zonvoir-table.pagination.per_page_options' => [10, 20, 30],
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?array $perPageOptions = [20, 50, 100];

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(20)
        ->and($table->pagination()->perPageOptions())->toBe([20, 50, 100]);
});

it('falls back to defaults when config values are missing or null', function (): void {
    config([
        'zonvoir-table.pagination.default_per_page' => null,
        'zonvoir-table.pagination.per_page_options' => null,
    ]);

    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->pagination()->defaultPerPage())->toBe(15)
        ->and($table->pagination()->perPageOptions())->toBe([15, 30, 50, 100]);
});
