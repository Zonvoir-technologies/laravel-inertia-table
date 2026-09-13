<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Actions\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Zonvoir\InertiaTable\Url;

trait SerializesAction
{
    public function forRow(Model $model): ?array
    {
        if ($this->onlyBulk || $this->isHidden($model)) {
            return null;
        }

        return $this->serialize($model);
    }

    public function forBulk(): ?array
    {
        if (! $this->bulk || $this->isHidden(null)) {
            return null;
        }

        return $this->serialize(null);
    }

    public function toArray(): array
    {
        return $this->serialize(null);
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    private function serialize(?Model $model): array
    {
        $url = $this->resolveUrl($model);
        $authorized = $this->isAuthorized($model);
        $disabled = $this->isDisabled($model) || ! $authorized || (bool) ($url['disabled'] ?? false);
        $hidden = $this->isHidden($model) || (bool) ($url['hidden'] ?? false);

        return [
            'key' => $this->keyName(),
            'label' => $this->resolveName($model),
            'type' => $url !== null ? 'link' : ($this->handle !== null ? 'action' : 'custom'),
            'url' => $url,
            'endpoint' => $this->handle !== null ? route('zonvoir-table.actions.execute', absolute: false) : null,
            'bulk' => $this->bulk,
            'onlyBulk' => $this->onlyBulk,
            'authorized' => $authorized,
            'disabled' => $disabled,
            'hidden' => $hidden,
            'confirm' => $this->resolveConfirm($model),
            'icon' => $this->icon,
            'tooltip' => $this->tooltip,
            'showLabel' => $this->showLabel,
            'variant' => $this->variant,
            'variantColor' => $this->variantColor,
            'class' => $this->class,
            'meta' => $this->meta,
            'data' => $this->data,
            'chunkSize' => $this->chunkSize,
            'chunkStrategy' => $this->chunkStrategy,
        ];
    }

    private function resolveName(?Model $model): string
    {
        if ($this->name instanceof Closure) {
            $resolved = $this->invoke($this->name, $model);

            if (is_string($resolved)) {
                return $this->interpolate($resolved, $model);
            }

            return $this->keyName();
        }

        return $this->interpolate($this->name, $model);
    }

    private function resolveUrl(?Model $model): ?array
    {
        if ($this->url === null || ($model === null && $this->url instanceof Closure)) {
            return null;
        }

        $url = $this->url instanceof Closure ? $this->invoke($this->url, $model) : $this->url;

        if ($url instanceof Url) {
            return $url->toArray();
        }

        if (is_string($url)) {
            return (new Url())->to($url)->toArray();
        }

        return is_array($url) ? $url : null;
    }

    private function resolveConfirm(?Model $model): bool|array
    {
        $confirm = $this->confirm;

        if ($confirm instanceof Closure) {
            $confirm = $this->invoke($confirm, $model);
        }

        if (is_bool($confirm)) {
            return $confirm;
        }

        if (is_string($confirm)) {
            return [
                'title' => $this->interpolate($confirm, $model),
                'message' => null,
                'confirmButton' => null,
                'cancelButton' => null,
            ];
        }

        if (! is_array($confirm)) {
            return false;
        }

        return array_map(function (mixed $value) use ($model): mixed {
            if ($value instanceof Closure) {
                $value = $this->invoke($value, $model);
            }

            return is_string($value) ? $this->interpolate($value, $model) : $value;
        }, $confirm);
    }

    private function interpolate(string $value, ?Model $model): string
    {
        if ($model === null) {
            return $value;
        }

        return preg_replace_callback('/:([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/', static fn (array $matches): string => (string) data_get($model, $matches[1], $matches[0]), $value) ?? $value;
    }
}
