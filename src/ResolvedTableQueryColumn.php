<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Closure;

final readonly class ResolvedTableQueryColumn
{
    public function __construct(
        private string $key,
        private string $field,
        private bool $searchable,
        private bool $sortable,
        private ?Closure $searchCallback = null,
        private ?Closure $sortCallback = null,
    ) {
    }

    public function key(): string
    {
        return $this->key;
    }

    public function field(): string
    {
        return $this->field;
    }

    public function isSearchable(): bool
    {
        return $this->searchable;
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function searchCallback(): ?Closure
    {
        return $this->searchCallback;
    }

    public function sortCallback(): ?Closure
    {
        return $this->sortCallback;
    }

    /**
     * @return array{
     *     key: string,
     *     field: string,
     *     searchable: bool,
     *     sortable: bool,
     *     hasCustomSearchCallback: bool,
     *     hasCustomSortCallback: bool
     * }
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'field' => $this->field,
            'searchable' => $this->searchable,
            'sortable' => $this->sortable,
            'hasCustomSearchCallback' => $this->searchCallback !== null,
            'hasCustomSortCallback' => $this->sortCallback !== null,
        ];
    }
}
