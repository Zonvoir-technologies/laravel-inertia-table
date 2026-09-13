<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Table;

final class ActionController
{
    public function __invoke(Request $request): JsonResponse|RedirectResponse
    {
        /** @var class-string<Table> $tableClass */
        $tableClass = (string) $request->input('table');

        abort_unless(is_subclass_of($tableClass, Table::class), 422, 'Invalid table.');

        $table = app($tableClass);
        $action = $this->findAction($table, (string) $request->input('action'));
        $isAllSelection = $request->input('selectionMode') === 'all';
        $requestedKeys = (array) $request->input('keys', []);

        abort_unless($action instanceof Action && $action->hasHandler(), 404, 'Action not found.');
        abort_unless(
            $action->isBulk() || (! $isAllSelection && count($requestedKeys) <= 1),
            422,
            'Action is not bulk executable.'
        );

        $models = $isAllSelection ? [] : $this->models($table, $request, $action);

        if (! $isAllSelection) {
            abort_if(empty($models), 404, 'No matching records found.');
        }

        $results = [];
        $processed = 0;
        $skipped = 0;

        try {
            if ($isAllSelection) {
                abort_unless(
                    $this->executeAllModels($table, $action, $results, $processed, $skipped),
                    404,
                    'No matching records found.'
                );
            } else {
                $action->runBefore($models);
                $this->executeModels($table, $action, $models, $results, $processed, $skipped);
                $action->runAfter($models, $results);
            }

            $payload = $action->successResponse([
                'ok' => true,
                'status' => 'success',
                'action' => $action->keyName(),
                'processed' => $processed,
                'skipped' => $skipped,
                'results' => $results,
            ]);

            if ($request->header('X-Inertia')) {
                return back()->with('table_action', $payload);
            }

            return response()->json($payload);
        } catch (Throwable $exception) {
            if ($exception instanceof HttpExceptionInterface) {
                throw $exception;
            }

            $payload = $action->errorResponse($exception, [
                'ok' => false,
                'status' => 'error',
                'action' => $action->keyName(),
                'processed' => $processed,
                'skipped' => $skipped,
                'message' => $exception->getMessage(),
            ]);

            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'table_action' => $payload['message'] ?? 'Action failed.',
                ]);
            }

            return response()->json($payload, 500);
        }
    }

    private function findAction(Table $table, string $key): ?Action
    {
        foreach ($table->actionsDefinition() as $action) {
            if ($action->keyName() === $key) {
                return $action;
            }
        }

        return null;
    }

    /** @return list<Model> */
    private function models(Table $table, Request $request, Action $action): array
    {
        $query = $table->query();
        $keyName = $table->rowSelectionKey() ?? $query->getModel()->getKeyName();
        $keys = array_values(array_filter((array) $request->input('keys', []), static fn (mixed $key): bool => $key !== null && $key !== ''));

        return $query->whereIn($keyName, $keys)->get()->all();
    }

    private function executeAllModels(Table $table, Action $action, array &$results, int &$processed, int &$skipped): bool
    {
        $matched = false;
        $query = $table->query();

        $query->{$action->chunkStrategy()}($action->chunkSize(), function ($chunk) use ($table, $action, &$results, &$processed, &$skipped, &$matched): void {
            $models = is_array($chunk) ? array_values($chunk) : $chunk->all();

            if ($models === []) {
                return;
            }

            $matched = true;
            $chunkResults = [];

            $action->runBefore($models);
            $this->executeModels($table, $action, $models, $results, $processed, $skipped, $chunkResults);
            $action->runAfter($models, $chunkResults);
        });

        return $matched;
    }

    /**
     * @param  list<Model>  $models
     * @param  list<mixed>  $results
     * @param  list<mixed>|null  $chunkResults
     */
    private function executeModels(
        Table $table,
        Action $action,
        array $models,
        array &$results,
        int &$processed,
        int &$skipped,
        ?array &$chunkResults = null,
    ): void {
        foreach (array_chunk($models, $action->chunkSize()) as $chunk) {
            foreach ($chunk as $model) {
                if (
                    ! $table->isSelectable($model) ||
                    ! $action->isAuthorized($model) ||
                    $action->isDisabled($model) ||
                    $action->isHidden($model)
                ) {
                    $skipped++;

                    continue;
                }

                $result = $action->execute($model);
                $results[] = $result;
                $chunkResults[] = $result;
                $processed++;
            }
        }
    }
}
