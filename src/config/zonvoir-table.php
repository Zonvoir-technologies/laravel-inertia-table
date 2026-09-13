<?php

declare(strict_types=1);

return [
    'package_name' => 'zonvoir-table',

    'adapters' => [
        'vue' => true,
    ],

    'pagination' => [
        'default_per_page' => 15,
        'per_page_options' => [15, 30, 50, 100],
    ],
];
