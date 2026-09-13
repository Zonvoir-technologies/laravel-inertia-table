<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('serializes export payloads and json payloads from configured state', function (): void {
    $export = Export::make('Posts Export')
        ->key('posts')
        ->queue()
        ->limitToFilteredRows()
        ->limitToSelectedRows()
        ->asDownload(false)
        ->meta(['format' => 'xlsx'])
        ->dataAttributes(['notify' => true]);

    expect($export->toArray())->toMatchArray([
        'key' => 'posts',
        'label' => 'Posts Export',
        'endpoint' => '/zonvoir-table/exports',
        'authorized' => true,
        'hidden' => false,
        'disabled' => false,
        'queued' => true,
        'limitToFilteredRows' => true,
        'limitToSelectedRows' => true,
        'asDownload' => false,
        'meta' => ['format' => 'xlsx'],
        'data' => ['notify' => true],
    ])
        ->and($export->jsonSerialize())->toBe($export->toArray());
});
