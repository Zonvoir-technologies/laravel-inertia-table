<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use ReflectionFunction;

final class TableSearchBuilder
{
    public function __construct(
        private readonly SearchTermParser $searchTermParser,
        private readonly RelationFieldResolver $relationFieldResolver,
    ) {
    }

    public function apply(Builder $query, TableQueryMetadata $metadata, ?string $search, ?Closure $searchUsing = null): void
    {
        $terms = $this->searchTermParser->parse($search);

        if ($terms === []) {
            return;
        }

        if ($searchUsing !== null) {
            $query->where(function (Builder $searchQuery) use ($searchUsing, $search, $terms): void {
                $this->invokeCallback($searchUsing, $searchQuery, $search, new Collection($terms));
            });

            return;
        }

        $searchableColumns = $metadata->searchableColumns();

        if ($searchableColumns === []) {
            return;
        }

        $query->where(function (Builder $termQuery) use ($searchableColumns, $terms): void {
            foreach ($terms as $term) {
                $termQuery->where(function (Builder $fieldQuery) use ($searchableColumns, $term): void {
                    foreach ($searchableColumns as $index => $column) {
                        $method = $index === 0 ? 'where' : 'orWhere';

                        $fieldQuery->{$method}(function (Builder $columnQuery) use ($column, $term): void {
                            $callback = $column->searchCallback();

                            if ($callback !== null) {
                                $this->invokeCallback($callback, $columnQuery, $term, $column);

                                return;
                            }

                            $resolvedRelationField = $this->relationFieldResolver->resolve($column->field());

                            if ($resolvedRelationField !== null) {
                                $columnQuery->whereHas(
                                    $resolvedRelationField['relation'],
                                    static function (Builder $relationQuery) use ($resolvedRelationField, $term): void {
                                        $relationQuery->where($resolvedRelationField['column'], 'like', '%' . $term . '%');
                                    },
                                );

                                return;
                            }

                            $columnQuery->where($column->field(), 'like', '%' . $term . '%');
                        });
                    }
                });
            }
        });
    }

    private function invokeCallback(Closure $callback, mixed ...$arguments): mixed
    {
        $reflection = new ReflectionFunction($callback);

        return $callback(...array_slice($arguments, 0, $reflection->getNumberOfParameters()));
    }
}
