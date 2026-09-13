<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('authorizes exports from booleans and table callbacks', function (): void {
    expect(Export::make(authorize: false)->isAuthorized(PostsTable::make()))->toBeFalse()
        ->and(Export::make(authorize: static fn (PostsTable $table, Export $export): bool => $table->name() === $export->keyName())
            ->key('posts')
            ->isAuthorized(PostsTable::make()))
        ->toBeTrue();
});

it('executes custom exporters with the supported arguments', function (): void {
    $table = PostsTable::make();
    $request = ExportRequest::fromRequest(Request::create('/exports', 'POST', ['data' => ['notify' => true]]));
    $query = TestPost::query();

    $export = Export::make()->using(
        static fn (PostsTable $table, Export $export, ExportRequest $request, Builder $query): array => [
            $table->name(),
            $export->keyName(),
            $request->data(),
            $query->getModel()::class,
        ],
    );

    expect(Export::make()->executeUsing($table, $request, $query))->toBeNull()
        ->and($export->hasCustomExporter())->toBeTrue()
        ->and($export->executeUsing($table, $request, $query))->toBe([
            'posts',
            'export',
            ['notify' => true],
            TestPost::class,
        ]);
});

it('resolves download queue filenames writer types event definitions and redirect responses', function (): void {
    $export = Export::make(filename: 'posts.xlsx')
        ->type('Csv')
        ->events(['before' => 'listener'])
        ->asDownload(false);

    expect($export->shouldDownload())->toBeFalse()
        ->and($export->resolvedFilename())->toBe('posts.xlsx')
        ->and($export->queueFilename())->toBe('posts.xlsx')
        ->and($export->writerType())->toBe('Csv')
        ->and($export->eventsDefinition())->toBe(['before' => 'listener'])
        ->and($export->redirectResponse())->not->toBeNull();
});
