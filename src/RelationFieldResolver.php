<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

final class RelationFieldResolver
{
    /**
     * @return array{relation: string, column: string}|null
     */
    public function resolve(string $field): ?array
    {
        if (! str_contains($field, '.')) {
            return null;
        }

        $segments = array_values(array_filter(explode('.', $field), static fn (string $segment): bool => $segment !== ''));

        if (count($segments) < 2) {
            return null;
        }

        $column = array_pop($segments);
        $relation = implode('.', $segments);


        return [
            'relation' => $relation,
            'column' => $column,
        ];
    }
}
