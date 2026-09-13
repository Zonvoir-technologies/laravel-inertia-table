<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

final readonly class TableQueryMetadata
{
    /**
     * @param  list<ResolvedTableQueryColumn>  $columns
     */
    public function __construct(
        private array $columns,
    ) {
    }

    /**
     * @return list<ResolvedTableQueryColumn>
     */
    public function columns(): array
    {
        return $this->columns;
    }

    public function sortableColumn(?string $key): ?ResolvedTableQueryColumn
    {
        if ($key === null) {
            return null;
        }

        foreach ($this->columns as $column) {
            if ($column->isSortable() && $column->key() === $key) {
                return $column;
            }
        }

        return null;
    }

    /**
     * @return list<ResolvedTableQueryColumn>
     */
    public function searchableColumns(): array
    {
        return array_values(array_filter(
            $this->columns,
            static fn (ResolvedTableQueryColumn $column): bool => $column->isSearchable(),
        ));
    }
}
