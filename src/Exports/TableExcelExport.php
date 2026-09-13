<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use RuntimeException;
use Zonvoir\InertiaTable\Columns\Column;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\ExportRequest;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableRequest;

final class TableExcelExport implements FromQuery, ShouldAutoSize, WithColumnFormatting, WithEvents, WithHeadings, WithMapping, WithStyles
{
    /** @var list<Column>|null */
    private ?array $columns = null;

    private ?Table $table = null;

    private ?Export $export = null;

    /**
     * @param  class-string<Table>  $tableClass
     * @param  array<string, mixed>  $tableRequestInput
     * @param  list<int|string>  $selectedKeys
     */
    public function __construct(
        private string $tableClass,
        private string $exportKey,
        private array $tableRequestInput = [],
        private array $selectedKeys = [],
    ) {
    }

    public static function fromRequest(Table $table, Export $export, ExportRequest $request): self
    {
        return new self(
            $table::class,
            $export->keyName(),
            $request->tableRequestInput($table),
            $request->selectedKeys(),
        );
    }

    /**
     * @return array{tableClass: class-string<Table>, exportKey: string, tableRequestInput: array<string, mixed>, selectedKeys: list<int|string>}
     */
    public function __serialize(): array
    {
        return [
            'tableClass' => $this->tableClass,
            'exportKey' => $this->exportKey,
            'tableRequestInput' => $this->tableRequestInput,
            'selectedKeys' => $this->selectedKeys,
        ];
    }

    /**
     * @param  array{tableClass: class-string<Table>, exportKey: string, tableRequestInput?: array<string, mixed>, selectedKeys?: list<int|string>}  $data
     */
    public function __unserialize(array $data): void
    {
        $this->tableClass = $data['tableClass'];
        $this->exportKey = $data['exportKey'];
        $this->tableRequestInput = $data['tableRequestInput'] ?? [];
        $this->selectedKeys = $data['selectedKeys'] ?? [];
        $this->columns = null;
        $this->table = null;
        $this->export = null;
    }

    public function query(): Builder
    {
        $table = $this->table();
        $export = $this->export($table);
        $query = $table->query();

        if ($export->isLimitedToFilteredRows()) {
            $query = $table->apply($query, TableRequest::fromArray($this->tableRequestInput));
        }

        if ($export->isLimitedToSelectedRows()) {
            $keyName = $table->rowSelectionKey() ?? $query->getModel()->getKeyName();

            if ($this->selectedKeys === []) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereIn($keyName, $this->selectedKeys);
            }
        }

        $this->ensureDeterministicOrder($query);

        return $query;
    }

    /**
     * @return list<string>
     */
    public function headings(): array
    {
        return array_map(
            static fn (Column $column): string => $column->resolvedExportLabel(),
            $this->columns(),
        );
    }

    /**
     * @return list<mixed>
     */
    public function map(mixed $row): array
    {
        return array_map(
            static fn (Column $column): mixed => $column->resolveExportValue($row),
            $this->columns(),
        );
    }

    /**
     * @return array<string, string>
     */
    public function columnFormats(): array
    {
        $formats = [];

        foreach ($this->columns() as $index => $column) {
            $format = $column->resolvedExportFormat();

            if ($format === null) {
                continue;
            }

            $formats[Coordinate::stringFromColumnIndex($index + 1)] = $format;
        }

        return $formats;
    }

    /**
     * @return array<int|string, array<string, mixed>>|null
     */
    public function styles(Worksheet $sheet): ?array
    {
        $styles = [];

        foreach ($this->columns() as $index => $column) {
            $style = $column->resolvedExportStyle($sheet);

            if ($style === null || $style === []) {
                continue;
            }

            $styles[Coordinate::stringFromColumnIndex($index + 1)] = $style;
        }

        return $styles === [] ? null : $styles;
    }

    public function registerEvents(): array
    {
        return $this->export($this->table())->eventsDefinition();
    }

    /**
     * @return list<Column>
     */
    private function columns(): array
    {
        if ($this->columns !== null) {
            return $this->columns;
        }

        return $this->columns = array_values(array_filter(
            $this->table()->columnsDefinition(),
            static fn (Column $column): bool => $column->isExportable(),
        ));
    }

    private function table(): Table
    {
        return $this->table ??= app($this->tableClass);
    }

    private function export(Table $table): Export
    {
        if ($this->export !== null) {
            return $this->export;
        }

        foreach ($table->exportsDefinition() as $export) {
            if ($export->keyName() === $this->exportKey) {
                return $this->export = $export;
            }
        }

        throw new RuntimeException("Export [{$this->exportKey}] could not be resolved for [{$this->tableClass}].");
    }

    private function ensureDeterministicOrder(Builder $query): void
    {
        $keyName = $query->getModel()->getKeyName();
        $qualifiedKeyName = $query->getModel()->getQualifiedKeyName();

        foreach (($query->getQuery()->orders ?? []) as $order) {
            $column = $order['column'] ?? null;

            if ($column === $keyName || $column === $qualifiedKeyName) {
                return;
            }
        }

        $query->orderBy($qualifiedKeyName);
    }
}
