<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Contracts\Pagination\CursorPaginator as CursorPaginatorContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Zonvoir\InertiaTable\Columns\Column;
use Zonvoir\InertiaTable\Contracts\TableState as TableStateContract;
use Zonvoir\InertiaTable\Enums\PaginationType;

final class TablePayloadBuilder
{
    public function build(Table $table, TableStateContract $state): array
    {
        return [
            'name' => $table->name(),
            'state' => [
                'page' => $state->page(),
                'perPage' => $state->perPage(),
                'cursor' => $state->cursor(),
                'search' => $state->search(),
                'sort' => $state->sort(),
                'direction' => $state->direction(),
            ],
            'meta' => $table->meta(),
            'rowSelectionKey' => $table->rowSelectionKey(),
            'selectable' => $table->selectable(),
            'persistRowSelectionAcrossPages' => $table->persistsRowSelectionAcrossPages(),
        ];
    }

    /** @return array<string, mixed> */
    public function buildResults(Table $table, TableStateContract $state, mixed $results): array
    {
        $configuration = $table->pagination();
        $bulkActions = array_values(array_filter(array_map(
            static fn (Action $action): ?array => $action->forBulk(),
            $table->actionsDefinition(),
        )));
        $exports = array_values(array_filter(array_map(
            static fn (Export $export): ?array => $export->isAuthorized($table) ? $export->toArray() : null,
            $table->exportsDefinition(),
        )));

        return [
            'name' => $table->name(),
            'results' => $this->serializeResults($table, $results),
            'meta' => $table->meta(),
            'search' => [],
            'columns' => array_map(
                fn (Column $column): array => $this->serializeColumn($column),
                $table->columnsDefinition(),
            ),
            'actions' => $bulkActions,
            'exports' => $exports,
            'state' => [
                'columns' => $this->visibleColumns($table, $state),
                'perPage' => $state->perPage(),
                'search' => $state->search(),
                'sort' => $state->sort(),
                'sticky' => $this->stickyColumns($table, $state),
            ],
            'pagination' => $configuration->enabled(),
            'paginationType' => $this->paginationType($configuration->type()),
            'perPageOptions' => $configuration->perPageOptions(),
            'defaultPerPage' => $configuration->defaultPerPage(),
            'defaultSort' => $table->defaultSort(),
            'debounceTime' => 300,
            'reloadProps' => [],
            'hasActions' => $table->actionsDefinition() !== [],
            'hasBulkActions' => $bulkActions !== [],
            'hasExports' => $exports !== [],
            'hasExportsThatLimitsToSelectedRows' => collect($table->exportsDefinition())->contains(
                static fn (Export $export): bool => $export->isAuthorized($table) && $export->isLimitedToSelectedRows(),
            ),
            'hasFilters' => false,
            'hasSearch' => $table->searchable() !== [],
            'hasToggleableColumns' => true,
            'scrollPositionAfterPageChange' => $configuration->scrollToTop() ? 'topOfPage' : 'preserve',
            'autofocus' => 'search',
            'emptyState' => $this->emptyState($table, $state),
            'stickyHeader' => $table->stickyHeader(),
            'rowSelectionKey' => $table->rowSelectionKey(),
            'selectable' => $table->selectable(),
            'persistRowSelectionAcrossPages' => $table->persistsRowSelectionAcrossPages(),
            'selection' => [
                'mode' => 'page',
            ],
            'inDefaultState' => $this->inDefaultState($table, $state),
        ];
    }

    /** @return array<string, mixed>|list<mixed> */
    private function serializeResults(Table $table, mixed $results): array
    {
        if ($results instanceof LengthAwarePaginator || $results instanceof Paginator || $results instanceof CursorPaginatorContract) {
            $payload = $results->toArray();
            $payload['data'] = array_map(
                fn (mixed $record): array => $this->serializeRow($table, $record),
                $results->items(),
            );
            $payload['on_first_page'] = $results->onFirstPage();
            $payload['on_last_page'] = method_exists($results, 'onLastPage')
                ? $results->onLastPage()
                : ! $results->hasMorePages();

            return $payload;
        }

        if ($results instanceof Collection) {
            return $results
                ->map(fn (mixed $record): array => $this->serializeRow($table, $record))
                ->values()
                ->all();
        }

        return is_array($results) ? $results : [];
    }

    private function paginationType(PaginationType $type): string
    {
        return match ($type) {
            PaginationType::Standard => 'full',
            PaginationType::Simple => 'simple',
            PaginationType::Cursor => 'cursor',
        };
    }

    /** @return array<string, mixed> */
    private function serializeColumn(Column $column): array
    {
        $definition = $column->toArray();

        return [
            'type' => $definition['type'],
            'header' => $definition['label'],
            'attribute' => $definition['key'],
            'sortable' => $definition['sortable'],
            'toggleable' => $definition['toggleable'],
            'alignment' => $definition['alignment'] ?? 'left',
            'visibleByDefault' => $definition['visible'],
            'meta' => array_replace([
                'hidden' => ! $definition['visible'],
                'sortable' => $definition['sortable'],
                'toggleable' => $definition['toggleable'],
                'stickable' => $definition['sticky'],
                'defaultToSticky' => $definition['sticky'],
            ], $definition['meta']),
            'wrap' => false,
            'tooltip' => $definition['tooltip'] ?? null,
            'truncate' => null,
            'headerClass' => $definition['labelClass'],
            'cellClass' => $definition['cellClass'],
            'stickable' => $definition['sticky'],
        ];
    }

    /** @return array<string, mixed> */
    private function serializeRow(Table $table, mixed $record): array
    {
        $primaryKey = is_object($record) && method_exists($record, 'getKey')
            ? $record->getKey()
            : data_get($record, 'id');
        $row = [
            '_column_urls' => [],
            '_column_images' => [],
            '_primary_key' => $primaryKey,
        ];

        $selectionKey = $table->rowSelectionKey();

        if ($selectionKey !== null && ! array_key_exists($selectionKey, $row)) {
            $row[$selectionKey] = $selectionKey === 'id'
                ? $primaryKey
                : data_get($record, $selectionKey);
        }

        $rowUrl = $record instanceof Model
            ? $this->serializeUrl($table->rowUrl($record, new Url()))
            : null;

        if ($rowUrl !== null) {
            $row['_url'] = $rowUrl;
        }

        foreach ($table->columnsDefinition() as $column) {
            $row[$column->resolvedKey()] = $column->resolveValue($record);

            $columnUrl = $this->serializeUrl($column->resolveUrl($record));

            if ($columnUrl !== null) {
                $row['_column_urls'][$column->resolvedKey()] = $columnUrl;
            }

            $columnImage = $column->resolveImage($record);

            if ($columnImage !== null) {
                $row['_column_images'][$column->resolvedKey()] = $columnImage;
            }
        }

        $row['_selectable'] = ! $record instanceof Model || $table->isSelectable($record);
        $row['_actions'] = $record instanceof Model
            ? array_values(array_filter(array_map(
                static fn (Action $action): ?array => $action->forRow($record),
                $table->actionsDefinition(),
            )))
            : [];

        return $record instanceof Model
            ? $table->transformModel($record, $row)
            : $row;
    }

    private function serializeUrl(string|Url|array|null $url): string|array|null
    {
        if ($url instanceof Url) {
            return $url->toArray();
        }

        if (is_array($url)) {
            return $url;
        }

        return $url === '' ? null : $url;
    }

    /** @return array<string, bool> */
    private function visibleColumns(Table $table, TableStateContract $state): array
    {
        $columns = [];
        $hiddenColumns = $state->columns();

        foreach ($table->columnsDefinition() as $column) {
            $definition = $column->toArray();
            $columns[$definition['key']] = in_array($definition['key'], $hiddenColumns, true)
                ? false
                : $definition['visible'];
        }

        return $columns;
    }

    /** @return list<string> */
    private function stickyColumns(Table $table, TableStateContract $state): array
    {
        if ($state->hasStickyOverride()) {
            return $state->sticky();
        }

        $columns = [];

        foreach ($table->columnsDefinition() as $column) {
            $definition = $column->toArray();

            if ($definition['sticky']) {
                $columns[] = $definition['key'];
            }
        }

        return $columns;
    }

    private function inDefaultState(Table $table, TableStateContract $state): bool
    {
        return $state->toArray() === $table->state()->toArray();
    }

    private function emptyState(Table $table, TableStateContract $state): array|false
    {
        $emptyState = $table->emptyState();

        if ($emptyState === false || $emptyState === null) {
            return false;
        }

        if ($emptyState instanceof TableEmptyState) {
            return $emptyState->toArray();
        }

        return $emptyState;
    }
}
