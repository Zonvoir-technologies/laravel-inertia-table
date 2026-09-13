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
