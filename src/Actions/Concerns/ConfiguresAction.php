<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Actions\Concerns;

use Closure;
use Zonvoir\InertiaTable\Enums\ButtonVariant;
use Zonvoir\InertiaTable\Enums\TableColor;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Url;

trait ConfiguresAction
{
    public function name(string|callable $name): self
    {
        if (is_string($name) && $name === '') {
            throw InertiaTableException::actionNameRequired();
        }

        $this->name = is_string($name) ? $name : Closure::fromCallable($name);

        return $this;
    }

    public function key(?string $key): self
    {
        $this->key = $key;

        return $this;
    }

    public function url(string|Url|callable|array|null $url): self
    {
        if ($url !== null) {
            $this->url = is_callable($url) && ! is_string($url) ? Closure::fromCallable($url) : $url;
        }

        return $this;
    }

    public function handle(?callable $handle): self
    {
        if ($handle !== null) {
            $this->handle = Closure::fromCallable($handle);
        }

        return $this;
    }

    public function authorize(bool $authorize = true): self
    {
        $this->authorize = $authorize;

        return $this;
    }

    public function disabled(bool $disabled = true): self
    {
        $this->disabled = $disabled;

        return $this;
    }

    public function hidden(bool $hidden = true): self
    {
        $this->hidden = $hidden;

        return $this;
    }

    public function disabledAndHidden(bool $condition = true): self
    {
        return $this->disabled($condition)->hidden($condition);
    }

    public function asBulkAction(int $chunkSize = 100, string $strategy = 'chunkById'): self
    {
        $this->setBulkConfiguration(true, $this->onlyBulk, $chunkSize, $strategy);

        return $this;
    }

    public function onlyAsBulkAction(int $chunkSize = 100, string $strategy = 'chunkById'): self
    {
        $this->setBulkConfiguration(true, true, $chunkSize, $strategy);

        return $this;
    }

    public function before(callable $callback): self
    {
        $this->before = Closure::fromCallable($callback);

        return $this;
    }

    public function after(callable $callback): self
    {
        $this->after = Closure::fromCallable($callback);

        return $this;
    }

    public function success(callable $callback): self
    {
        $this->success = Closure::fromCallable($callback);

        return $this;
    }

    public function error(callable $callback): self
    {
        $this->error = Closure::fromCallable($callback);

        return $this;
    }

    public function confirm(
        bool|string|callable|array $title = true,
        string|callable|null $message = null,
        string|callable|null $confirmButton = null,
        string|callable|null $cancelButton = null
    ): self {
        if (is_bool($title)) {
            $this->confirm = $title;
        } elseif (is_array($title)) {
            $this->confirm = array_map(
                static fn (mixed $value): mixed => is_callable($value) && ! is_string($value)
                    ? Closure::fromCallable($value)
                    : $value,
                $title
            );
        } elseif ($title instanceof Closure || (is_callable($title) && ! is_string($title))) {
            if ($message === null && $confirmButton === null && $cancelButton === null) {
                $this->confirm = Closure::fromCallable($title);
            } else {
                $this->confirm = [
                    'title' => Closure::fromCallable($title),
                    'message' => is_callable($message) && ! is_string($message) ? Closure::fromCallable($message) : $message,
                    'confirmButton' => is_callable($confirmButton) && ! is_string($confirmButton) ? Closure::fromCallable($confirmButton) : $confirmButton,
                    'cancelButton' => is_callable($cancelButton) && ! is_string($cancelButton) ? Closure::fromCallable($cancelButton) : $cancelButton,
                ];
            }
        } else {
            $this->confirm = [
                'title' => $title,
                'message' => is_callable($message) && ! is_string($message) ? Closure::fromCallable($message) : $message,
                'confirmButton' => is_callable($confirmButton) && ! is_string($confirmButton) ? Closure::fromCallable($confirmButton) : $confirmButton,
                'cancelButton' => is_callable($cancelButton) && ! is_string($cancelButton) ? Closure::fromCallable($cancelButton) : $cancelButton,
            ];
        }

        return $this;
    }

    public function icon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function tooltip(?string $tooltip): self
    {
        $this->tooltip = $tooltip;

        return $this;
    }

    public function showLabel(bool $showLabel = true): self
    {
        $this->showLabel = $showLabel;

        return $this;
    }

    public function hideLabel(): self
    {
        return $this->showLabel(false);
    }

    public function variant(string|ButtonVariant|null $variant): self
    {
        $this->variant = $variant instanceof ButtonVariant ? $variant->value : $variant;

        return $this;
    }

    public function variantColor(string|TableColor|null $variantColor): self
    {
        $this->variantColor = $variantColor instanceof TableColor ? $variantColor->value : $variantColor;

        return $this;
    }

    public function asInfoButton(): self
    {
        return $this->variantColor('blue');
    }

    public function asSuccessButton(): self
    {
        return $this->variantColor('green');
    }

    public function asDangerButton(): self
    {
        return $this->variantColor('red');
    }

    public function class(?string $class): self
    {
        $this->class = $class;

        return $this;
    }

    public function meta(array $meta): self
    {
        $this->meta = array_replace($this->meta, $meta);

        return $this;
    }

    public function data(array $data): self
    {
        $this->data = array_replace($this->data, $data);

        return $this;
    }

    private function setBulkConfiguration(
        bool $bulk,
        bool $onlyBulk,
        int $chunkSize,
        string $chunkStrategy
    ): void {
        $this->bulk = $bulk;
        $this->onlyBulk = $onlyBulk;
        $this->chunkSize = max(1, $chunkSize);
        $this->chunkStrategy = in_array($chunkStrategy, ['chunkById', 'chunk'], true) ? $chunkStrategy : 'chunkById';
    }

    private function setLifecycleCallbacks(
        ?callable $before,
        ?callable $after,
        ?callable $success,
        ?callable $error
    ): void {
        $this->before = $before !== null ? Closure::fromCallable($before) : null;
        $this->after = $after !== null ? Closure::fromCallable($after) : null;
        $this->success = $success !== null ? Closure::fromCallable($success) : null;
        $this->error = $error !== null ? Closure::fromCallable($error) : null;
    }
}
