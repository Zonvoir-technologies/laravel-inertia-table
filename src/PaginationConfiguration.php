<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;

final readonly class PaginationConfiguration
{
    /**
     * @param  list<int>  $perPageOptions
     */
    public function __construct(
        private bool $enabled = true,
        private PaginationType $type = PaginationType::Standard,
        private int $defaultPerPage = 15,
        private array $perPageOptions = [15, 30, 50, 100],
        private bool $scrollToTop = true,
    ) {
        if ($this->defaultPerPage < 1) {
            throw InertiaTableException::invalidPerPage();
        }

        foreach ($this->perPageOptions as $perPageOption) {
            if ($perPageOption < 1) {
                throw InertiaTableException::invalidPerPageOption($perPageOption);
            }
        }

        if (! in_array($this->defaultPerPage, $this->perPageOptions, true)) {
            throw InertiaTableException::defaultPerPageNotAllowed($this->defaultPerPage, $this->perPageOptions);
        }
    }

    /**
     * @param  array<int, mixed>|null  $perPageOptions
     */
    public static function make(
        bool $enabled = true,
        PaginationType $type = PaginationType::Standard,
        int $defaultPerPage = 15,
        ?array $perPageOptions = null,
        bool $scrollToTop = true,
    ): self {
        $options = $perPageOptions ?? [15, 30, 50, 100];

        $normalizedOptions = [];

        foreach ($options as $option) {
            if (! is_int($option) && ! (is_string($option) && ctype_digit($option))) {
                throw InertiaTableException::invalidPerPageOption($option);
            }

            $normalizedOptions[] = (int) $option;
        }

        $normalizedOptions = array_values(array_unique($normalizedOptions));

        if ($normalizedOptions === []) {
            throw InertiaTableException::emptyPerPageOptions();
        }

        return new self(
            enabled: $enabled,
            type: $type,
            defaultPerPage: $defaultPerPage,
            perPageOptions: $normalizedOptions,
            scrollToTop: $scrollToTop,
        );
    }

    public function enabled(): bool
    {
        return $this->enabled;
    }

    public function type(): PaginationType
    {
        return $this->type;
    }

    public function defaultPerPage(): int
    {
        return $this->defaultPerPage;
    }

    /**
     * @return list<int>
     */
    public function perPageOptions(): array
    {
        return $this->perPageOptions;
    }

    public function scrollToTop(): bool
    {
        return $this->scrollToTop;
    }

    public function validPerPage(int $perPage): bool
    {
        return in_array($perPage, $this->perPageOptions, true);
    }

    public function normalizePage(mixed $page): int
    {
        if (! is_numeric($page)) {
            return 1;
        }

        $page = (int) $page;

        return $page > 0 ? $page : 1;
    }

    public function normalizePerPage(mixed $perPage): int
    {
        if (! is_numeric($perPage)) {
            return $this->defaultPerPage;
        }

        $perPage = (int) $perPage;

        return $this->validPerPage($perPage) ? $perPage : $this->defaultPerPage;
    }

    public function normalizeCursor(mixed $cursor): ?string
    {
        if (! is_string($cursor)) {
            return null;
        }

        $cursor = trim($cursor);

        return $cursor === '' ? null : $cursor;
    }

    /**
     * @return array{
     *     enabled: bool,
     *     type: string,
     *     defaultPerPage: int,
     *     perPageOptions: list<int>,
     *     scrollToTop: bool
     * }
     */
    public function toArray(): array
    {
        return [
            'enabled' => $this->enabled,
            'type' => $this->type->value,
            'defaultPerPage' => $this->defaultPerPage,
            'perPageOptions' => $this->perPageOptions,
            'scrollToTop' => $this->scrollToTop,
        ];
    }
}
