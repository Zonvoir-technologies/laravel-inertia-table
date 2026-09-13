<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

use Zonvoir\InertiaTable\Enums\ColumnAlignment;

final class ActionColumn extends Column
{
    protected function __construct(string $name = 'actions')
    {
        parent::__construct($name);

        $this->alignment = ColumnAlignment::Center;
    }

    public static function make(mixed ...$args): static
    {
        $asDropdown = $args['asDropdown'] ?? false;
        unset($args['asDropdown']);

        if (! isset($args[0]) && ! array_key_exists('name', $args)) {
            $args['name'] = 'actions';
        }

        $column = parent::make(...$args);

        return $asDropdown ? $column->asDropdown() : $column;
    }

    public static function create(mixed ...$args): static
    {
        return static::make(...$args);
    }

    public function asDropdown(bool $asDropdown = true): static
    {
        return $this->meta([
            'asDropdown' => $asDropdown,
            'dropdown' => $asDropdown,
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $actions
     */
    public function actions(array $actions): ActionColumn
    {
        return $this->meta([
            'actions' => array_values($actions),
        ]);
    }

    /**
     * @param  array<string, mixed>  $action
     */
    public function addAction(array $action): ActionColumn
    {
        $actions = $this->meta['actions'] ?? [];
        $actions[] = $action;

        return $this->meta([
            'actions' => $actions,
        ]);
    }
}
