<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel as ExcelFacade;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Exports\TableExcelExport;
use Zonvoir\InertiaTable\Table;

final class ExportController
{
    public function __invoke(Request $request): mixed
    {
        $exportRequest = ExportRequest::fromRequest($request);

        /** @var class-string<Table> $tableClass */
        $tableClass = $exportRequest->table();

        abort_unless(is_subclass_of($tableClass, Table::class), 422, 'Invalid table.');

        $table = app($tableClass);
        $export = $this->findExport($table, $exportRequest->export());

        abort_unless($export instanceof Export, 404, 'Export not found.');
        abort_unless($export->isAuthorized($table), 403);

        $query = $this->query($table, $export, $exportRequest);

        if ($export->hasCustomExporter()) {
            $response = $export->executeUsing($table, $exportRequest, $query);

            if ($response !== null) {
                return $response;
            }
        }

        $excelExport = TableExcelExport::fromRequest($table, $export, $exportRequest);

        if ($export->isQueued()) {
            $job = ExcelFacade::queue(
                $excelExport,
                $export->queueFilename(),
                $export->queueDisk(),
                $export->writerType(),
            );

            $export->queuedJob($job);

            return $this->processingResponse($export, $exportRequest);
        }

        if ($export->shouldDownload()) {
            return ExcelFacade::download($excelExport, $export->resolvedFilename(), $export->writerType());
        }

        ExcelFacade::store(
            $excelExport,
            $export->resolvedFilename(),
            $export->queueDisk(),
            $export->writerType(),
        );

        return $this->processingResponse($export, $exportRequest);
    }

    private function findExport(Table $table, string $key): ?Export
    {
        foreach ($table->exportsDefinition() as $export) {
            if ($export->keyName() === $key) {
                return $export;
            }
        }

        return null;
    }

    private function query(Table $table, Export $export, ExportRequest $request): Builder
    {
        $query = $table->query();

        if ($export->isLimitedToFilteredRows()) {
            $query = $table->apply($query, $request->tableRequest($table));
        }

        if ($export->isLimitedToSelectedRows()) {
            $keyName = $table->rowSelectionKey() ?? $query->getModel()->getKeyName();
            $keys = $request->selectedKeys();

            if ($keys === []) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereIn($keyName, $keys);
            }
        }

        $this->ensureDeterministicOrder($query);

        return $query;
    }

    private function ensureDeterministicOrder(Builder $query): void
    {
        $keyName = $query->getModel()->getKeyName();
        $qualifiedKeyName = $query->getModel()->getQualifiedKeyName();

        foreach (($query->getQuery()->orders ?? []) as $order) {
            $column = $order['column'] ?? null;

            if ($column === $keyName || $column === $qualifiedKeyName) {
                return;
            }
        }

        $query->orderBy($qualifiedKeyName);
    }

    private function processingResponse(Export $export, ExportRequest $request): JsonResponse|RedirectResponse
    {
        $payload = [
            'ok' => true,
            'status' => 'processing',
            'export' => $export->keyName(),
            'message' => 'Export is being processed.',
        ];

        if (! $request->inertia()) {
            return response()->json($payload);
        }

        return $export->redirectResponse()->with('table_export', $payload);
    }
}
