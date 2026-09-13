<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Zonvoir\InertiaTable\Contracts\TableState as TableStateContract;
use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;

final readonly class TableState implements TableStateContract
{
    public function __construct(
        private int $page = 1,
        private int $perPage = 15,
        private ?string $cursor = null,
        private ?string $search = null,
        private ?string $sort = null,
        private Direction $direction = Direction::ASCENDING,
        private array $columns = [],
        private array $sticky = [],
        private bool $hasStickyOverride = false,
    ) {
        if ($this->page < 1) {
            throw InertiaTableException::invalidPage();
        }

        if ($this->perPage < 1) {
            throw InertiaTableException::invalidPerPage();
        }
    }

    /**
     * @param  array<string, mixed>  $state
     */
    public static function fromArray(array $state, ?PaginationConfiguration $pagination = null): self
    {
        $pagination ??= PaginationConfiguration::make();
        $sort = $state['sort'] ?? null;
        $direction = $state['direction'] ?? Direction::ASCENDING;

        if (is_array($sort)) {
            $direction = $sort['direction'] ?? $direction;
            $sort = $sort['column'] ?? null;
        }

        return new self(
            page: $pagination->normalizePage($state['page'] ?? 1),
            perPage: $pagination->normalizePerPage($state['perPage'] ?? $pagination->defaultPerPage()),
            cursor: $pagination->normalizeCursor($state['cursor'] ?? null),
            search: self::normalizeNullableString($state['search'] ?? null),
            sort: self::normalizeNullableString($sort),
            direction: self::normalizeDirection($direction),
            columns: self::normalizeColumns($state['columns'] ?? []),
            sticky: self::normalizeColumns($state['sticky'] ?? []),
            hasStickyOverride: array_key_exists('sticky', $state),
        );
    }

    /**
     * @param  array<string, mixed>  $state
     */
    public function merge(array $state, ?PaginationConfiguration $pagination = null): self
    {
        if ($pagination !== null) {
            $pagination = PaginationConfiguration::make(
                enabled: $pagination->enabled(),
                type: $pagination->type(),
                defaultPerPage: $this->perPage,
                perPageOptions: $pagination->perPageOptions(),
                scrollToTop: $pagination->scrollToTop(),
            );
        }

        $baseState = array_replace($this->toArray(), [
            'columns' => $this->columns,
        ]);

        if ($this->hasStickyOverride) {
            $baseState['sticky'] = $this->sticky;
        }

        return self::fromArray(array_replace($baseState, $state), $pagination);
    }

    public function page(): int
    {
        return $this->page;
    }

    public function perPage(): int
    {
        return $this->perPage;
    }

    public function cursor(): ?string
    {
        return $this->cursor;
    }

    public function sort(): ?string
    {
        return $this->sort;
    }

    public function search(): ?string
    {
        return $this->search;
    }

    public function direction(): string
    {
        return $this->direction->value;
    }

    /**
     * @return list<string>
     */
    public function columns(): array
    {
        return $this->columns;
    }

    /**
     * @return list<string>
     */
    public function sticky(): array
    {
        return $this->sticky;
    }

    public function hasStickyOverride(): bool
    {
        return $this->hasStickyOverride;
    }

    /**
     * @return array{
     *     page: int,
     *     perPage: int,
     *     cursor: ?string,
     *     search: ?string,
     *     sort: ?string,
     *     direction: string
     * }
     */
    public function toArray(): array
    {
        return [
            'page' => $this->page,
            'perPage' => $this->perPage,
            'cursor' => $this->cursor,
            'search' => $this->search,
            'sort' => $this->sort,
            'direction' => $this->direction(),
        ];
    }

    private static function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * @return list<string>
     */
    private static function normalizeColumns(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $columns = [];

        foreach ($value as $column) {
            if (! is_string($column)) {
                continue;
            }

            $column = trim($column);

            if ($column === '') {
                continue;
            }

            $columns[] = $column;
        }

        return array_values(array_unique($columns));
    }

    private static function normalizeDirection(mixed $value): Direction
    {
        if ($value instanceof Direction) {
            return $value;
        }

        if (! is_string($value)) {
            return Direction::ASCENDING;
        }

        return Direction::tryFrom(strtolower(trim($value))) ?? Direction::ASCENDING;
    }

}
