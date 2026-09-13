<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Support\ServiceProvider;
use Zonvoir\InertiaTable\Commands\MakeTableCommand;

final class InertiaTableServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/config/zonvoir-table.php',
            'zonvoir-table',
        );

        $this->app->singleton(InertiaTable::class, static fn (): InertiaTable => new InertiaTable());
        $this->app->singleton(TableQueryMetadataResolver::class);
        $this->app->singleton(TableQueryBuilder::class);
        $this->app->singleton(TablePaginationBuilder::class);
        $this->app->singleton(TablePayloadBuilder::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/routes.php');

        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeTableCommand::class,
            ]);
        }

        $this->publishes([
            __DIR__ . '/config/zonvoir-table.php' => config_path('zonvoir-table.php'),
        ], 'zonvoir-table-config');
    }
}
