<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

final class BooleanColumn extends Column
{
    public function trueLabel(string $label): BooleanColumn
    {
        return $this->meta([
            'trueLabel' => $label,
        ]);
    }

    public function falseLabel(string $label): BooleanColumn
    {
        return $this->meta([
            'falseLabel' => $label,
        ]);
    }

    public function trueIcon(string $icon): BooleanColumn
    {
        return $this->meta([
            'trueIcon' => $icon,
        ]);
    }

    public function falseIcon(string $icon): BooleanColumn
    {
        return $this->meta([
            'falseIcon' => $icon,
        ]);
    }

    public function nullLabel(string $label): BooleanColumn
    {
        return $this->meta([
            'nullLabel' => $label,
        ]);
    }

    public function displayAs(string $displayAs): BooleanColumn
    {
        return $this->meta([
            'displayAs' => $displayAs,
        ]);
    }

}
