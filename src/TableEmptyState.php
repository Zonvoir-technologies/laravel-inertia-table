<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

final class TableEmptyState implements Arrayable, JsonSerializable
{
    private ?string $title = null;

    private ?string $message = null;

    private ?string $icon = null;

    private ?Action $action = null;

    public static function make(
        ?string $title = 'No results found.',
        ?string $message = null,
        ?string $icon = null,
        ?Action $action = null,
    ): self {
        return (new self())
            ->title($title)
            ->message($message)
            ->icon($icon)
            ->action($action);
    }

    public static function create(
        ?string $title = null,
        ?string $message = null,
        ?string $icon = null,
        ?Action $action = null,
    ): self {
        return self::make($title, $message, $icon, $action);
    }

    public function title(?string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function message(?string $message): self
    {
        $this->message = $message;

        return $this;
    }

    public function icon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function action(?Action $action): self
    {
        $this->action = $action;

        return $this;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'icon' => $this->icon,
            'action' => $this->action?->toArray(),
        ];
    }

    /** @return array<string, mixed> */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
