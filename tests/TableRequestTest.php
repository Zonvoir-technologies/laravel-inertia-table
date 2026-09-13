<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Zonvoir\InertiaTable\TableRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;

it('returns request state for an unnamed table', function (): void {
    expect(TableRequest::fromArray(['page' => 2, 'ignored' => true])->for(PostsTable::make()))
        ->toBe(['page' => 2]);
});

it('returns namespaced request state for a named table', function (): void {
    expect(TableRequest::fromArray(['archive' => ['page' => 3]])->for(PostsTable::make()->named('archive')))
        ->toBe(['page' => 3]);
});

it('falls back to legacy named state for unnamed tables', function (): void {
    expect(TableRequest::fromArray(['posts' => ['search' => 'draft']])->for(PostsTable::make()))
        ->toBe(['search' => 'draft']);
});

it('ignores non array named states', function (): void {
    expect(TableRequest::fromArray(['archive' => 'bad'])->for(PostsTable::make()->named('archive')))
        ->toBe([]);
});

it('can be created from an http request query', function (): void {
    $request = Request::create('/posts', 'GET', ['page' => '4']);

    expect(TableRequest::fromRequest($request)->for(PostsTable::make()))->toBe(['page' => '4']);
});
