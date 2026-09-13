<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Zonvoir\InertiaTable\Enums\Direction;

final readonly class TableNavigation
{
    public function __construct(
        private Table $table,
        private Contracts\TableState $state,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function page(int $page): array
    {
        $state = $this->state->toArray();
        $state['page'] = $this->table->pagination()->normalizePage($page);
        $state['cursor'] = null;

        return $this->queryStringState($state, includePage: true);
    }

    /**
     * @return array<string, mixed>
     */
    public function cursor(?string $cursor): array
    {
        $state = $this->state->toArray();
        $state['page'] = 1;
        $state['cursor'] = $this->table->pagination()->normalizeCursor($cursor);

        return $this->queryStringState($state, includePage: true, includeCursor: true);
    }

    /**
     * @return array<string, mixed>
     */
    public function perPage(int $perPage): array
    {
        $state = $this->state->toArray();
        $state['page'] = 1;
        $state['cursor'] = null;
        $state['perPage'] = $this->table->pagination()->normalizePerPage($perPage);

        return $this->queryStringState($state, includePage: true);
    }

    /**
     * @return array<string, mixed>
     */
    public function search(?string $search): array
    {
        $state = $this->state->toArray();
        $state['search'] = $this->normalizeNullableString($search);
        $state['page'] = 1;
        $state['cursor'] = null;

        return $this->queryStringState($state, includePage: true);
    }

    /**
     * @return array<string, mixed>
     */
    public function sort(?string $sort, string|Direction|null $direction = null): array
    {
        $state = $this->state->toArray();
        $state['sort'] = $this->normalizeNullableString($sort);
        $state['direction'] = $this->normalizeDirection($direction ?? $this->state->direction());

        return $this->queryStringState($state, includePage: true);
    }

    /**
     * @param  array<string, mixed>  $state
     * @return array<string, mixed>
     */
    private function queryStringState(array $state, bool $includePage = false, bool $includeCursor = false): array
    {
        if (! $includePage) {
            unset($state['page']);
        }

        if (! $includeCursor) {
            unset($state['cursor']);
        }

        if ((int) ($state['perPage'] ?? 0) === $this->table->pagination()->defaultPerPage()) {
            unset($state['perPage']);
        }

        if (($state['sort'] ?? null) === null) {
            unset($state['direction']);
        }

        $state = array_filter(
            $state,
            static fn (mixed $value): bool => $value !== null && $value !== '',
        );

        if ($this->table->isNamed()) {
            return [$this->table->name() => $state];
        }

        return $state;
    }

    private function normalizeNullableString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function normalizeDirection(string|Direction $value): string
    {
        if ($value instanceof Direction) {
            return $value->value;
        }

        return Direction::tryFrom(strtolower(trim($value)))?->value ?? Direction::ASCENDING->value;
    }
}
