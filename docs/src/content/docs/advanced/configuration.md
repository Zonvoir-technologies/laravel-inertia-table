---
title: Configuration Customization
description: Publish and customize the Zonvoir Table package configuration, including adapter and pagination defaults.
---

Zonvoir Table works without a configuration file. Publish one when you want to change package-wide defaults.

## Publish the configuration

```bash
php artisan vendor:publish --tag=zonvoir-table-config
```

Laravel creates `config/zonvoir-table.php`:

```php
return [
    'package_name' => 'zonvoir-table',
    'adapters' => [
        'vue' => true,
    ],
    'pagination' => [
        'default_per_page' => 15,
        'per_page_options' => [15, 30, 50, 100],
    ],
    'tables_path' => 'app/Tables',
];
```

## Table generator directory

By default, the `make:zon-table` Artisan command generates tables in `app/Tables` with the `App\Tables` namespace:

```php
'tables_path' => 'app/Tables',
```

You can change this path to any directory you prefer, such as `'app/DataTables'`:

```php
'tables_path' => 'app/DataTables',
```

The table class namespace is automatically derived from this directory path (e.g. `App\DataTables`). You can also override this per-command using the `--path` option or by supplying a direct path in the command argument (e.g. `php artisan make:zon-table app\controller\fnksdnf\UserTable`). See [Generating Tables](/core-concepts/generate-tables/) for details.

## Pagination defaults

`default_per_page` is used by tables that do not define `$defaultPerPage`. `per_page_options` supplies the page-size choices for tables that do not define `$perPageOptions`.

```php
final class UsersTable extends Table
{
    protected ?int $defaultPerPage = 50;
    protected ?array $perPageOptions = [25, 50, 100];
}
```

See [Pagination](/core-concepts/pagination/) for table-level pagination modes and behavior.
