<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

final class SearchTermParser
{
    /**
     * @return list<string>
     */
    public function parse(?string $search): array
    {
        if ($search === null) {
            return [];
        }

        preg_match_all('/"([^"]+)"|(\\S+)/', $search, $matches, PREG_SET_ORDER);

        $terms = [];

        foreach ($matches as $match) {
            $term = trim($match[1] !== '' ? $match[1] : $match[2]);

            if ($term !== '') {
                $terms[] = $term;
            }
        }

        return $terms;
    }
}
