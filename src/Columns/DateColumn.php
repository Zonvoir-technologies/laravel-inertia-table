<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

final class DateColumn extends Column
{
    public function format(string $format): DateColumn
    {
        return $this->meta([
            'format' => $format,
        ]);
    }

    public function placeholder(string $placeholder): DateColumn
    {
        return $this->meta([
            'placeholder' => $placeholder,
        ]);
    }

}
