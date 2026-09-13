<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableNavigation;
use Zonvoir\InertiaTable\TableQueryBuilder;
use Zonvoir\InertiaTable\TableRequest;
use Zonvoir\InertiaTable\TableState;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('creates a table payload', function (): void {
    expect(PostsTable::make()->payload())->toHaveKeys(['name', 'state', 'meta']);
});

it('infers names and supports aliases', function (): void {
    expect(PostsTable::make()->name())->toBe('posts')
        ->and(PostsTable::make()->named('archive')->name())->toBe('archive')
        ->and(PostsTable::make()->as('published')->id())->toBe('published');
});

it('normalizes searchable fields', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected array|string|null $search = [' title ', '', 'title', 123, 'status'];

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect($table->searchable())->toBe(['title', 'status']);
});

it('rejects invalid definitions and empty names', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return ['bad'];
        }
    };

    expect(fn () => PostsTable::make()->named(' '))->toThrow(InertiaTableException::class)
        ->and(fn () => $table->columnsDefinition())->toThrow(InertiaTableException::class);
});
it('exposes default table hooks and accessors', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected bool $selectable = false;

        protected ?bool $stickyHeader = true;

        protected ?string $rowSelectionKey = ' uuid ';

        protected bool $persistRowSelectionAcrossPages = true;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    expect(Table::class)->toBeString()
        ->and($table::create())->toBeInstanceOf($table::class)
        ->and($table->resource())->toBe(TestPost::class)
        ->and($table->transformModel($post, ['title' => 'Draft']))->toBe(['title' => 'Draft'])
        ->and($table->rowUrl($post, new Url()))->toBeNull()
        ->and($table->actions())->toBe([])
        ->and($table->exports())->toBe([])
        ->and($table->isSelectable($post))->toBeTrue()
        ->and($table->selectable())->toBeFalse()
        ->and($table->emptyState())->toBeNull()
        ->and($table->defaultSort())->toBeNull()
        ->and($table->stickyHeader())->toBeTrue()
        ->and($table->rowSelectionKey())->toBe('uuid')
        ->and($table->persistsRowSelectionAcrossPages())->toBeTrue()
        ->and($table->withQueryBuilder(app(TableQueryBuilder::class)))->toBeInstanceOf(TableQueryBuilder::class);
});

it('normalizes pagination query names and query string state', function (): void {
    $state = new TableState(
        page: 3,
        perPage: 50,
        cursor: 'abc',
        search: 'draft',
        sort: 'title',
        direction: Direction::DESCENDING,
        columns: ['headline', 'status'],
        sticky: ['headline'],
        hasStickyOverride: true,
    );

    $table = PostsTable::make()->named('archive');

    expect($table->pageName())->toBe('archive[page]')
        ->and($table->cursorName())->toBe('archive[cursor]')
        ->and($table->queryStringState($state))->toBe([
            'archive' => [
                'perPage' => 50,
                'search' => 'draft',
                'sort' => 'title',
                'direction' => 'desc',
                'columns' => ['headline', 'status'],
                'sticky' => ['headline'],
            ],
        ])
        ->and($table->queryStringState($state, includePage: true)['archive']['page'])->toBe(3);
});

it('builds state navigation definition results and array serialization from requests', function (): void {
    TestPost::query()->create(['title' => 'Alpha', 'status' => 'draft', 'votes' => 10]);
    TestPost::query()->create(['title' => 'Beta', 'status' => 'published', 'votes' => 5]);

    $table = PostsTable::make();
    $request = TableRequest::fromArray([
        'search' => 'Alpha',
        'sort' => 'title',
        'direction' => 'asc',
        'perPage' => 15,
    ]);

    expect($table->state($request)->search())->toBe('Alpha')
        ->and($table->stateFromRequest(Request::create('/posts', 'GET', ['search' => 'Beta']))->search())->toBe('Beta')
        ->and($table->navigation($request))->toBeInstanceOf(TableNavigation::class)
        ->and($table->payload($request))->toHaveKeys(['name', 'state', 'meta'])
        ->and($table->definition())->toHaveKeys(['name', 'state', 'meta'])
        ->and($table->apply(request: $request)->pluck('title')->all())->toBe(['Alpha'])
        ->and($table->paginate(request: $request)->count())->toBe(1)
        ->and($table->results(request: $request))->toHaveKeys(['results', 'pagination'])
        ->and($table->toArray())->toHaveKeys(['results', 'pagination'])
        ->and($table->jsonSerialize())->toBe($table->toArray());
});

it('normalizes action and export definitions', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }

        public function actions(): array
        {
            return [Action::make('Archive')];
        }

        public function exports(): array
        {
            return [Export::make('Download')];
        }
    };

    expect($table->columnsDefinition())->toHaveCount(1)
        ->and($table->actionsDefinition()[0]->keyName())->toBe('archive')
        ->and($table->exportsDefinition()[0]->keyName())->toBe('download');
});

it('covers table metadata and state edge cases', function (): void {
    $base = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected array|string|null $search = ' title ';

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };
    $actionOnly = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [];
        }

        public function actions(): array
        {
            return [Action::make('Run')];
        }
    };
    $exportOnly = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [];
        }

        public function exports(): array
        {
            return [Export::make('Download')];
        }
    };
    $contractState = new class () implements Zonvoir\InertiaTable\Contracts\TableState {
        public function toArray(): array
        {
            return ['perPage' => 15];
        }

        public function page(): int
        {
            return 1;
        }

        public function perPage(): int
        {
            return 15;
        }

        public function cursor(): ?string
        {
            return null;
        }

        public function search(): ?string
        {
            return null;
        }

        public function sort(): ?string
        {
            return null;
        }

        public function direction(): string
        {
            return 'asc';
        }

        public function columns(): array
        {
            return [];
        }

        public function sticky(): array
        {
            return [];
        }

        public function hasStickyOverride(): bool
        {
            return false;
        }
    };
    $contractTable = new class ($contractState) extends Table {
        protected ?string $resource = TestPost::class;

        public function __construct(private Zonvoir\InertiaTable\Contracts\TableState $configuredState)
        {
        }

        public function columns(): array
        {
            return [];
        }

        public function defaultState(): array|Zonvoir\InertiaTable\Contracts\TableState
        {
            return $this->configuredState;
        }
    };
    $blankSort = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?string $defaultSort = ' - ';

        public function columns(): array
        {
            return [];
        }
    };

    expect($base->meta())->not->toHaveKeys(['table', 'actionEndpoint', 'exportEndpoint'])
        ->and($actionOnly->meta())->toHaveKey('actionEndpoint')->not->toHaveKey('exportEndpoint')
        ->and($exportOnly->meta())->toHaveKey('exportEndpoint')->not->toHaveKey('actionEndpoint')
        ->and($base->searchable())->toBe(['title'])
        ->and($contractTable->state()->perPage())->toBe(15)
        ->and($blankSort->state()->sort())->toBeNull();
});

it('uses array default state and blank default sort values', function (): void {
    $arrayState = new class () extends Table {
        protected ?string $resource = TestPost::class;

        public function columns(): array
        {
            return [];
        }

        public function defaultState(): array|Zonvoir\InertiaTable\Contracts\TableState
        {
            return ['perPage' => 15, 'sort' => 'title'];
        }
    };
    $blankSort = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected ?string $defaultSort = '   ';

        public function columns(): array
        {
            return [];
        }
    };

    expect($arrayState->state()->sort())->toBe('title')
        ->and($blankSort->state()->sort())->toBeNull();
});
