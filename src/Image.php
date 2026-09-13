<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\URL;
use JsonSerializable;
use Zonvoir\InertiaTable\Enums\ImagePosition;
use Zonvoir\InertiaTable\Enums\ImageSize;

final class Image implements Arrayable, JsonSerializable
{
    /**
     * @var list<string>
     */
    private array $urls = [];

    private ?string $icon = null;

    private ImageSize $size = ImageSize::Medium;

    private ?int $width = null;

    private ?int $height = null;

    private bool $rounded = false;

    private ImagePosition $position = ImagePosition::Start;

    /**
     * @var list<string>
     */
    private array $classes = [];

    private string $alt = '';

    private string $title = '';

    private ?int $limit = null;

    public static function make(): self
    {
        return new self();
    }

    /**
     * @param  string|array<int, string>  $url
     */
    public function url(string|array $url): self
    {
        $this->urls = is_array($url)
            ? array_values(array_filter($url, static fn (string $value): bool => trim($value) !== ''))
            : (trim($url) === '' ? [] : [$url]);

        return $this;
    }

    /**
     * @param  string|array<int, string>  $url
     */
    public function to(string|array $url): self
    {
        return $this->url($url);
    }

    public function route(string $name, mixed $parameters = []): self
    {
        return $this->url(route($name, $parameters));
    }

    public function signedRoute(string $name, mixed $parameters = []): self
    {
        return $this->url(URL::signedRoute($name, $parameters));
    }

    public function temporarySignedRoute(string $name, DateTimeInterface $expiration, mixed $parameters = []): self
    {
        return $this->url(URL::temporarySignedRoute($name, $expiration, $parameters));
    }

    public function rounded(bool $rounded = true): self
    {
        $this->rounded = $rounded;

        return $this;
    }

    public function size(ImageSize $size): self
    {
        $this->size = $size;

        return $this;
    }

    public function small(): self
    {
        return $this->size(ImageSize::Small);
    }

    public function medium(): self
    {
        return $this->size(ImageSize::Medium);
    }

    public function large(): self
    {
        return $this->size(ImageSize::Large);
    }

    public function extraLarge(): self
    {
        return $this->size(ImageSize::ExtraLarge);
    }

    public function position(ImagePosition $position): self
    {
        $this->position = $position;

        return $this;
    }

    public function start(): self
    {
        return $this->position(ImagePosition::Start);
    }

    public function end(): self
    {
        return $this->position(ImagePosition::End);
    }

    public function width(int $width): self
    {
        $this->width = $width;

        return $this;
    }

    public function height(int $height): self
    {
        $this->height = $height;

        return $this;
    }

    public function dimensions(int $width, int $height): self
    {
        return $this->width($width)->height($height);
    }

    public function class(string $class): self
    {
        $class = trim($class);

        if ($class !== '') {
            $this->classes[] = $class;
        }

        return $this;
    }

    public function alt(string $alt): self
    {
        $this->alt = $alt;

        return $this;
    }

    public function title(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function limit(int $limit): self
    {
        $this->limit = max(0, $limit);

        return $this;
    }

    /**
     * @return array{
     *     url: ?string,
     *     urls: list<string>,
     *     icon: ?string,
     *     size: string,
     *     width: ?int,
     *     height: ?int,
     *     rounded: bool,
     *     position: string,
     *     class: string,
     *     alt: string,
     *     title: string,
     *     limit: ?int
     * }
     */
    public function toArray(): array
    {
        return [
            'url' => count($this->urls) === 1 ? $this->urls[0] : null,
            'urls' => count($this->urls) > 1 ? $this->urls : [],
            'icon' => $this->icon,
            'size' => $this->size->value,
            'width' => $this->width,
            'height' => $this->height,
            'rounded' => $this->rounded,
            'position' => $this->position->value,
            'class' => implode(' ', $this->classes),
            'alt' => $this->alt,
            'title' => $this->title,
            'limit' => $this->limit,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
