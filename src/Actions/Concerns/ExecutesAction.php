<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Actions\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;
use ReflectionFunction;
use ReflectionNamedType;
use Throwable;
use Zonvoir\InertiaTable\Url;

trait ExecutesAction
{
    public function isBulk(): bool
    {
        return $this->bulk;
    }

    public function isOnlyBulk(): bool
    {
        return $this->onlyBulk;
    }

    public function hasHandler(): bool
    {
        return $this->handle !== null;
    }

    public function chunkSize(): int
    {
        return $this->chunkSize;
    }

    public function chunkStrategy(): string
    {
        return $this->chunkStrategy;
    }

    public function isAuthorized(?Model $model = null): bool
    {
        return $this->authorize;
    }

    public function isDisabled(?Model $model = null): bool
    {
        return $this->disabled;
    }

    public function isHidden(?Model $model = null): bool
    {
        return $this->hidden;
    }

    public function execute(Model $model): mixed
    {
        return $this->handle === null ? null : $this->invoke($this->handle, $model);
    }

    public function runBefore(array $models): mixed
    {
        return $this->before === null ? null : ($this->before)($models, $this);
    }

    public function runAfter(array $models, array $results): mixed
    {
        return $this->after === null ? null : ($this->after)($models, $results, $this);
    }

    public function successResponse(array $payload): mixed
    {
        return $this->success === null ? $payload : ($this->success)($payload, $this);
    }

    public function errorResponse(Throwable $exception, array $payload): mixed
    {
        return $this->error === null ? $payload : ($this->error)($exception, $payload, $this);
    }

    private function invoke(Closure $callback, ?Model $model): mixed
    {
        $parameters = (new ReflectionFunction($callback))->getParameters();

        if ($parameters === []) {
            return $callback();
        }

        if ($model === null && $parameters[0]->hasType() && ! $parameters[0]->allowsNull()) {
            return null;
        }

        if (count($parameters) === 1) {
            return $callback($model);
        }

        $secondType = $parameters[1]->getType();
        $secondArg = $secondType instanceof ReflectionNamedType && $secondType->getName() === Url::class
            ? new Url()
            : $this;

        return $callback($model, $secondArg);
    }
}
