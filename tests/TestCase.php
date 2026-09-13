<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Zonvoir\InertiaTable\InertiaTableServiceProvider;

abstract class TestCase extends OrchestraTestCase
{
    protected function getPackageProviders($app): array
    {
        return [
            InertiaTableServiceProvider::class,
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.key' => 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=']);

        $this->resetDatabase();
    }

    private function resetDatabase(): void
    {
        Schema::dropIfExists('zonvoir_test_posts');
        Schema::dropIfExists('zonvoir_test_authors');

        Schema::create('zonvoir_test_authors', static function (Blueprint $table): void {
            $table->increments('id');
            $table->string('name');
        });

        Schema::create('zonvoir_test_posts', static function (Blueprint $table): void {
            $table->increments('id');
            $table->string('title')->nullable();
            $table->string('status')->nullable();
            $table->unsignedInteger('votes')->default(0);
            $table->unsignedInteger('author_id')->nullable();
            $table->timestamp('published_at')->nullable();
        });
    }
}
