---
title: Excel, CSV & PDF Data Exports
description: Configure Excel, CSV and PDF exports in Zonvoir Table with filtered rows, selected rows, custom filenames, queued exports, and PDF renderer setup.
---

Zonvoir Table includes export definitions through `Zonvoir\InertiaTable\Export`. Exports are returned from a table class and serialized into the table metadata so the Vue adapter can render export controls and submit to the package export endpoint.

## Add An Export

Override `exports()` on your table class and return `Export` instances.

```php
use Zonvoir\InertiaTable\Export;
use Zonvoir\InertiaTable\Table;

class UsersTable extends Table
{
    public function exports(): array
    {
        return [
            Export::make('Users', 'users.xlsx')
                ->limitToFilteredRows(),
        ];
    }
}
```

When a table has at least one export, `Table::meta()` includes the table class and `exportEndpoint` route metadata.

## Export Formats & File Types

By default, exports use XLSX (`Excel::XLSX`). You can configure the file format using the `type()` method or pass it directly to `Export::make()`:

```php
use Maatwebsite\Excel\Excel;
use Zonvoir\InertiaTable\Export;

// Export as CSV
Export::make('Export CSV', 'users.csv')
    ->type(Excel::CSV);

// Export as XLSX (default)
Export::make('Export Excel', 'users.xlsx')
    ->type(Excel::XLSX);

// Export as PDF after installing a PDF renderer
Export::make('Export PDF', 'users.pdf')
    ->type(Excel::DOMPDF);

// Export as TSV, HTML, or ODS
Export::make('Export TSV', 'users.tsv')
    ->type(Excel::TSV);
```

You can also pass the format as the third parameter of `Export::make()`:

```php
Export::make('Users CSV', 'users.csv', Excel::CSV);
```

Spreadsheet types include the writer formats provided by `Maatwebsite\Excel\Excel`, such as `Excel::XLSX`, `Excel::CSV`, `Excel::TSV`, `Excel::ODS`, and `Excel::HTML`. PDF writer constants such as `Excel::DOMPDF`, `Excel::MPDF`, and `Excel::TCPDF` require a separate PDF rendering package.

## PDF Exports Require Additional Configuration

PDF export is supported, but a PDF renderer is not installed by Zonvoir Table or Laravel Excel. Install one renderer in your Laravel application. DOMPDF is the default mapping in Laravel Excel:

```bash
composer require dompdf/dompdf
```

Then explicitly select the matching writer type in the export definition:

```php
use Maatwebsite\Excel\Excel;
use Zonvoir\InertiaTable\Export;

Export::make('Users PDF', 'users.pdf')
    ->type(Excel::DOMPDF)
    ->limitToFilteredRows();
```

You may use mPDF or TCPDF instead:

```bash
composer require mpdf/mpdf
# or
composer require tecnickcom/tcpdf
```

Match the installed package with `Excel::MPDF` or `Excel::TCPDF`. If your application uses extension-based writer detection, publish Laravel Excel's configuration and confirm the `pdf` entry under `extension_detector` uses the same renderer:

```bash
php artisan vendor:publish --provider="Maatwebsite\Excel\ExcelServiceProvider" --tag=config
```

```php
use Maatwebsite\Excel\Excel;

'extension_detector' => [
    // Other extensions...
    'pdf' => Excel::DOMPDF,
],
```

:::caution[PDF renderer required]
Using a PDF writer constant without installing its matching renderer will fail at export time. The filename should end in `.pdf`, and the configured writer must match the installed package.
:::

## Keys & Custom Identifiers

Each export has a unique key used to invoke it from the frontend. By default, the key is generated as a slug from the label (e.g. `'Users CSV'` becomes `'users-csv'`). You can explicitly set a custom key:

```php
Export::make('Download Report', 'report.xlsx')
    ->key('download-annual-report');
```

## Authorization & Permissions

Control whether the current user or context is allowed to run the export:

```php
// Boolean flag
Export::make('All Users', 'users.xlsx')
    ->authorize(auth()->user()?->isAdmin() ?? false);

// Closure evaluated dynamically when requested
Export::make('Financials', 'financials.xlsx')
    ->authorize(function (UsersTable $table, Export $export) {
        return auth()->user()?->can('export-financials');
    });
```

If authorization returns `false`, an HTTP 403 response is returned when the export is triggered.

## Limit Scope

Exports can opt into the current filtered query state or the selected rows.

```php
Export::make('Selected users', 'selected-users.xlsx')
    ->limitToSelectedRows();

Export::make('Filtered users', 'filtered-users.xlsx')
    ->limitToFilteredRows();
```

Selected-row exports use the table row selection key. By default, `Table` uses `id`.

## Queue An Export

Use `queue()` when the export should be processed asynchronously in the background. You can specify a custom filename, queue disk, queue name, and customize the queue job:

```php
Export::make('Users', 'users.xlsx')
    ->queue(
        filename: 'queued-users.xlsx',
        disk: 's3',
        withQueuedJob: function ($job) {
            $job->onQueue('exports');
        }
    )
    ->redirectBackWithDialog(
        title: 'Export started',
        message: 'Your file is being generated and will be sent to your email.'
    );
```

### Global Queue Defaults

You can configure global defaults for all exports in a service provider:

```php
use Zonvoir\InertiaTable\Export;

// In AppServiceProvider::boot()
Export::defaultQueueName('exports');
Export::defaultQueueDisk('s3');
Export::defaultLimitToFilteredRows(true);
```

## Custom Export Execution

Use `using()` to provide a custom exporter callback if you need to run bespoke generation logic, send to external webhooks, or return a custom response:

```php
Export::make('Users')
    ->using(function ($table, $export, $request, $query) {
        // $table: the Table instance
        // $export: this Export definition
        // $request: the ExportRequest instance
        // $query: the Eloquent Builder with filters/selections applied

        // Return a response, redirect, or custom download
        return response()->streamDownload(function () use ($query) {
            // custom stream
        }, 'custom-users.csv');
    });
```

The implementation invokes the custom exporter through `Export::executeUsing(Table $table, ExportRequest $request, Builder $query)`.

## Redirects & Notification Dialogs

For queued or non-direct exports, you can configure how the user is redirected:

```php
// Redirect back with an Inertia notification dialog
Export::make('Audit Log')
    ->redirectBackWithDialog(
        title: 'Export in Progress',
        message: 'You will receive a notification when ready.'
    );

// Redirect to a specific route
Export::make('Orders')
    ->queue()
    ->redirectToRoute('reports.index', ['status' => 'pending']);

// Custom URL or redirect callback
Export::make('Invoices')
    ->queue()
    ->redirect('/dashboard');
```

## Column Export Values

Column export output can be customized on the column itself.

```php
TextColumn::make('name')
    ->exportLabel('Customer')
    ->exportAs(fn ($value, $record) => strtoupper($value));
```

Use `dontExport()` on a column to exclude it from generated export headings and row values.

## Related API

- [`Export` API reference](/api/exports/)
- [`Column` export methods](/api/column/#export-methods)
- [`Table::exports()`](/api/table/#exports)
