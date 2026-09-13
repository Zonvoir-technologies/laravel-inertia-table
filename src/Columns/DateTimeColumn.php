<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

final class DateTimeColumn extends Column
{
    public function format(string $format): DateTimeColumn
    {
        return $this->meta([
            'format' => $format,
        ]);
    }

    public function placeholder(string $placeholder): DateTimeColumn
    {
        return $this->meta([
            'placeholder' => $placeholder,
        ]);
    }

    public function timezone(string $timezone): DateTimeColumn
    {
        return $this->meta([
            'timezone' => $timezone,
        ]);
    }

}
