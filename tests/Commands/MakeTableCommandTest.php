<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Commands\MakeTableCommand;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    deleteGeneratedTable('PostsTable.php');
    deleteGeneratedTable('UsersTable.php');
});

afterEach(function (): void {
    deleteGeneratedTable('PostsTable.php');
    deleteGeneratedTable('UsersTable.php');
});

it('defines the make table command signature and model option', function (): void {
    $command = app(MakeTableCommand::class);

    expect($command->getName())->toBe('make:zon-table')
        ->and($command->getDescription())->toBe('Create a new Zonvoir table class')
        ->and($command->getDefinition()->hasOption('model'))->toBeTrue()
        ->and($command->getDefinition()->getOption('model')->getShortcut())->toBe('m');
});

it('generates a table class in the app tables namespace', function (): void {
    $this->artisan('make:zon-table', ['name' => 'PostsTable'])
        ->assertSuccessful();

    $path = generatedTablePath('PostsTable.php');

    expect(file_exists($path))->toBeTrue()
        ->and(file_get_contents($path))->toContain(
            'namespace App\Tables;',
            'use Zonvoir\InertiaTable\Action;',
            'use Zonvoir\InertiaTable\Columns;',
            'use Zonvoir\InertiaTable\Table;',
            'class PostsTable extends Table',
            'public function columns(): array',
            'public function actions(): array',
            'public function exports(): array',
        )
        ->and(file_get_contents($path))->not->toContain('protected ?string $resource');
});

it('generates a table class with a model resource when model option is passed', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'UsersTable',
        '--model' => 'User',
    ])->assertSuccessful();

    $contents = file_get_contents(generatedTablePath('UsersTable.php'));

    expect($contents)->toContain(
        'namespace App\Tables;',
        'use App\Models\User;',
        'class UsersTable extends Table',
        'protected ?string $resource = User::class;',
    );
});

it('generates nested table namespaces from slash separated names', function (): void {
    $this->artisan('make:zon-table', ['name' => 'Admin/PostsTable'])
        ->assertSuccessful();

    $path = generatedTablePath('Admin/PostsTable.php');
    $contents = file_get_contents($path);

    expect(file_exists($path))->toBeTrue()
        ->and($contents)->toContain(
            'namespace App\Tables\Admin;',
            'class PostsTable extends Table',
        );

    deleteGeneratedTable('Admin/PostsTable.php');
});

function generatedTablePath(string $file): string
{
    return app_path('Tables/' . str_replace('/', DIRECTORY_SEPARATOR, $file));
}

function deleteGeneratedTable(string $file): void
{
    $path = generatedTablePath($file);

    if (file_exists($path)) {
        unlink($path);
    }

    $directory = dirname($path);

    while ($directory !== app_path() && is_dir($directory) && count(scandir($directory) ?: []) === 2) {
        rmdir($directory);
        $directory = dirname($directory);
    }
}
