<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Http\Controllers\ActionController;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('rejects invalid action table classes', function (): void {
    $this->postJson('/zonvoir-table/actions', ['table' => TestPost::class])->assertStatus(422);
});

it('returns not found for missing actions', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    $this->postJson('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'missing',
        'keys' => [$post->id],
    ])->assertNotFound();
});

it('returns inertia flash responses for action requests', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft', 'status' => 'draft']);

    $this->withHeader('X-Inertia', 'true')->post('/zonvoir-table/actions', [
        'table' => PostsTable::class,
        'action' => 'publish',
        'keys' => [$post->id],
    ])->assertRedirect();

    expect(session('table_action'))->toMatchArray([
        'ok' => true,
        'action' => 'publish',
        'processed' => 1,
    ]);
});

function bindControllerAction(Action $action): string
{
    $table = new class ($action) extends Table {
        public function __construct(private Action $definition)
        {
            $this->resource = TestPost::class;
        }

        public function columns(): array
        {
            return [];
        }

        public function actions(): array
        {
            return [$this->definition];
        }
    };

    app()->instance($table::class, $table);

    return $table::class;
}

it('returns custom JSON error responses when action handlers fail', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $action = Action::make('Failing')
        ->handle(static function (): never {
            throw new RuntimeException('Database is unavailable');
        })
        ->error(static fn (Throwable $exception, array $payload): array => [
            ...$payload,
            'message' => 'Try again later.',
            'exception' => $exception::class,
        ]);

    $this->postJson('/zonvoir-table/actions', [
        'table' => bindControllerAction($action),
        'action' => 'failing',
        'keys' => [$post->id],
    ])->assertStatus(500)->assertExactJson([
        'ok' => false,
        'status' => 'error',
        'action' => 'failing',
        'processed' => 0,
        'skipped' => 0,
        'message' => 'Try again later.',
        'exception' => RuntimeException::class,
    ]);
});

it('returns validation exceptions unchanged when action handlers throw them', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $action = Action::make('Restricted')->handle(static function (): never {
        abort(418, 'Teapot');
    });

    $this->postJson('/zonvoir-table/actions', [
        'table' => bindControllerAction($action),
        'action' => 'restricted',
        'keys' => [$post->id],
    ])->assertStatus(418)->assertSee('Teapot');
});

it('returns inertia validation errors when action handlers fail', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $action = Action::make('Failing')
        ->handle(static function (): never {
            throw new RuntimeException('Ignored original error');
        })
        ->error(static fn (): array => ['message' => 'Unable to publish this post.']);

    $this->withHeader('X-Inertia', 'true')->post('/zonvoir-table/actions', [
        'table' => bindControllerAction($action),
        'action' => 'failing',
        'keys' => [$post->id],
    ])->assertRedirect()->assertSessionHasErrors([
        'table_action' => 'Unable to publish this post.',
    ]);
});

it('ignores empty chunks when executing all selected records', function (): void {
    $controller = new ActionController();
    $table = new class () extends Table {
        public function columns(): array
        {
            return [];
        }
    };
    $query = Mockery::mock(Builder::class);
    $query->shouldReceive('chunk')->once()->with(100, Mockery::type(Closure::class))->andReturnUsing(
        static function (int $size, Closure $callback): void {
            $callback([]);
        },
    );
    $table = new class ($query) extends Table {
        public function __construct(private Builder $builder)
        {
        }

        public function columns(): array
        {
            return [];
        }

        public function query(): Builder
        {
            return $this->builder;
        }
    };
    $action = Action::make('Empty')->asBulkAction(strategy: 'chunk')->handle(static fn (): null => null);
    $results = [];
    $processed = 0;
    $skipped = 0;
    $method = new ReflectionMethod($controller, 'executeAllModels');

    expect($method->invokeArgs($controller, [$table, $action, &$results, &$processed, &$skipped]))->toBeFalse()
        ->and($results)->toBe([])
        ->and($processed)->toBe(0)
        ->and($skipped)->toBe(0);
});
