<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use ReflectionFunction;

final class TableSortBuilder
{
    public function __construct(
        private readonly RelationFieldResolver $relationFieldResolver,
    ) {
    }

    public function apply(Builder $query, TableQueryMetadata $metadata, ?string $sort, string $direction): void
    {
        $column = $metadata->sortableColumn($sort);

        if ($column === null) {
            return;
        }

        $callback = $column->sortCallback();

        if ($callback !== null) {
            $this->invokeCallback($callback, $query, $direction, $column);

            return;
        }

        $resolvedRelationField = $this->relationFieldResolver->resolve($column->field());

        if ($resolvedRelationField !== null) {
            $this->applyRelationSort($query, $resolvedRelationField['relation'], $resolvedRelationField['column'], $direction);

            return;
        }

        $query->orderBy($column->field(), $direction);
    }

    private function applyRelationSort(Builder $query, string $relationPath, string $column, string $direction): void
    {
        if (! $this->isSafeIdentifier($column)) {
            return;
        }

        $joinPlan = $this->resolveRelationJoinPlan($query, $relationPath);

        if ($joinPlan === null) {
            return;
        }

        if ($query->getQuery()->columns === null) {
            $query->select($query->getModel()->getTable() . '.*');
        }

        foreach ($joinPlan['joins'] as $join) {
            $query->leftJoin(
                $join['table'],
                $join['first'],
                '=',
                $join['second'],
            );
        }

        $query->orderBy($joinPlan['targetAlias'] . '.' . $column, $direction);
    }

    /**
     * @return array{
     *     joins: list<array{table: string, first: string, second: string}>,
     *     targetAlias: string
     * }|null
     */
    private function resolveRelationJoinPlan(Builder $query, string $relationPath): ?array
    {
        $segments = explode('.', $relationPath);
        $currentModel = $query->getModel();
        $currentAlias = $currentModel->getTable();
        $targetAlias = null;
        $joins = [];

        foreach ($segments as $index => $segment) {
            if (! $this->isSafeIdentifier($segment)) {
                return null;
            }

            $relation = $this->resolveRelation($currentModel, $segment);

            if ($relation === null) {
                return null;
            }

            $relatedModel = $relation->getRelated();
            $relatedTable = $relatedModel->getTable();
            $targetAlias = $this->relationAlias($segments, $index);

            if ($relation instanceof BelongsTo) {
                $joins[] = [
                    'table' => $relatedTable . ' as ' . $targetAlias,
                    'first' => $currentAlias . '.' . $relation->getForeignKeyName(),
                    'second' => $targetAlias . '.' . $relation->getOwnerKeyName(),
                ];
            } elseif ($relation instanceof HasOneOrMany) {
                $joins[] = [
                    'table' => $relatedTable . ' as ' . $targetAlias,
                    'first' => $currentAlias . '.' . $relation->getLocalKeyName(),
                    'second' => $targetAlias . '.' . $relation->getForeignKeyName(),
                ];
            } else {
                return null;
            }

            $currentModel = $relatedModel;
            $currentAlias = $targetAlias;
        }


        return [
            'joins' => $joins,
            'targetAlias' => $targetAlias,
        ];
    }

    private function resolveRelation(Model $model, string $relationName): ?Relation
    {
        if (! method_exists($model, $relationName)) {
            return null;
        }

        $relation = $model->{$relationName}();

        return $relation instanceof Relation ? $relation : null;
    }

    /**
     * @param  list<string>  $segments
     */
    private function relationAlias(array $segments, int $index): string
    {
        return 'zonvoir_sort_' . implode('_', array_slice($segments, 0, $index + 1));
    }

    private function isSafeIdentifier(string $identifier): bool
    {
        return preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $identifier) === 1;
    }

    private function invokeCallback(Closure $callback, mixed ...$arguments): mixed
    {
        $reflection = new ReflectionFunction($callback);

        return $callback(...array_slice($arguments, 0, $reflection->getNumberOfParameters()));
    }
}
