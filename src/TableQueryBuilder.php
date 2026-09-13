<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Closure;
use Illuminate\Database\Eloquent\Builder;

final class TableQueryBuilder
{
    private ?Closure $searchUsing = null;

    public function __construct(
        private readonly TableQueryMetadataResolver $metadataResolver,
        private readonly TableSearchBuilder $tableSearchBuilder,
        private readonly TableSortBuilder $tableSortBuilder,
    ) {
    }

    public function searchUsing(?callable $callback): static
    {
        if ($callback === null) {
            return $this;
        }

        $builder = clone $this;
        $builder->searchUsing = Closure::fromCallable($callback);

        return $builder;
    }

    public function apply(Builder $query, Table $table, Contracts\TableState|TableQueryParameters|array|null $parameters = null): Builder
    {
        $metadata = $this->metadataResolver->resolve($table);
        $queryParameters = $this->normalizeParameters($parameters);

        $this->applySearch($query, $metadata, $queryParameters);
        $this->applySort($query, $metadata, $queryParameters);

        return $query;
    }

    private function applySearch(Builder $query, TableQueryMetadata $metadata, TableQueryParameters $parameters): void
    {
        $this->tableSearchBuilder->apply($query, $metadata, $parameters->search(), $this->searchUsing);
    }

    private function applySort(Builder $query, TableQueryMetadata $metadata, TableQueryParameters $parameters): void
    {
        $this->tableSortBuilder->apply($query, $metadata, $parameters->sort(), $parameters->direction());
    }

    private function normalizeParameters(Contracts\TableState|TableQueryParameters|array|null $parameters): TableQueryParameters
    {
        if ($parameters instanceof TableQueryParameters) {
            return $parameters;
        }

        if ($parameters instanceof Contracts\TableState) {
            return TableQueryParameters::fromState($parameters);
        }

        if (is_array($parameters)) {
            return TableQueryParameters::fromArray($parameters);
        }

        return new TableQueryParameters();
    }
}
