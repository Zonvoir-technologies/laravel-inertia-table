<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableQueryMetadataResolver;
use Zonvoir\InertiaTable\Tests\Fixtures\DefaultSearchPostsTable;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;

it('resolves query metadata from declared columns and extra search fields', function (): void {
    $metadata = (new TableQueryMetadataResolver())->resolve(DefaultSearchPostsTable::make());
    $fields = array_map(static fn ($column): string => $column->field(), $metadata->columns());

    expect($fields)->toContain('title', 'author.name')
        ->and($metadata->sortableColumn('title'))->not->toBeNull()
        ->and(array_map(static fn ($column): string => $column->field(), $metadata->searchableColumns()))->toContain('title', 'author.name');
});

it('adds declared search fields that are not visible columns', function (): void {
    $table = new class () extends Table {
        protected ?string $resource = TestPost::class;

        protected array|string|null $search = ['hidden_field'];

        public function columns(): array
        {
            return [TextColumn::make('title')];
        }
    };

    $fields = array_map(static fn ($column): string => $column->field(), (new TableQueryMetadataResolver())->resolve($table)->searchableColumns());

    expect($fields)->toContain('hidden_field');
});
