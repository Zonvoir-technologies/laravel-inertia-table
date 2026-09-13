<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Http\Request;

final readonly class TableRequest
{
    /**
     * @param  array<string, mixed>  $input
     */
    private function __construct(
        private array $input,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self($request->query());
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public static function fromArray(array $input): self
    {
        return new self($input);
    }

    /**
     * @return array<string, mixed>
     */
    public function for(Table $table): array
    {
        if ($table->isNamed()) {
            $state = $this->input[$table->name()] ?? [];

            return is_array($state) ? $state : [];
        }

        $state = array_intersect_key($this->input, array_flip([
            'page',
            'perPage',
            'cursor',
            'search',
            'sort',
            'direction',
            'columns',
            'sticky',
        ]));

        if ($state !== []) {
            return $state;
        }

        $legacyState = $this->input[$table->name()] ?? [];

        return is_array($legacyState) ? $legacyState : [];
    }
}
