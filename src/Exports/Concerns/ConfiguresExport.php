<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Exports\Concerns;

use Closure;
use Illuminate\Support\Str;

trait ConfiguresExport
{
    public function key(?string $key): self
    {
        $this->key = $key === null ? null : trim($key);

        return $this;
    }

    public function keyName(): string
    {
        return $this->key ?: Str::slug($this->label);
    }

    public function label(?string $label): self
    {
        if ($label !== null && trim($label) !== '') {
            $this->label = $label;
        }

        return $this;
    }

    public function filename(?string $filename): self
    {
        if ($filename !== null && trim($filename) !== '') {
            $this->filename = $filename;
        }

        return $this;
    }

    public function type(?string $type): self
    {
        if ($type !== null && trim($type) !== '') {
            $this->type = $type;
        }

        return $this;
    }

    public function authorize(bool|callable $authorize = true): self
    {
        $this->authorize = is_callable($authorize) && ! is_bool($authorize)
            ? Closure::fromCallable($authorize)
            : $authorize;

        return $this;
    }

    public function limitToFilteredRows(bool $limit = true): self
    {
        $this->limitToFilteredRows = $limit;

        return $this;
    }

    public function limitToSelectedRows(bool $limit = true): self
    {
        $this->limitToSelectedRows = $limit;

        return $this;
    }

    public function queue(?string $filename = null, ?string $disk = null, ?callable $withQueuedJob = null): self
    {
        $this->queued = true;
        $this->queueFilename = $filename;
        $this->queueDisk = $disk ?? $this->queueDisk;
        $this->withQueuedJob($withQueuedJob);

        return $this;
    }

    public function withQueuedJob(?callable $callback): self
    {
        if ($callback !== null) {
            $this->withQueuedJob = Closure::fromCallable($callback);
        }

        return $this;
    }

    public function using(?callable $callback): self
    {
        if ($callback !== null) {
            $this->using = Closure::fromCallable($callback);
        }

        return $this;
    }

    public function asDownload(bool $download = true): self
    {
        $this->download = $download;

        return $this;
    }

    public function redirect(string|array|callable|null $to): self
    {
        $this->redirect = is_callable($to) && ! is_string($to) && ! is_array($to)
            ? Closure::fromCallable($to)
            : $to;

        return $this;
    }

    public function redirectToRoute(string $route, array $parameters = []): self
    {
        $this->redirect = ['route' => $route, 'parameters' => $parameters];

        return $this;
    }

    public function redirectBackWithDialog(?string $title = null, ?string $message = null): self
    {
        $this->download = false;
        $this->redirect = 'back';
        $this->dialog = [
            'title' => $title ?? 'Export started',
            'message' => $message ?? 'Your export is being processed.',
        ];

        return $this;
    }

    public function events(array $events): self
    {
        $this->events = array_replace($this->events, $events);

        return $this;
    }

    public function meta(array $meta): self
    {
        $this->meta = array_replace($this->meta, $meta);

        return $this;
    }

    public function dataAttributes(array $data): self
    {
        $this->data = array_replace($this->data, $data);

        return $this;
    }
}
