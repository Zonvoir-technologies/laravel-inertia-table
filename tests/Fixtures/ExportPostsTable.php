<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests\Fixtures;

use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Table;

final class ExportPostsTable extends Table
{
    protected ?string $resource = TestPost::class;

    protected array|string|null $search = ['title'];

    public function columns(): array
    {
        return [
            TextColumn::make('title')->label('Title')->searchable()->sortable()->exportFormat('@')->exportStyle(['font' => ['bold' => true]]),
            TextColumn::make('status')->label('Status')->exportAs(static fn (mixed $value): string => strtoupper((string) $value)),
            TextColumn::make('votes')->dontExport(),
        ];
    }

    public function exports(): array
    {
        return [
            Export::make('Posts')->key('posts')->limitToSelectedRows()->events(['after' => 'listener']),
            Export::make('Filtered')->key('filtered')->limitToFilteredRows(),
        ];
    }
}
