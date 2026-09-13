<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests\Fixtures;

use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;

final class DefaultSearchPostsTable extends Table
{
    protected ?string $resource = TestPost::class;

    protected array|string|null $search = ['title', 'author.name'];

    public function columns(): array
    {
        return [
            TextColumn::make('title')->searchable()->sortable(),
            TextColumn::make('author.name')->key('author')->searchable()->sortable(),
            TextColumn::make('status'),
        ];
    }
}
