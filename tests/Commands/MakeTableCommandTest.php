<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Commands\MakeTableCommand;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    cleanupTestFiles();
});

afterEach(function (): void {
    cleanupTestFiles();
});

it('defines the make table command signature, model option, and path option', function (): void {
    $command = app(MakeTableCommand::class);

    expect($command->getName())->toBe('make:zon-table')
        ->and($command->getDescription())->toBe('Create a new Zonvoir table class')
        ->and($command->getDefinition()->hasOption('model'))->toBeTrue()
        ->and($command->getDefinition()->getOption('model')->getShortcut())->toBe('m')
        ->and($command->getDefinition()->hasOption('path'))->toBeTrue();
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
});

it('generates a table from a direct path in the argument with backslashes', function (): void {
    $this->artisan('make:zon-table', ['name' => 'app\controller\fnksdnf\UserTable'])
        ->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class UserTable extends Table',
    );
});

it('generates a table from a direct path in the argument with forward slashes', function (): void {
    $this->artisan('make:zon-table', ['name' => 'app/controller/fnksdnf/UserTable'])
        ->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class UserTable extends Table',
    );
});

it('generates a table from a direct root namespace in the argument', function (): void {
    $this->artisan('make:zon-table', ['name' => 'App\controller\fnksdnf\UserTable'])
        ->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class UserTable extends Table',
    );
});

it('generates a table with model using a direct path in the argument', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'app\controller\fnksdnf\UserTable',
        '--model' => 'User',
    ])->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');
    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'use App\Models\User;',
        'class UserTable extends Table',
        'protected ?string $resource = User::class;',
    );
});

it('generates a table using the --path option starting with app/', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'UserTable',
        '--path' => 'app/controller/fnksdnf',
    ])->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class UserTable extends Table',
    );
});

it('generates a table using the --path option without leading app/', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'UserTable',
        '--path' => 'controller/fnksdnf',
    ])->assertSuccessful();

    $path = app_path('controller/fnksdnf/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class UserTable extends Table',
    );
});

it('generates a nested table using the --path option', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'Admin/UserTable',
        '--path' => 'app/controller/fnksdnf',
    ])->assertSuccessful();

    $path = app_path('controller/fnksdnf/Admin/UserTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf\Admin;',
        'class UserTable extends Table',
    );
});

it('generates a table using --path and --model together', function (): void {
    $this->artisan('make:zon-table', [
        'name' => 'UserTable',
        '--path' => 'app/DataTables',
        '--model' => 'User',
    ])->assertSuccessful();

    $path = app_path('DataTables/UserTable.php');
    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\DataTables;',
        'use App\Models\User;',
        'class UserTable extends Table',
        'protected ?string $resource = User::class;',
    );
});

it('respects tables_path configured in zonvoir-table config', function (): void {
    config(['zonvoir-table.tables_path' => 'app/CustomTables']);

    $this->artisan('make:zon-table', ['name' => 'OrdersTable'])
        ->assertSuccessful();

    $path = app_path('CustomTables/OrdersTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\CustomTables;',
        'class OrdersTable extends Table',
    );
});

it('derives namespace and directory when tables_path does not have app/ prefix', function (): void {
    config(['zonvoir-table.tables_path' => 'CustomNamespace']);

    $this->artisan('make:zon-table', ['name' => 'OrdersTable'])
        ->assertSuccessful();

    $path = app_path('CustomNamespace/OrdersTable.php');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\CustomNamespace;',
        'class OrdersTable extends Table',
    );
});

it('prefers the --path option over configuration', function (): void {
    config(['zonvoir-table.tables_path' => 'app/ConfigTables']);

    $this->artisan('make:zon-table', [
        'name' => 'InvoicesTable',
        '--path' => 'app/OverrideTables',
    ])->assertSuccessful();

    $path = app_path('OverrideTables/InvoicesTable.php');

    expect(file_exists($path))->toBeTrue();
    expect(file_exists(app_path('ConfigTables/InvoicesTable.php')))->toBeFalse();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\OverrideTables;',
        'class InvoicesTable extends Table',
    );
});

it('prefers a direct argument path over configuration', function (): void {
    config(['zonvoir-table.tables_path' => 'app/ConfigTables']);

    $this->artisan('make:zon-table', [
        'name' => 'app\controller\fnksdnf\DirectTable',
    ])->assertSuccessful();

    $path = app_path('controller/fnksdnf/DirectTable.php');

    expect(file_exists($path))->toBeTrue();
    expect(file_exists(app_path('ConfigTables/DirectTable.php')))->toBeFalse();

    $contents = file_get_contents($path);

    expect($contents)->toContain(
        'namespace App\controller\fnksdnf;',
        'class DirectTable extends Table',
    );
});

function generatedTablePath(string $file): string
{
    return app_path('Tables/' . str_replace('/', DIRECTORY_SEPARATOR, $file));
}

function cleanupTestFiles(): void
{
    $targets = [
        app_path('Tables/PostsTable.php'),
        app_path('Tables/UsersTable.php'),
        app_path('Tables/Admin/PostsTable.php'),
        app_path('controller/fnksdnf/UserTable.php'),
        app_path('controller/fnksdnf/Admin/UserTable.php'),
        app_path('controller/fnksdnf/DirectTable.php'),
        app_path('DataTables/UserTable.php'),
        app_path('CustomTables/OrdersTable.php'),
        app_path('CustomNamespace/OrdersTable.php'),
        app_path('OverrideTables/InvoicesTable.php'),
        app_path('ConfigTables/InvoicesTable.php'),
        app_path('ConfigTables/DirectTable.php'),
    ];

    foreach ($targets as $target) {
        if (file_exists($target)) {
            unlink($target);
        }

        $directory = dirname($target);
        while ($directory !== app_path() && is_dir($directory) && count(scandir($directory) ?: []) === 2) {
            rmdir($directory);
            $directory = dirname($directory);
        }
    }
}
