<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\Column;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Tests\Fixtures\PostsTable;

it('creates package exceptions', function (): void {
    expect(InertiaTableException::actionNameRequired()->getMessage())->toBe('Action name cannot be empty.');
});

it('creates table definition and resource exception messages', function (): void {
    expect(InertiaTableException::emptyTableName()->getMessage())->toBe('Table name cannot be empty.')
        ->and(InertiaTableException::invalidTableDefinition(PostsTable::class, 'columns', Column::class, 2)->getMessage())->toContain('Invalid entry at index 2')
        ->and(InertiaTableException::missingTableResource(PostsTable::class)->getMessage())->toContain('does not define a resource')
        ->and(InertiaTableException::invalidTableResource(PostsTable::class, [])->getMessage())->toContain('array');
});

it('creates pagination exception messages', function (): void {
    expect(InertiaTableException::invalidPage()->getMessage())->toContain('page')
        ->and(InertiaTableException::invalidPerPage()->getMessage())->toContain('perPage')
        ->and(InertiaTableException::invalidPerPageOption('bad')->getMessage())->toContain('bad')
        ->and(InertiaTableException::emptyPerPageOptions()->getMessage())->toContain('cannot be empty')
        ->and(InertiaTableException::defaultPerPageNotAllowed(25, [10, 20])->getMessage())->toContain('25');
});
