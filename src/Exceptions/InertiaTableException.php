<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Exceptions;

use InvalidArgumentException;

final class InertiaTableException extends InvalidArgumentException
{
    public static function emptyTableName(): self
    {
        return new self('Table name cannot be empty.');
    }

    public static function invalidTableDefinition(
        string $tableClass,
        string $segment,
        string $expectedClass,
        int $index,
    ): self {
        return new self(sprintf(
            'Table %s expects %s definitions to be instances of %s. Invalid entry at index %d.',
            $tableClass,
            $segment,
            $expectedClass,
            $index,
        ));
    }

    public static function invalidPage(): self
    {
        return new self('Table page must be greater than or equal to 1.');
    }

    public static function invalidPerPage(): self
    {
        return new self('Table perPage must be greater than or equal to 1.');
    }

    public static function invalidPerPageOption(mixed $value): self
    {
        return new self(sprintf(
            'Table perPage options must contain positive integers. Invalid value [%s].',
            is_scalar($value) ? (string) $value : get_debug_type($value),
        ));
    }

    public static function emptyPerPageOptions(): self
    {
        return new self('Table perPage options cannot be empty.');
    }

    /**
     * @param  list<int>  $options
     */
    public static function defaultPerPageNotAllowed(int $defaultPerPage, array $options): self
    {
        return new self(sprintf(
            'Table defaultPerPage [%d] must be present in perPageOptions [%s].',
            $defaultPerPage,
            implode(', ', $options),
        ));
    }

    public static function missingTableResource(string $tableClass): self
    {
        return new self(sprintf(
            'Table %s does not define a resource. Define protected ?string $resource or override resource().',
            $tableClass,
        ));
    }

    public static function invalidTableResource(string $tableClass, mixed $resource): self
    {
        return new self(sprintf(
            'Table %s resource must be an Eloquent builder or model class-string. Received [%s].',
            $tableClass,
            is_scalar($resource) ? (string) $resource : get_debug_type($resource),
        ));
    }

    public static function actionNameRequired(): self
    {
        return new self('Action name cannot be empty.');
    }
}
