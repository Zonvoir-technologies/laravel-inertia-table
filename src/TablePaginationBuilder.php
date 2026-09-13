<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Contracts\Pagination\CursorPaginator as CursorPaginatorContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Zonvoir\InertiaTable\Enums\PaginationType;

final readonly class TablePaginationBuilder
{
    public function __construct(
        private TableQueryBuilder $queryBuilder,
    ) {
    }

    public function paginate(Builder $query, Table $table, Contracts\TableState $state): LengthAwarePaginator|Paginator|CursorPaginatorContract|Collection
    {
        $queryBuilder = clone $this->queryBuilder;
        $queryBuilder = $table->withQueryBuilder($queryBuilder) ?? $queryBuilder;
        $query = $queryBuilder->apply($query, $table, $state);
        $configuration = $table->pagination();

        if (! $configuration->enabled()) {
            return $query->get();
        }

        $paginator = match ($configuration->type()) {
            PaginationType::Standard => $query->paginate(
                perPage: $state->perPage(),
                pageName: $table->pageName(),
                page: $state->page(),
            ),
            PaginationType::Simple => $query->simplePaginate(
                perPage: $state->perPage(),
                pageName: $table->pageName(),
                page: $state->page(),
            ),
            PaginationType::Cursor => $query->cursorPaginate(
                perPage: $state->perPage(),
                cursorName: $table->cursorName(),
                cursor: $state->cursor(),
            ),
        };

        $paginator->appends($table->queryStringState($state));

        return $paginator;
    }
}
