<?php

declare(strict_types=1);

use Maatwebsite\Excel\Excel as ExcelWriter;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    Export::defaultLimitToFilteredRows(false);
    Export::defaultLimitToSelectedRows(false);
    Export::defaultQueueName(null);
    Export::defaultQueueDisk(null);
});

it('configures keys labels filenames types limits metadata and data attributes', function (): void {
    $export = Export::make()
        ->key(' posts-csv ')
        ->label('Posts CSV')
        ->filename('posts.csv')
        ->type(ExcelWriter::CSV)
        ->limitToFilteredRows()
        ->limitToSelectedRows()
        ->meta(['format' => 'csv', 'source' => 'first'])
        ->meta(['source' => 'second'])
        ->dataAttributes(['download' => true])
        ->dataAttributes(['scope' => 'visible']);

    expect($export->keyName())->toBe('posts-csv')
        ->and($export->resolvedFilename())->toBe('posts.csv')
        ->and($export->writerType())->toBe(ExcelWriter::CSV)
        ->and($export->isLimitedToFilteredRows())->toBeTrue()
        ->and($export->isLimitedToSelectedRows())->toBeTrue()
        ->and($export->toArray())->toMatchArray([
            'label' => 'Posts CSV',
            'meta' => ['format' => 'csv', 'source' => 'second'],
            'data' => ['download' => true, 'scope' => 'visible'],
        ]);
});

it('configures queue defaults explicit queue options and queued job callbacks', function (): void {
    Export::defaultQueueName('exports');
    Export::defaultQueueDisk('s3');

    $job = new class () {
        public ?string $queue = null;

        public bool $touched = false;

        public function onQueue(string $queue): self
        {
            $this->queue = $queue;

            return $this;
        }
    };

    $export = Export::make(filename: 'fallback.xlsx')
        ->queue('queued.xlsx', 'local', static function (object $job): object {
            $job->touched = true;

            return $job;
        });

    $queuedJob = $export->queuedJob($job);

    expect($export->isQueued())->toBeTrue()
        ->and($export->queueFilename())->toBe('queued.xlsx')
        ->and($export->queueDisk())->toBe('local')
        ->and($export->queueName())->toBe('exports')
        ->and($queuedJob->queue)->toBe('exports')
        ->and($queuedJob->touched)->toBeTrue();
});

it('configures redirects and dialog responses', function (): void {
    $route = Export::make()->redirectToRoute('zonvoir-table.exports.execute')->redirectResponse();
    $url = Export::make()->redirect('/exports/done')->redirectResponse();
    $callback = Export::make()->redirect(static fn (Export $export): string => '/exports/' . $export->keyName())->redirectResponse();
    $dialog = Export::make()->redirectBackWithDialog()->redirectResponse();

    expect($route->getTargetUrl())->toContain('/zonvoir-table/exports')
        ->and($url->getTargetUrl())->toBe('http://localhost/exports/done')
        ->and($callback->getTargetUrl())->toBe('http://localhost/exports/export')
        ->and($dialog->getSession()->get('table_export_dialog'))->toBe([
            'title' => 'Export started',
            'message' => 'Your export is being processed.',
        ]);
});
