<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use JsonSerializable;
use Zonvoir\InertiaTable\Columns\Column;
use Zonvoir\InertiaTable\Contracts\TableState as TableStateContract;
use Zonvoir\InertiaTable\Enums\Direction;
use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;

abstract class Table implements Arrayable, JsonSerializable
{
    private ?string $tableName = null;

    /**
     * @var class-string<Model>|null
     */
    protected ?string $resource = null;

    protected array|string|null $search = null;

    protected ?string $defaultSort = null;

    protected bool $pagination = true;

    protected PaginationType $paginationType = PaginationType::Standard;

    /**
     * @var array<int, int|string>|null
     */
    protected ?array $perPageOptions = null;

    protected ?int $defaultPerPage = null;

    protected bool $scrollToTop = true;

    protected ?bool $stickyHeader = false;

    protected ?string $rowSelectionKey = 'id';

    protected bool $selectable = true;

    protected bool $persistRowSelectionAcrossPages = false;

    protected TableEmptyState|array|false|null $emptyState = null;

    public static function make(): static
    {
        return new static();
    }

    public static function create(): static
    {
        return static::make();
    }

    public function name(): string
    {
        return $this->tableName ?? $this->inferTableId();
    }

    public function isNamed(): bool
    {
        return $this->tableName !== null;
    }

    public function id(): string
    {
        return $this->name();
    }

    public function named(string $name): static
    {
        $table = clone $this;
        $table->tableName = Str::of($name)->trim()->toString();

        if ($table->tableName === '') {
            throw InertiaTableException::emptyTableName();
        }

        return $table;
    }

    public function as(string $name): static
    {
        return $this->named($name);
    }

    /**
     * @return list<Column>
     */
    abstract public function columns(): array;

    /**
     * @return Builder|string|null
     */
    public function resource(): Builder|string|null
    {
        return $this->resource;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function transformModel(Model $model, array $data): array
    {
        return $data;
    }

    public function rowUrl(Model $model, Url $url): string|Url|null
    {
        return null;
    }

    /**
     * @return list<Action>
     */
    public function actions(): array
    {
        return [];
    }

    /**
     * @return list<Export>
     */
    public function exports(): array
    {
        return [];
    }

    public function isSelectable(Model $model): bool
    {
        return true;
    }

    public function selectable(): bool
    {
        return $this->selectable;
    }

    /**
     * @return array<string, mixed>|TableStateContract
     */
    public function defaultState(): array|TableStateContract
    {
        return $this->defaultSortState();
    }

    /**
     * @return array<string, mixed>
     */
    public function meta(): array
    {
        $meta = [
            'columns' => array_map(
                static fn (Column $column): array => $column->toArray(),
                $this->columnsDefinition(),
            ),
            'pagination' => $this->pagination()->toArray(),
            'queryString' => [
                'namespace' => $this->isNamed() ? $this->name() : null,
                'page' => $this->pageName(),
                'perPage' => $this->queryStringKey('perPage'),
                'cursor' => $this->cursorName(),
                'search' => $this->queryStringKey('search'),
                'sort' => $this->queryStringKey('sort'),
                'direction' => $this->queryStringKey('direction'),
                'columns' => $this->queryStringKey('columns'),
                'sticky' => $this->queryStringKey('sticky'),
            ],
            'table' => static::class,
            'actionEndpoint' => route('zonvoir-table.actions.execute', absolute: false),
            'exportEndpoint' => route('zonvoir-table.exports.execute', absolute: false),
        ];

        if ($this->actionsDefinition() === [] && $this->exportsDefinition() === []) {
            unset($meta['table'], $meta['actionEndpoint'], $meta['exportEndpoint']);
        } elseif ($this->actionsDefinition() === []) {
            unset($meta['actionEndpoint']);
        } elseif ($this->exportsDefinition() === []) {
            unset($meta['exportEndpoint']);
        }

        return $meta;
    }

    public function emptyState(): TableEmptyState|array|false|null
    {
        return $this->emptyState;
    }

    public function state(?TableRequest $request = null): TableState
    {
        $defaultState = $this->defaultState();

        $configuration = $this->pagination();

        $state = $defaultState instanceof TableStateContract
            ? TableState::fromArray($defaultState->toArray(), $configuration)
            : TableState::fromArray($defaultState, $configuration);

        if ($request === null) {
            return $state;
        }

        return $state->merge($request->for($this), $configuration);
    }

    public function stateFromRequest(Request $request): TableState
    {
        return $this->state(TableRequest::fromRequest($request));
    }

    /**
     * @return array{
     *     name: string,
     *     state: array{
     *         page: int,
     *         perPage: int,
     *         cursor: ?string,
     *         search: ?string,
     *         sort: ?string,
     *         direction: string
     *     },
     *     meta: array<string, mixed>
     * }
     */
    public function payload(?TableRequest $request = null): array
    {
        return (new TablePayloadBuilder())->build($this, $this->state($request));
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return $this->payload();
    }

    public function apply(?Builder $query = null, ?TableRequest $request = null): Builder
    {
        /** @var TableQueryBuilder $queryBuilder */
        $queryBuilder = clone app(TableQueryBuilder::class);
        $queryBuilder = $this->withQueryBuilder($queryBuilder) ?? $queryBuilder;

        return $queryBuilder->apply($query ?? $this->query(), $this, $this->state($request));
    }

    public function paginate(?Builder $query = null, ?TableRequest $request = null): mixed
    {
        /** @var TablePaginationBuilder $paginationBuilder */
        $paginationBuilder = app(TablePaginationBuilder::class);

        return $paginationBuilder->paginate($query ?? $this->query(), $this, $this->state($request));
    }

    /**
     * @return array<string, mixed>
     */
    public function results(?Builder $query = null, ?TableRequest $request = null): array
    {
        $state = $this->state($request);

        /** @var TablePaginationBuilder $paginationBuilder */
        $paginationBuilder = app(TablePaginationBuilder::class);

        /** @var TablePayloadBuilder $payloadBuilder */
        $payloadBuilder = app(TablePayloadBuilder::class);

        $query ??= $this->query();

        return $payloadBuilder->buildResults(
            $this,
            $state,
            $paginationBuilder->paginate($query, $this, $state),
        );
    }

    public function query(): Builder
    {
        $resource = $this->resource();

        if ($resource instanceof Builder) {
            return clone $resource;
        }

        if (is_string($resource) && is_a($resource, Model::class, true)) {
            return $resource::query();
        }

        if ($resource === null) {
            throw InertiaTableException::missingTableResource(static::class);
        }

        throw InertiaTableException::invalidTableResource(static::class, $resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->results(request: TableRequest::fromRequest(request()));
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function defaultSort(): ?string
    {
        return $this->defaultSort;
    }

    public function stickyHeader(): bool
    {
        return $this->stickyHeader;
    }

    public function rowSelectionKey(): ?string
    {
        $key = $this->rowSelectionKey;

        if ($key === null) {
            return null;
        }

        $key = trim($key);

        return $key === '' ? null : $key;
    }

    public function persistsRowSelectionAcrossPages(): bool
    {
        return $this->persistRowSelectionAcrossPages;
    }

    public function navigation(?TableRequest $request = null): TableNavigation
    {
        return new TableNavigation($this, $this->state($request));
    }

    public function withQueryBuilder(TableQueryBuilder $queryBuilder): ?TableQueryBuilder
    {
        return $queryBuilder;
    }

    /**
     * @return list<string>
     */
    public function searchable(): array
    {
        if (is_string($this->search)) {
            $search = [$this->search];
        } elseif (is_array($this->search)) {
            $search = $this->search;
        } else {
            $search = [];
        }

        $fields = [];

        foreach ($search as $field) {
            if (! is_string($field)) {
                continue;
            }

            $field = trim($field);

            if ($field === '') {
                continue;
            }

            $fields[] = $field;
        }

        return array_values(array_unique($fields));
    }

    public function pagination(): PaginationConfiguration
    {
        $defaultPerPage = $this->defaultPerPage ?? config('zonvoir-table.pagination.default_per_page');
        $perPageOptions = $this->perPageOptions ?? config('zonvoir-table.pagination.per_page_options');

        $resolvedDefaultPerPage = (int) ($defaultPerPage ?: 15);
        $resolvedPerPageOptions = is_array($perPageOptions) ? $perPageOptions : [15, 30, 50, 100];

        if ($this->perPageOptions === null && ! in_array($resolvedDefaultPerPage, $resolvedPerPageOptions, true)) {
            $resolvedPerPageOptions[] = $resolvedDefaultPerPage;
            sort($resolvedPerPageOptions);
        }

        return PaginationConfiguration::make(
            enabled: $this->pagination,
            type: $this->paginationType,
            defaultPerPage: $resolvedDefaultPerPage,
            perPageOptions: $resolvedPerPageOptions,
            scrollToTop: $this->scrollToTop,
        );
    }

    public function pageName(): string
    {
        return $this->queryStringKey('page');
    }

    public function cursorName(): string
    {
        return $this->queryStringKey('cursor');
    }

    /**
     * @return array<string, mixed>
     */
    public function queryStringState(Contracts\TableState $state, bool $includePage = false): array
    {
        $queryStringState = $state->toArray();

        if (! $includePage) {
            unset($queryStringState['page']);
        }

        unset($queryStringState['cursor']);

        if ($state->columns() !== []) {
            $queryStringState['columns'] = $state->columns();
        }

        if ($state->hasStickyOverride()) {
            $queryStringState['sticky'] = $state->sticky();
        }

        if ((int) ($queryStringState['perPage'] ?? 0) === $this->pagination()->defaultPerPage()) {
            unset($queryStringState['perPage']);
        }

        if (($queryStringState['sort'] ?? null) === null) {
            unset($queryStringState['direction']);
        }

        $queryStringState = array_filter(
            $queryStringState,
            static fn (mixed $value): bool => $value !== null && $value !== '',
        );

        if ($this->isNamed()) {
            return [$this->name() => $queryStringState];
        }

        return $queryStringState;
    }

    private function queryStringKey(string $key): string
    {
        return $this->isNamed() ? $this->name() . '[' . $key . ']' : $key;
    }

    private function defaultSortState(): TableState
    {
        if ($this->defaultSort === null) {
            return new TableState(perPage: $this->pagination()->defaultPerPage());
        }

        $sort = trim($this->defaultSort);

        if ($sort === '') {
            return new TableState(perPage: $this->pagination()->defaultPerPage());
        }

        $direction = Direction::ASCENDING;

        if (str_starts_with($sort, '-')) {
            $direction = Direction::DESCENDING;
            $sort = trim(substr($sort, 1));
        }

        if ($sort === '') {
            return new TableState(perPage: $this->pagination()->defaultPerPage());
        }

        return new TableState(
            perPage: $this->pagination()->defaultPerPage(),
            sort: $sort,
            direction: $direction,
        );
    }

    /**
     * @return list<Column>
     */
    public function columnsDefinition(): array
    {
        return $this->normalizeDefinitions($this->columns(), Column::class, 'columns');
    }

    /**
     * @return list<Action>
     */
    public function actionsDefinition(): array
    {
        return $this->normalizeDefinitions($this->actions(), Action::class, 'actions');
    }

    /**
     * @return list<Export>
     */
    public function exportsDefinition(): array
    {
        return $this->normalizeDefinitions($this->exports(), Export::class, 'exports');
    }

    private function inferTableId(): string
    {
        $baseName = class_basename(static::class);

        if (str_ends_with($baseName, 'Table')) {
            $baseName = substr($baseName, 0, -5);
        }

        return Str::kebab($baseName);
    }

    /**
     * @template TDefinition of object
     *
     * @param  array<int, mixed>  $definitions
     * @param  class-string<TDefinition>  $expectedClass
     * @return list<TDefinition>
     */
    private function normalizeDefinitions(array $definitions, string $expectedClass, string $segment): array
    {
        foreach ($definitions as $index => $definition) {
            if (! $definition instanceof $expectedClass) {
                throw InertiaTableException::invalidTableDefinition(static::class, $segment, $expectedClass, $index);
            }
        }

        return array_values($definitions);
    }
}
