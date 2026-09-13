<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

use Zonvoir\InertiaTable\Enums\ColumnAlignment;

final class NumericColumn extends Column
{
    protected function __construct(string $name)
    {
        parent::__construct($name);

        $this->alignment = ColumnAlignment::Right->value;
    }

    public function precision(int $precision): NumericColumn
    {
        return $this->meta([
            'precision' => $precision,
        ]);
    }

    public function thousandsSeparator(string $thousandsSeparator): NumericColumn
    {
        return $this->meta([
            'thousandsSeparator' => $thousandsSeparator,
        ]);
    }

    public function decimalSeparator(string $decimalSeparator): NumericColumn
    {
        return $this->meta([
            'decimalSeparator' => $decimalSeparator,
        ]);
    }

    public function prefix(string $prefix): NumericColumn
    {
        return $this->meta([
            'prefix' => $prefix,
        ]);
    }

    public function suffix(string $suffix): NumericColumn
    {
        return $this->meta([
            'suffix' => $suffix,
        ]);
    }

    public function placeholder(string $placeholder): NumericColumn
    {
        return $this->meta([
            'placeholder' => $placeholder,
        ]);
    }

    public function presentation(string $presentation): NumericColumn
    {
        return $this->meta([
            'presentation' => $presentation,
        ]);
    }

}
