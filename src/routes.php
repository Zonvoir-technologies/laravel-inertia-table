<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Zonvoir\InertiaTable\Http\Controllers\ActionController;
use Zonvoir\InertiaTable\Http\Controllers\ExportController;

Route::middleware('web')
    ->prefix('zonvoir-table')
    ->group(function (): void {
        Route::post('/actions', ActionController::class)
            ->name('zonvoir-table.actions.execute');

        Route::post('/exports', ExportController::class)
            ->name('zonvoir-table.exports.execute');
    });
