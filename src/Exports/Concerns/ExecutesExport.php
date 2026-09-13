<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Exports\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use ReflectionFunction;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Table;

trait ExecutesExport
{
    public function isAuthorized(Table $table): bool
    {
        if (is_bool($this->authorize)) {
            return $this->authorize;
        }

        return (bool) $this->invoke($this->authorize, [$table, $this]);
    }

    public function executeUsing(Table $table, ExportRequest $request, Builder $query): mixed
    {
        return $this->using === null ? null : $this->invoke($this->using, [$table, $this, $request, $query]);
    }

    public function hasCustomExporter(): bool
    {
        return $this->using !== null;
    }

    public function isLimitedToFilteredRows(): bool
    {
        return $this->limitToFilteredRows;
    }

    public function isLimitedToSelectedRows(): bool
    {
        return $this->limitToSelectedRows;
    }

    public function isQueued(): bool
    {
        return $this->queued;
    }

    public function shouldDownload(): bool
    {
        return $this->download && ! $this->queued;
    }

    public function resolvedFilename(): string
    {
        return $this->filename;
    }

    public function queueFilename(): string
    {
        return $this->queueFilename ?? $this->filename;
    }

    public function queueDisk(): ?string
    {
        return $this->queueDisk;
    }

    public function queueName(): ?string
    {
        return self::$defaultQueueName;
    }

    public function writerType(): string
    {
        return $this->type;
    }

    public function queuedJob(mixed $job): mixed
    {
        if (self::$defaultQueueName !== null && method_exists($job, 'onQueue')) {
            $job = $job->onQueue(self::$defaultQueueName);
        }

        return $this->withQueuedJob === null ? $job : $this->invoke($this->withQueuedJob, [$job]);
    }

    public function redirectResponse(): ?RedirectResponse
    {
        $redirect = $this->redirect;

        if ($redirect instanceof Closure) {
            $redirect = $redirect($this);
        }

        if ($redirect === 'back' || $redirect === null) {
            $response = back();
        } elseif (is_array($redirect) && isset($redirect['route'])) {
            $response = redirect()->route((string) $redirect['route'], (array) ($redirect['parameters'] ?? []));
        } else {
            $response = redirect()->to((string) $redirect);
        }

        if ($this->dialog !== null) {
            $response->with('table_export_dialog', $this->dialog);
        }

        return $response;
    }

    public function eventsDefinition(): array
    {
        return $this->events;
    }

    private function invoke(Closure $callback, array $arguments): mixed
    {
        $count = (new ReflectionFunction($callback))->getNumberOfParameters();

        return $callback(...array_slice($arguments, 0, $count));
    }
}
