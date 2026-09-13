<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Zonvoir\InertiaTable\Columns\Column;

final class TableQueryMetadataResolver
{
    public function resolve(Table $table): TableQueryMetadata
    {
        $declaredSearchFields = $table->searchable();

        $columns = array_map(
            static fn (Column $column): ResolvedTableQueryColumn => new ResolvedTableQueryColumn(
                key: $column->resolvedKey(),
                field: $column->name(),
                searchable: $column->isSearchable()
                    || in_array($column->name(), $declaredSearchFields, true),
                sortable: $column->isSortable(),
                searchCallback: $column->searchCallback(),
                sortCallback: $column->sortCallback(),
            ),
            $table->columnsDefinition(),
        );

        $coveredSearchFields = array_values(array_unique(array_map(
            static fn (ResolvedTableQueryColumn $column): string => $column->field(),
            $columns,
        )));

        foreach ($declaredSearchFields as $field) {
            if (in_array($field, $coveredSearchFields, true)) {
                continue;
            }

            $columns[] = new ResolvedTableQueryColumn(
                key: $field,
                field: $field,
                searchable: true,
                sortable: false,
            );
        }

        return new TableQueryMetadata($columns);
    }
}
