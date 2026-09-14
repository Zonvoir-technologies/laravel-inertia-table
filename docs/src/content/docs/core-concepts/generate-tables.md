---
title: Generating Tables via Artisan
description: Scaffold boilerplate PHP table classes in Laravel using the make:zon-table Artisan command with optional model binding.
---

Zonvoir Table includes an Artisan command for quickly generating table classes.

## Generate a table

Run the `make:zon-table` command with the name of your table:

```bash
php artisan make:zon-table UsersTable
```

This creates a new table class inside:

```text
app/Tables/UsersTable.php
```

## Generate a table for a model

You can associate the table with an Eloquent model using the `--model` option:

```bash
php artisan make:zon-table UsersTable --model=User
```

This generates a table class with the model already configured:

```php
<?php

namespace App\Tables;

use App\Models\User;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    protected ?string $resource = User::class;

    public function columns(): array
    {
        return [
            //
        ];
    }

    public function actions(): array
    {
        return [
            //
        ];
    }

    public function exports(): array
    {
        return [
            //
        ];
    }
}
```

## Table name

The table name should use PascalCase and typically end with `Table`.

For example:

```bash
php artisan make:zon-table EmployeesTable --model=Employee
php artisan make:zon-table OrdersTable --model=Order
php artisan make:zon-table CustomersTable --model=Customer
```

## Model option

The `--model` option accepts the model class name:

```bash
php artisan make:zon-table UsersTable --model=User
```

You can also provide a namespaced model:

```bash
php artisan make:zon-table UsersTable --model="App\Models\User"
```

The generated `$resource` property tells Zonvoir Table which Eloquent model the table should query.

```php
protected ?string $resource = User::class;
```

## Custom directory and paths

You have multiple ways to generate tables in custom directories and namespaces.

### 1. Direct path in the table name

You can pass the full relative path directly in the command (using either forward slashes or backslashes):

```bash
php artisan make:zon-table app/Http/Controllers/UserTable
```

This generates the file directly at that location (e.g. `app/Http/Controllers/UserTable.php`) with the corresponding namespace (e.g. `app\Http\Controllers\`).

### 2. Using the `--path` option

You can also specify the target directory with the `--path` option:

```bash
php artisan make:zon-table UsersTable --path="app/DataTables"
```

You can omit the leading `app/` if you prefer:

```bash
php artisan make:zon-table UsersTable --path="DataTables"
```

You can combine `--path` with `--model`:

```bash
php artisan make:zon-table UsersTable --path="app/DataTables" --model=User
```

### 3. Configuring the default directory in config

To change the default directory for all future `make:zon-table` commands, publish the configuration file and set `tables_path` in `config/zonvoir-table.php`:

```php
'tables_path' => 'app/DataTables',
```

The table class namespace is automatically derived from this path (e.g. `App\DataTables`). Command-line options like `--path` or direct argument paths always take precedence over the configuration.

## Adding columns

After generating the table, define the columns you want to display inside `columns()`:

```php
public function columns(): array
{
    return [
        TextColumn::make('id', 'ID'),
        TextColumn::make('name', 'Name'),
        TextColumn::make('email', 'Email'),
    ];
}
```

You can then continue configuring sorting, column visibility, actions, pagination, exports, and other table features as needed.

## What's next?

Once your table has been generated, you can:

- Define your table columns
- Configure row and bulk actions
- Configure pagination and sorting
- Add exports
- Customize the table appearance and behavior

Continue to the **Columns** documentation to start building your table.
