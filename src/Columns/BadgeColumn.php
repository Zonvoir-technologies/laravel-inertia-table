<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

use Zonvoir\InertiaTable\Enums\BadgeVariant;
use Zonvoir\InertiaTable\Enums\TableColor;

final class BadgeColumn extends Column
{
    /**
     * @param  array<string, string|TableColor>  $colors
     */
    public function colors(array $colors): BadgeColumn
    {
        return $this->meta([
            'colors' => array_map(
                static fn (string|TableColor $color): string => $color instanceof TableColor
                    ? $color->value
                    : $color,
                $colors,
            ),
        ]);
    }

    public function variant(string|BadgeVariant $variant): BadgeColumn
    {
        return $this->meta([
            'variant' => $variant instanceof BadgeVariant ? $variant->value : $variant,
        ]);
    }

    public function solid(): BadgeColumn
    {
        return $this->variant(BadgeVariant::Solid);
    }

    public function outline(): BadgeColumn
    {
        return $this->variant(BadgeVariant::Outline);
    }

    public function ghost(): BadgeColumn
    {
        return $this->variant(BadgeVariant::Ghost);
    }

    /**
     * @param  array<string, string>  $icons
     */
    public function icons(array $icons): BadgeColumn
    {
        return $this->meta([
            'icons' => $icons,
        ]);
    }

    public function icon(string $icon): BadgeColumn
    {
        return $this->meta([
            'icon' => $icon,
        ]);
    }
}
