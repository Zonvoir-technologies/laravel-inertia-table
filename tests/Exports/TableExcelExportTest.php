<?php

declare(strict_types=1);

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Exports\TableExcelExport;
use Zonvoir\InertiaTable\Tests\Fixtures\ExportPostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('serializes and unserializes export job state', function (): void {
    $export = new TableExcelExport(ExportPostsTable::class, 'posts', ['search' => 'draft'], [1, '2']);
    $data = $export->__serialize();

    $restored = new TableExcelExport(ExportPostsTable::class, 'other');
    $restored->__unserialize($data);

    expect($restored->__serialize())->toBe($data);
});

it('builds headings maps rows and column formatting from exportable columns', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft', 'status' => 'draft', 'votes' => 10]);
    $export = new TableExcelExport(ExportPostsTable::class, 'posts');

    expect($export->headings())->toBe(['Title', 'Status'])
        ->and($export->map($post))->toBe(['Draft', 'DRAFT'])
        ->and($export->columnFormats())->toBe(['A' => '@']);
});

it('returns styles for columns that define export styles', function (): void {
    $sheet = new Worksheet();

    expect((new TableExcelExport(ExportPostsTable::class, 'posts'))->styles($sheet))->toBe([
        'A' => ['font' => ['bold' => true]],
    ]);
});

it('limits export queries to selected keys', function (): void {
    $first = TestPost::query()->create(['title' => 'First']);
    TestPost::query()->create(['title' => 'Second']);

    $export = new TableExcelExport(ExportPostsTable::class, 'posts', [], [$first->id]);

    expect($export->query()->pluck('title')->all())->toBe(['First']);
});

it('returns no rows when selected export has no selected keys', function (): void {
    TestPost::query()->create(['title' => 'First']);

    expect((new TableExcelExport(ExportPostsTable::class, 'posts'))->query()->pluck('title')->all())->toBe([]);
});

it('limits export queries to filtered rows', function (): void {
    TestPost::query()->create(['title' => 'Laravel']);
    TestPost::query()->create(['title' => 'PHP']);

    $export = new TableExcelExport(ExportPostsTable::class, 'filtered', ['search' => 'Laravel']);

    expect($export->query()->pluck('title')->all())->toBe(['Laravel']);
});

it('registers export events and rejects missing exports', function (): void {
    expect((new TableExcelExport(ExportPostsTable::class, 'posts'))->registerEvents())->toBe(['after' => 'listener'])
        ->and(fn () => (new TableExcelExport(ExportPostsTable::class, 'missing'))->registerEvents())->toThrow(\RuntimeException::class);
});

it('can be created from an export request', function (): void {
    $table = ExportPostsTable::make();
    $export = $table->exportsDefinition()[0];
    $request = ExportRequest::fromRequest(request()->create('/exports', 'POST', [
        'state' => ['search' => 'Draft'],
        'keys' => [1],
    ]));

    expect(TableExcelExport::fromRequest($table, $export, $request)->__serialize())->toMatchArray([
        'tableClass' => ExportPostsTable::class,
        'exportKey' => 'posts',
        'tableRequestInput' => ['search' => 'Draft'],
        'selectedKeys' => [1],
    ]);
});

it('reuses a resolved export and respects existing export query orders', function (): void {
    TestPost::query()->create(['title' => 'First']);
    $export = new TableExcelExport(ExportPostsTable::class, 'posts');
    $export->query();
    expect($export->query()->pluck('title')->all())->toBe([]);

    $method = new \ReflectionMethod($export, 'ensureDeterministicOrder');
    $query = TestPost::query()->orderBy('id', 'desc');
    $method->invoke($export, $query);
    expect($query->getQuery()->orders)->toBe([['column' => 'id', 'direction' => 'desc']]);
});
