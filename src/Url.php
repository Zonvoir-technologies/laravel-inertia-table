<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\URL as UrlFactory;
use Illuminate\Support\Traits\Conditionable;
use JsonSerializable;
use Zonvoir\InertiaTable\Enums\HttpMethod;

final class Url implements Arrayable, JsonSerializable
{
    use Conditionable;

    private ?string $url = null;

    private bool $openInNewTab = false;

    private bool $preserveScroll = false;

    private bool $preserveState = false;

    private bool $download = false;

    private bool $disabled = false;

    private bool $hidden = false;

    private bool $modal = false;

    /** @var array{strategy: string, cacheFor: ?int}|null */
    private ?array $prefetch = null;

    private HttpMethod $method = HttpMethod::GET;

    public function route(string $name, mixed $parameters = [], bool $absolute = true): self
    {
        $this->url = route($name, $parameters, $absolute);

        return $this;
    }

    public function signedRoute(string $name, mixed $parameters = [], ?DateTimeInterface $expiration = null, bool $absolute = true): self
    {
        $this->url = UrlFactory::signedRoute($name, $parameters, $expiration, $absolute);

        return $this;
    }

    public function temporarySignedRoute(string $name, DateTimeInterface $expiration, mixed $parameters = [], bool $absolute = true): self
    {
        $this->url = UrlFactory::temporarySignedRoute($name, $expiration, $parameters, $absolute);

        return $this;
    }

    public function to(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function preserveScroll(bool $preserveScroll = true): self
    {
        $this->preserveScroll = $preserveScroll;

        return $this;
    }

    public function preserveState(bool $preserveState = true): self
    {
        $this->preserveState = $preserveState;

        return $this;
    }

    public function openInNewTab(bool $openInNewTab = true): self
    {
        $this->openInNewTab = $openInNewTab;

        return $this;
    }

    public function asDownload(bool $download = true): self
    {
        $this->download = $download;

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

    public function modal(bool $modal = true): self
    {
        $this->modal = $modal;

        return $this;
    }

    public function prefetch(string $strategy = 'default', ?int $cacheFor = null): self
    {
        $this->prefetch = [
            'strategy' => $strategy,
            'cacheFor' => $cacheFor,
        ];

        return $this;
    }

    public function method(string|HttpMethod $method): self
    {
        if ($method instanceof HttpMethod) {
            $this->method = $method;

            return $this;
        }

        $method = HttpMethod::tryFrom(strtolower($method));

        if ($method !== null) {
            $this->method = $method;
        }

        return $this;
    }

    public function value(): ?string
    {
        return $this->url;
    }

    public function shouldOpenInNewTab(): bool
    {
        return $this->openInNewTab;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        $url = [
            'url' => $this->url,
            'target' => $this->openInNewTab ? '_blank' : null,
        ];

        foreach ([
            'preserveScroll' => $this->preserveScroll,
            'preserveState' => $this->preserveState,
            'download' => $this->download,
            'disabled' => $this->disabled,
            'hidden' => $this->hidden,
            'modal' => $this->modal,
        ] as $key => $value) {
            if ($value) {
                $url[$key] = $value;
            }
        }

        if ($this->prefetch !== null) {
            $url['prefetch'] = $this->prefetch;
        }

        if ($this->method !== HttpMethod::GET) {
            $url['method'] = $this->method->value;
        }

        return $url;
    }

    /** @return array<string, mixed> */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function __toString(): string
    {
        return $this->url ?? '';
    }
}
