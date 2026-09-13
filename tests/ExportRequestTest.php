<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;

it('reads export request values from request input', function (): void {
    $request = Request::create('/exports', 'POST', [
        'table' => 'PostsTable',
        'export' => 'xlsx',
        'keys' => [1, '2', '', [], '  '],
        'state' => ['search' => 'draft'],
        'data' => ['notify' => true],
    ]);

    $exportRequest = ExportRequest::fromRequest($request);

    expect($exportRequest->table())->toBe('PostsTable')
        ->and($exportRequest->export())->toBe('xlsx')
        ->and($exportRequest->selectedKeys())->toBe([1, '2'])
        ->and($exportRequest->state())->toBe(['search' => 'draft'])
        ->and($exportRequest->data())->toBe(['notify' => true])
        ->and($exportRequest->baseRequest())->toBe($request);
});

it('falls back for invalid array inputs', function (): void {
    $exportRequest = ExportRequest::fromRequest(Request::create('/exports', 'POST', [
        'keys' => 'bad',
        'state' => 'bad',
        'data' => 'bad',
    ]));

    expect($exportRequest->selectedKeys())->toBe([])
        ->and($exportRequest->state())->toBe([])
        ->and($exportRequest->data())->toBe([]);
});

it('wraps table request input for named tables', function (): void {
    $exportRequest = ExportRequest::fromRequest(Request::create('/exports', 'POST', ['state' => ['page' => 2]]));

    expect($exportRequest->tableRequestInput(PostsTable::make()->named('archive')))->toBe([
        'archive' => ['page' => 2],
    ]);
});

it('detects inertia requests', function (): void {
    $request = Request::create('/exports', 'POST');
    $request->headers->set('X-Inertia', 'true');

    expect(ExportRequest::fromRequest($request)->inertia())->toBeTrue();
});
it('creates table request objects from export state', function (): void {
    $exportRequest = ExportRequest::fromRequest(Request::create('/exports', 'POST', [
        'state' => ['search' => 'draft', 'page' => 2],
    ]));

    expect($exportRequest->tableRequest(PostsTable::make())->for(PostsTable::make()))->toMatchArray([
        'search' => 'draft',
        'page' => 2,
    ])
        ->and($exportRequest->tableRequest(PostsTable::make()->named('archive'))->for(PostsTable::make()->named('archive')))->toMatchArray([
            'search' => 'draft',
            'page' => 2,
        ]);
});
