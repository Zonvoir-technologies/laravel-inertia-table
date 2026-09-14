<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Commands;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Str;
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

    protected function qualifyClass($name)
    {
        $name = ltrim((string) $name, '\\/');
        $name = str_replace('/', '\\', $name);
        $name = (string) preg_replace('/\.php$/i', '', $name);

        $rootNamespace = $this->rootNamespace();

        if (preg_match('/^app\\\\/i', $name)) {
            $name = $rootNamespace . substr($name, 4);
        }

        if (Str::startsWith($name, $rootNamespace)) {
            return $name;
        }

        return parent::qualifyClass($name);
    }

    protected function getDefaultNamespace($rootNamespace): string
    {
        $trimmedRoot = trim($rootNamespace, '\\');

        if ($this->hasOption('path') && is_string($this->option('path')) && trim($this->option('path')) !== '') {
            return $this->resolveNamespaceFromPath($this->option('path'), $trimmedRoot);
        }

        $configuredPath = config('zonvoir-table.tables_path')
            ?? config('zonvoir-table.generator.path')
            ?? config('zonvoir-table.generator.directory')
            ?? config('zonvoir-table.path')
            ?? config('zonvoir-table.directory')
            ?? config('zonvoir-table.generator.namespace')
            ?? config('zonvoir-table.namespace');

        if (is_string($configuredPath) && trim($configuredPath) !== '') {
            return $this->resolveNamespaceFromPath($configuredPath, $trimmedRoot);
        }

        return $trimmedRoot . '\Tables';
    }

    protected function getPath($name): string
    {
        $rawName = (string) $this->getNameInput();
        $rawName = (string) preg_replace('/\.php$/i', '', trim($rawName));

        if (preg_match('/^app[\/\\\\]/i', $rawName)) {
            $relative = preg_replace('/^app[\/\\\\]/i', '', $rawName);

            return $this->laravel['path'] . '/' . str_replace('\\', '/', $relative) . '.php';
        }

        $rootNamespace = $this->rootNamespace();
        if (Str::startsWith($rawName, $rootNamespace)) {
            $relative = Str::replaceFirst($rootNamespace, '', $rawName);

            return $this->laravel['path'] . '/' . str_replace('\\', '/', $relative) . '.php';
        }

        if ($this->hasOption('path') && is_string($this->option('path')) && trim($this->option('path')) !== '') {
            $baseDir = $this->resolveDirectoryPath($this->option('path'));
            $subPath = $this->subPathFromName($name);

            return $baseDir . '/' . ($subPath !== '' ? $subPath . '/' : '') . class_basename($name) . '.php';
        }

        $configuredPath = config('zonvoir-table.tables_path')
            ?? config('zonvoir-table.generator.path')
            ?? config('zonvoir-table.generator.directory')
            ?? config('zonvoir-table.path')
            ?? config('zonvoir-table.directory')
            ?? config('zonvoir-table.generator.namespace')
            ?? config('zonvoir-table.namespace');

        if (is_string($configuredPath) && trim($configuredPath) !== '') {
            $baseDir = $this->resolveDirectoryPath($configuredPath);
            $subPath = $this->subPathFromName($name);

            return $baseDir . '/' . ($subPath !== '' ? $subPath . '/' : '') . class_basename($name) . '.php';
        }

        return parent::getPath($name);
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
            ['path', null, InputOption::VALUE_OPTIONAL, 'The directory where the table class should be generated'],
        ];
    }

    protected function resolveDirectoryPath(string $path): string
    {
        $path = trim($path);

        if (str_starts_with($path, '/') || str_starts_with($path, '\\') || preg_match('/^[a-zA-Z]:[\\\\\/]/', $path)) {
            return rtrim(str_replace('\\', '/', $path), '/');
        }

        $normalized = trim(str_replace('\\', '/', $path), '/');

        if (preg_match('/^app(\/|$)/i', $normalized)) {
            $relative = preg_replace('/^app(\/|$)/i', '', $normalized);

            return rtrim($this->laravel['path'] . ($relative !== '' ? '/' . $relative : ''), '/');
        }

        $segments = explode('/', $normalized);
        $firstSegment = $segments[0] ?? '';

        if ($firstSegment !== '' && is_dir($this->laravel->basePath($firstSegment))) {
            return rtrim($this->laravel->basePath($normalized), '/');
        }

        return rtrim($this->laravel['path'] . '/' . $normalized, '/');
    }

    protected function resolveNamespaceFromPath(string $path, string $rootNamespace): string
    {
        $rootNamespace = trim($rootNamespace, '\\');
        $normalized = trim(str_replace('\\', '/', $path), '/');

        if (preg_match('/^app(\/|$)/i', $normalized)) {
            $relative = preg_replace('/^app(\/|$)/i', '', $normalized);

            return $relative !== ''
                ? $rootNamespace . '\\' . str_replace('/', '\\', $relative)
                : $rootNamespace;
        }

        $appPath = trim(str_replace('\\', '/', $this->laravel['path']), '/');
        if (Str::startsWith($normalized, $appPath)) {
            $relative = trim(substr($normalized, strlen($appPath)), '/');

            return $relative !== ''
                ? $rootNamespace . '\\' . str_replace('/', '\\', $relative)
                : $rootNamespace;
        }

        $segments = explode('/', $normalized);
        $firstSegment = $segments[0] ?? '';

        if ($firstSegment !== '' && is_dir($this->laravel->basePath($firstSegment))) {
            return $this->resolvePsr4Namespace($normalized, $rootNamespace);
        }

        return $rootNamespace . '\\' . str_replace('/', '\\', $normalized);
    }

    protected function resolvePsr4Namespace(string $relativePath, string $rootNamespace): string
    {
        $composerPath = $this->laravel->basePath('composer.json');

        if ($this->files->exists($composerPath)) {
            $composer = json_decode((string) $this->files->get($composerPath), true);
            $psr4 = array_merge(
                $composer['autoload']['psr-4'] ?? [],
                $composer['autoload-dev']['psr-4'] ?? [],
            );

            $normalizedRelative = rtrim($relativePath, '/') . '/';

            foreach ($psr4 as $namespacePrefix => $dirPrefix) {
                $dirPrefix = trim(str_replace('\\', '/', (string) $dirPrefix), '/');
                if ($dirPrefix !== '' && Str::startsWith($normalizedRelative, $dirPrefix . '/')) {
                    $sub = substr($normalizedRelative, strlen($dirPrefix . '/'));
                    $sub = trim($sub, '/');

                    return trim($namespacePrefix, '\\') . ($sub !== '' ? '\\' . str_replace('/', '\\', $sub) : '');
                }
            }
        }

        return $rootNamespace . '\\' . str_replace('/', '\\', $relativePath);
    }

    protected function subPathFromName(string $name): string
    {
        $baseNamespace = $this->getDefaultNamespace(trim($this->rootNamespace(), '\\'));
        $classNamespace = $this->getNamespace($name);

        if (Str::startsWith($classNamespace, $baseNamespace)) {
            $sub = trim(Str::replaceFirst($baseNamespace, '', $classNamespace), '\\');

            return str_replace('\\', '/', $sub);
        }

        return '';
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
