<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Commands;

use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputOption;

#[AsCommand(name: 'make:zon-table')]
final class MakeTableCommand extends GeneratorCommand
{
    protected $name = 'make:zon-table';

    protected $description = 'Create a new Zonvoir table class';

    protected $type = 'Table';

    protected function getStub(): string
    {
        return __DIR__ . '/../stubs/table.stub';
    }

    protected function getDefaultNamespace($rootNamespace): string
    {
        return $rootNamespace . '\Tables';
    }

    protected function buildClass($name): string
    {
        $stub = parent::buildClass($name);

        return str_replace(
            ['{{ modelImport }}', '{{ modelResource }}'],
            [$this->modelImport(), $this->modelResource()],
            $stub,
        );
    }

    protected function getOptions(): array
    {
        return [
            ['model', 'm', InputOption::VALUE_OPTIONAL, 'The model that the table should use as its resource'],
        ];
    }

    private function modelImport(): string
    {
        if (! is_string($this->option('model'))) {
            return '';
        }

        return 'use ' . $this->qualifyModel($this->option('model')) . ';' . PHP_EOL;
    }

    private function modelResource(): string
    {
        if (! is_string($this->option('model'))) {
            return '';
        }

        $model = class_basename($this->qualifyModel($this->option('model')));

        return PHP_EOL
            . '    protected ?string $resource = ' . $model . '::class;' . PHP_EOL
            . PHP_EOL;
    }
}
