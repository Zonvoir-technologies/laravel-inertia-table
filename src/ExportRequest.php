<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Http\Request;

final readonly class ExportRequest
{
    /**
     * @param  array<string, mixed>  $input
     */
    private function __construct(
        private Request $request,
        private array $input,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self($request, $request->all());
    }

    public function table(): string
    {
        return (string) ($this->input['table'] ?? '');
    }

    public function export(): string
    {
        return (string) ($this->input['export'] ?? '');
    }

    /**
     * @return list<int|string>
     */
    public function selectedKeys(): array
    {
        $keys = $this->input['keys'] ?? [];

        if (! is_array($keys)) {
            return [];
        }

        return array_values(array_filter(
            $keys,
            static fn (mixed $key): bool => is_int($key) || (is_string($key) && trim($key) !== ''),
        ));
    }

    /**
     * @return array<string, mixed>
     */
    public function state(): array
    {
        $state = $this->input['state'] ?? [];

        return is_array($state) ? $state : [];
    }

    /**
     * @return array<string, mixed>
     */
    public function tableRequestInput(Table $table): array
    {
        if ($table->isNamed()) {
            return [$table->name() => $this->state()];
        }

        return $this->state();
    }

    public function tableRequest(Table $table): TableRequest
    {
        return TableRequest::fromArray($this->tableRequestInput($table));
    }

    /**
     * @return array<string, mixed>
     */
    public function data(): array
    {
        $data = $this->input['data'] ?? [];

        return is_array($data) ? $data : [];
    }

    public function inertia(): bool
    {
        return $this->request->headers->has('X-Inertia');
    }

    public function baseRequest(): Request
    {
        return $this->request;
    }
}
