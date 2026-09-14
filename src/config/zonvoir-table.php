<?php

declare(strict_types=1);

return [
    'package_name' => 'zonvoir-table',

    'pagination' => [
        'default_per_page' => 15,
        'per_page_options' => [15, 30, 50, 100],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tables Directory / Path
    |--------------------------------------------------------------------------
    |
    | The default directory where make:zon-table creates your table classes.
    | The namespace is automatically derived from this directory path.
    | You can override this using the --path option or a custom path in the command.
    |
    */
    'tables_path' => 'app/Tables',
];
