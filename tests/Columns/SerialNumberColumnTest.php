<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\SerialNumberColumn;
use Zonvoir\InertiaTable\Enums\ColumnAlignment;

it('serializes serial number defaults through either factory', function (string $factory): void {
    expect(SerialNumberColumn::$factory()->toArray())->toMatchArray([
        'name' => '_serial_number',
        'type' => 'serial-number',
        'label' => 'S.no',
        'alignment' => 'center',
        'width' => '4rem',
        'toggleable' => false,
        'sortable' => false,
        'searchable' => false,
        'meta' => ['serialNumber' => true],
    ]);
})->with(['make', 'create']);

it('preserves custom serial number presentation and metadata', function (string $factory): void {
    expect(SerialNumberColumn::$factory(
        name: 'position',
        label: 'Row',
        alignment: ColumnAlignment::Right,
        meta: ['description' => 'Position on the page'],
        sticky: true,
        key: 'row-number',
    )->toArray())->toMatchArray([
        'name' => 'position',
        'key' => 'row-number',
        'label' => 'Row',
        'alignment' => 'right',
        'sticky' => true,
        'meta' => ['serialNumber' => true, 'description' => 'Position on the page'],
    ]);
})->with(['make', 'create']);
