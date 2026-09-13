<?php

declare(strict_types=1);

use Maatwebsite\Excel\Excel as ExcelWriter;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    Export::defaultLimitToFilteredRows(false);
    Export::defaultLimitToSelectedRows(false);
    Export::defaultQueueName(null);
    Export::defaultQueueDisk(null);
});

it('creates an export definition with defaults', function (): void {
    $export = Export::make('Posts export');

    expect($export->keyName())->toBe('posts-export')
        ->and($export->resolvedFilename())->toBe('export.xlsx')
        ->and($export->writerType())->toBe(ExcelWriter::XLSX)
        ->and($export->jsonSerialize())->toMatchArray([
            'key' => 'posts-export',
            'label' => 'Posts export',
            'endpoint' => '/zonvoir-table/exports',
            'authorized' => true,
            'queued' => false,
            'limitToFilteredRows' => false,
            'limitToSelectedRows' => false,
            'asDownload' => true,
        ]);
});

it('ignores blank optional labels filenames and types', function (): void {
    $export = Export::make(label: '', filename: ' ', type: '');

    expect($export->keyName())->toBe('export')
        ->and($export->resolvedFilename())->toBe('export.xlsx')
        ->and($export->writerType())->toBe(ExcelWriter::XLSX);
});

it('serializes configured keys limits meta and data', function (): void {
    $payload = Export::make('Posts', filename: 'posts.csv', type: ExcelWriter::CSV)
        ->key(' posts ')
        ->limitToFilteredRows()
        ->limitToSelectedRows()
        ->meta(['format' => 'csv'])
        ->dataAttributes(['source' => 'test'])
        ->toArray();

    expect($payload)->toMatchArray([
        'key' => 'posts',
        'limitToFilteredRows' => true,
        'limitToSelectedRows' => true,
        'meta' => ['format' => 'csv'],
        'data' => ['source' => 'test'],
    ]);
});

it('supports authorization callbacks custom exporters and events', function (): void {
    $export = Export::make('Posts')
        ->authorize(static fn (PostsTable $table): bool => $table->name() === 'posts')
        ->using(static fn (): string => 'custom')
        ->events(['after' => 'listener']);

    expect($export->isAuthorized(PostsTable::make()))->toBeTrue()
        ->and($export->hasCustomExporter())->toBeTrue()
        ->and($export->eventsDefinition())->toBe(['after' => 'listener']);
});

it('queues exports and disables direct downloads while queued', function (): void {
    Export::defaultQueueName('exports');
    Export::defaultQueueDisk('s3');

    $job = new class () {
        public ?string $queue = null;

        public function onQueue(string $queue): self
        {
            $this->queue = $queue;

            return $this;
        }
    };

    $export = Export::make('Posts')->queue('queued.xlsx');

    expect($export->isQueued())->toBeTrue()
        ->and($export->shouldDownload())->toBeFalse()
        ->and($export->queueFilename())->toBe('queued.xlsx')
        ->and($export->queueDisk())->toBe('s3')
        ->and($export->queueName())->toBe('exports')
        ->and($export->queuedJob($job)->queue)->toBe('exports');
});

it('can redirect back with dialog instead of downloading', function (): void {
    $response = Export::make('Posts')->redirectBackWithDialog('Queued', 'We will email you.')->redirectResponse();

    expect($response->getSession()->get('table_export_dialog'))->toBe([
        'title' => 'Queued',
        'message' => 'We will email you.',
    ]);
});
it('creates exports through the create factory alias and applies static defaults', function (): void {
    Export::defaultLimitToFilteredRows();
    Export::defaultLimitToSelectedRows();
    Export::defaultQueueDisk('s3');

    $export = Export::create(
        label: 'Posts CSV',
        filename: 'posts.csv',
        type: ExcelWriter::CSV,
        authorize: false,
        queued: true,
        using: static fn (): string => 'custom',
        meta: ['source' => 'create'],
        data: ['notify' => true],
        events: ['after' => 'listener'],
    );

    expect($export->keyName())->toBe('posts-csv')
        ->and($export->resolvedFilename())->toBe('posts.csv')
        ->and($export->writerType())->toBe(ExcelWriter::CSV)
        ->and($export->isAuthorized(PostsTable::make()))->toBeFalse()
        ->and($export->isQueued())->toBeTrue()
        ->and($export->shouldDownload())->toBeFalse()
        ->and($export->isLimitedToFilteredRows())->toBeTrue()
        ->and($export->isLimitedToSelectedRows())->toBeTrue()
        ->and($export->queueDisk())->toBe('s3')
        ->and($export->hasCustomExporter())->toBeTrue()
        ->and($export->eventsDefinition())->toBe(['after' => 'listener'])
        ->and($export->toArray())->toMatchArray([
            'meta' => ['source' => 'create'],
            'data' => ['notify' => true],
        ]);
});

it('enables export row limits from factory arguments', function (): void {
    expect(Export::make('Posts', limitToFilteredRows: true, limitToSelectedRows: true)->isLimitedToFilteredRows())->toBeTrue()
        ->and(Export::make('Posts', limitToFilteredRows: true, limitToSelectedRows: true)->isLimitedToSelectedRows())->toBeTrue();
});
