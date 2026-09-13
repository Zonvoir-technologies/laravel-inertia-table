<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

use Zonvoir\InertiaTable\Enums\ColumnAlignment;

final class SerialNumberColumn extends Column
{
    protected function __construct(string $name = '_serial_number')
    {
        parent::__construct($name);

        $this->label = 'S.no';
        $this->toggleable = false;
        $this->alignment = ColumnAlignment::Center->value;
        $this->width = '4rem';
        $this->meta = [
            'serialNumber' => true,
        ];
    }
    public static function make(
        string $name = '_serial_number',
        string|callable|null $label = null,
        bool $sortable = false,
        bool $toggleable = true,
        bool $searchable = false,
        string|ColumnAlignment|null $alignment = null,
        ?callable $mapAs = null,
        bool $visible = true,
        ?callable $sortUsing = null,
        array $meta = [],
        bool $sticky = false,
        ?callable $searchUsing = null,
        ?string $key = null,
        ?string $labelClass = null,
        ?string $cellClass = null,
        false|callable|null $exportAs = null,
        string|callable|null $exportLabel = null,
        ?string $exportFormat = null,
        array|callable|null $exportStyle = null,
    ): static {
        return parent::make(
            name: $name,
            label: $label,
            sortable: $sortable,
            toggleable: $toggleable,
            searchable: $searchable,
            alignment: $alignment,
            mapAs: $mapAs,
            visible: $visible,
            sortUsing: $sortUsing,
            meta: $meta,
            sticky: $sticky,
            searchUsing: $searchUsing,
            key: $key,
            labelClass: $labelClass,
            cellClass: $cellClass,
            exportAs: $exportAs,
            exportLabel: $exportLabel,
            exportFormat: $exportFormat,
            exportStyle: $exportStyle,
        );
    }

    public static function create(
        string $name = '_serial_number',
        string|callable|null $label = null,
        bool $sortable = false,
        bool $toggleable = true,
        bool $searchable = false,
        string|ColumnAlignment|null $alignment = null,
        ?callable $mapAs = null,
        bool $visible = true,
        ?callable $sortUsing = null,
        array $meta = [],
        bool $sticky = false,
        ?callable $searchUsing = null,
        ?string $key = null,
        ?string $labelClass = null,
        ?string $cellClass = null,
        false|callable|null $exportAs = null,
        string|callable|null $exportLabel = null,
        ?string $exportFormat = null,
        array|callable|null $exportStyle = null,
    ): static {
        return static::make(
            name: $name,
            label: $label,
            sortable: $sortable,
            toggleable: $toggleable,
            searchable: $searchable,
            alignment: $alignment,
            mapAs: $mapAs,
            visible: $visible,
            sortUsing: $sortUsing,
            meta: $meta,
            sticky: $sticky,
            searchUsing: $searchUsing,
            key: $key,
            labelClass: $labelClass,
            cellClass: $cellClass,
            exportAs: $exportAs,
            exportLabel: $exportLabel,
            exportFormat: $exportFormat,
            exportStyle: $exportStyle,
        );
    }
}
