<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Closure;
use Illuminate\Support\Str;
use Illuminate\Support\Traits\Conditionable;
use JsonSerializable;
use Zonvoir\InertiaTable\Actions\Concerns\ConfiguresAction;
use Zonvoir\InertiaTable\Actions\Concerns\ExecutesAction;
use Zonvoir\InertiaTable\Actions\Concerns\SerializesAction;
use Zonvoir\InertiaTable\Enums\ButtonVariant;
use Zonvoir\InertiaTable\Enums\TableColor;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;

final class Action implements JsonSerializable
{
    use Conditionable;
    use ConfiguresAction;
    use ExecutesAction;
    use SerializesAction;

    private string|Closure $name;

    private ?string $key = null;

    private string|Url|Closure|array|null $url = null;

    private ?Closure $handle = null;

    private bool $authorize = true;

    private bool $disabled = false;

    private bool $hidden = false;

    private bool $bulk = false;

    private bool $onlyBulk = false;

    private int $chunkSize = 100;

    private string $chunkStrategy = 'chunkById';

    private ?Closure $before = null;

    private ?Closure $after = null;

    private ?Closure $success = null;

    private ?Closure $error = null;

    private ?string $icon = null;

    private ?string $tooltip = null;

    private bool $showLabel = true;

    private ?string $variant = null;

    private ?string $variantColor = null;

    private ?string $class = null;

    private bool|array|Closure $confirm = false;

    private array $meta = [];

    private array $data = [];

    public function __construct(string|callable $name)
    {
        $this->name = is_string($name) ? $name : Closure::fromCallable($name);
    }

    public static function make(
        string|callable $name,
        ?string $key = null,
        string|Url|callable|array|null $url = null,
        ?callable $handle = null,
        bool $authorize = true,
        bool $disabled = false,
        bool $hidden = false,
        bool $bulk = false,
        bool $onlyBulk = false,
        int $chunkSize = 100,
        string $chunkStrategy = 'chunkById',
        ?callable $before = null,
        ?callable $after = null,
        ?callable $success = null,
        ?callable $error = null,
        ?string $icon = null,
        ?string $tooltip = null,
        string|ButtonVariant|null $variant = null,
        string|TableColor|null $variantColor = null,
        ?string $class = null,
        bool|array|callable $confirm = false,
        array $meta = [],
        array $data = [],
        bool $showLabel = true,
    ): self {

        if (is_string($name) && $name === '') {
            throw InertiaTableException::actionNameRequired();
        }

        $action = new self($name);

        $action->key($key);
        $action->url($url);
        $action->handle($handle);
        $action->authorize($authorize);
        $action->disabled($disabled);
        $action->hidden($hidden);
        $action->setBulkConfiguration($bulk, $onlyBulk, $chunkSize, $chunkStrategy);
        $action->setLifecycleCallbacks($before, $after, $success, $error);
        $action->icon($icon);
        $action->tooltip($tooltip);
        $action->showLabel($showLabel);
        $action->variant($variant);
        $action->variantColor($variantColor);
        $action->class($class);
        $action->confirm($confirm);
        $action->meta($meta);
        $action->data($data);

        return $action;
    }

    public static function create(
        string|callable $name,
        ?string $key = null,
        string|Url|callable|array|null $url = null,
        ?callable $handle = null,
        bool $authorize = true,
        bool $disabled = false,
        bool $hidden = false,
        bool $bulk = false,
        bool $onlyBulk = false,
        int $chunkSize = 100,
        string $chunkStrategy = 'chunkById',
        ?callable $before = null,
        ?callable $after = null,
        ?callable $success = null,
        ?callable $error = null,
        ?string $icon = null,
        ?string $tooltip = null,
        string|ButtonVariant|null $variant = null,
        string|TableColor|null $variantColor = null,
        ?string $class = null,
        bool|array|callable $confirm = false,
        array $meta = [],
        array $data = [],
        bool $showLabel = true,
    ): self {
        return self::make(
            $name,
            $key,
            $url,
            $handle,
            $authorize,
            $disabled,
            $hidden,
            $bulk,
            $onlyBulk,
            $chunkSize,
            $chunkStrategy,
            $before,
            $after,
            $success,
            $error,
            $icon,
            $tooltip,
            $variant,
            $variantColor,
            $class,
            $confirm,
            $meta,
            $data,
            $showLabel,
        );
    }

    public function keyName(): string
    {
        return $this->key ?? (is_string($this->name) ? Str::slug($this->name) : 'action');
    }
}
