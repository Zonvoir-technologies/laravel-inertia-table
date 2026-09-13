<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Facades\Excel;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Exports\TableExcelExport;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\Tests\Fixtures\ExportPostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('rejects invalid export table classes', function (): void {
    $this->postJson('/zonvoir-table/exports', ['table' => TestPost::class])->assertStatus(422);
});

it('returns not found for missing exports', function (): void {
    $this->postJson('/zonvoir-table/exports', [
        'table' => ExportPostsTable::class,
        'export' => 'missing',
    ])->assertNotFound();
});

it('downloads matching exports', function (): void {
    Excel::fake();
    TestPost::query()->create(['title' => 'Draft']);

    $this->post('/zonvoir-table/exports', [
        'table' => ExportPostsTable::class,
        'export' => 'filtered',
    ])->assertOk();

    Excel::assertDownloaded('export.xlsx');
});

function bindControllerExport(Export $export, ?string $order = null, ?string $selectionKey = 'id'): string
{
    $table = new class ($export, $order, $selectionKey) extends Table {
        public function __construct(private Export $definition, private ?string $order, ?string $selectionKey)
        {
            $this->rowSelectionKey = $selectionKey;
        }

        public function query(): Builder
        {
            $query = TestPost::query();

            return $this->order === null ? $query : $query->orderBy($this->order, 'desc');
        }

        public function columns(): array
        {
            return ExportPostsTable::make()->columns();
        }

        public function exports(): array
        {
            return [$this->definition];
        }
    };

    app()->instance($table::class, $table);

    return $table::class;
}

it('rejects unauthorized exports before execution', function (): void {
    Excel::swap(Mockery::mock(\Maatwebsite\Excel\Excel::class));
    Excel::shouldReceive('download')->never();
    $table = bindControllerExport(Export::make('Denied')->authorize(false));

    $this->postJson('/zonvoir-table/exports', ['table' => $table, 'export' => 'denied'])->assertForbidden();
});

it('queues exports and passes the job to the callback', function (): void {
    $job = Mockery::mock(\Illuminate\Bus\PendingBatch::class);
    $received = null;
    $export = Export::make('Queued')->queue('queued.xlsx', 'local', function ($value) use (&$received): void {
        $received = $value;
    });
    Excel::swap(Mockery::mock(\Maatwebsite\Excel\Excel::class));
    Excel::shouldReceive('queue')->once()->with(Mockery::type(TableExcelExport::class), 'queued.xlsx', 'local', 'Xlsx')->andReturn($job);

    $this->postJson('/zonvoir-table/exports', [
        'table' => bindControllerExport($export), 'export' => 'queued',
    ])->assertOk()->assertExactJson([
        'ok' => true, 'status' => 'processing', 'export' => 'queued', 'message' => 'Export is being processed.',
    ]);

    expect($received)->toBe($job);
});

it('stores exports and returns the appropriate processing response', function (bool $inertia): void {
    $export = Export::make('Stored')->filename('stored.xlsx')->asDownload(false)->redirect('/exports');
    Excel::swap(Mockery::mock(\Maatwebsite\Excel\Excel::class));
    Excel::shouldReceive('store')->once()->with(Mockery::type(TableExcelExport::class), 'stored.xlsx', null, 'Xlsx')->andReturn(true);

    $response = $this->postJson('/zonvoir-table/exports', [
        'table' => bindControllerExport($export), 'export' => 'stored',
    ], $inertia ? ['X-Inertia' => 'true'] : []);

    $payload = ['ok' => true, 'status' => 'processing', 'export' => 'stored', 'message' => 'Export is being processed.'];

    if ($inertia) {
        $response->assertRedirect('/exports')->assertSessionHas('table_export', $payload);
    } else {
        $response->assertOk()->assertExactJson($payload);
    }
})->with([false, true]);

it('falls back to downloading when a custom exporter returns null', function (): void {
    Excel::fake();
    $table = bindControllerExport(Export::make('Fallback')->using(static fn () => null));

    $this->postJson('/zonvoir-table/exports', ['table' => $table, 'export' => 'fallback'])->assertOk();

    Excel::assertDownloaded('export.xlsx');
});

it('gives custom exporters only selected rows including an empty selection', function (array $keys, ?string $selectionKey, array $expected): void {
    TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);
    Excel::swap(Mockery::mock(\Maatwebsite\Excel\Excel::class));
    Excel::shouldReceive('download')->never();
    $export = Export::make('Selected')->limitToSelectedRows()->using(
        static fn ($table, $export, $request, $query) => response()->json($query->pluck('title')->all()),
    );

    $this->postJson('/zonvoir-table/exports', [
        'table' => bindControllerExport($export, selectionKey: $selectionKey), 'export' => 'selected', 'keys' => $keys,
    ])->assertOk()->assertExactJson($expected);
})->with([
    'selected primary key' => [[2], 'id', ['Second']],
    'model key fallback' => [[2], null, ['Second']],
    'custom selection key' => [['Second'], 'title', ['Second']],
    'empty selection' => [[], 'id', []],
]);

it('provides deterministic export ordering without duplicating primary key orders', function (?string $order, array $expectedOrders, array $expectedIds): void {
    TestPost::query()->create(['title' => 'Same']);
    TestPost::query()->create(['title' => 'Same']);
    TestPost::query()->create(['title' => 'Last']);
    $export = Export::make('Ordered')->using(
        static function ($table, $export, $request, $query) use ($expectedOrders) {
            expect($query->getQuery()->orders)->toBe($expectedOrders);

            return response()->json($query->pluck('id')->all());
        },
    );

    $this->postJson('/zonvoir-table/exports', [
        'table' => bindControllerExport($export, $order), 'export' => 'ordered',
    ])->assertOk()->assertExactJson($expectedIds);
})->with([
    'default' => [null, [['column' => 'zonvoir_test_posts.id', 'direction' => 'asc']], [1, 2, 3]],
    'primary key' => ['id', [['column' => 'id', 'direction' => 'desc']], [3, 2, 1]],
    'qualified key' => ['zonvoir_test_posts.id', [['column' => 'zonvoir_test_posts.id', 'direction' => 'desc']], [3, 2, 1]],
    'tie breaker' => ['title', [['column' => 'title', 'direction' => 'desc'], ['column' => 'zonvoir_test_posts.id', 'direction' => 'asc']], [1, 2, 3]],
]);

it('applies requested filters to the custom exporter query', function (): void {
    TestPost::query()->create(['title' => 'Laravel']);
    TestPost::query()->create(['title' => 'PHP']);
    $export = Export::make('Filtered')->limitToFilteredRows()->using(
        static fn ($table, $export, $request, $query) => response()->json($query->pluck('title')->all()),
    );

    $this->postJson('/zonvoir-table/exports', [
        'table' => bindControllerExport($export), 'export' => 'filtered', 'state' => ['search' => 'Laravel'],
    ])->assertOk()->assertExactJson(['Laravel']);
});
