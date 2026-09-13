<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Enums;

enum ImageSize: string
{
    case Small = 'small';
    case Medium = 'medium';
    case Large = 'large';
    case ExtraLarge = 'extra-large';

    public function classes(): string
    {
        return match ($this) {
            self::Small => 'size-4',
            self::Medium => 'size-6',
            self::Large => 'size-8',
            self::ExtraLarge => 'size-10',
        };
    }
}
