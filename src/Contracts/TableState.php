<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Contracts;

/**
 * Normalized state transported between backend and frontend table layers.
 */
interface TableState
{
    public function page(): int;

    public function perPage(): int;

    public function cursor(): ?string;

    public function search(): ?string;

    public function sort(): ?string;

    public function direction(): string;

    /**
     * @return list<string>
     */
    public function columns(): array;

    /**
     * @return list<string>
     */
    public function sticky(): array;

    public function hasStickyOverride(): bool;

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
    public function toArray(): array;
}
