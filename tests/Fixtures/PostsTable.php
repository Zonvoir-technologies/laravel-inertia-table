<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests\Fixtures;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\NumericColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Table;
use Zonvoir\InertiaTable\TableQueryBuilder;
use Zonvoir\InertiaTable\Url;

final class PostsTable extends Table
{
    protected ?string $resource = TestPost::class;

    protected array|string|null $search = ['title', 'author.name'];

    protected ?string $defaultSort = '-votes';

    protected ?int $defaultPerPage = 30;

    protected ?array $perPageOptions = [15, 30, 50];

    public static array $handled = [];

    public static array $before = [];

    public static array $after = [];

    public static function resetActionLog(): void
    {
        self::$handled = [];
        self::$before = [];
        self::$after = [];
    }

    public function columns(): array
    {
        return [
            TextColumn::make('title')
                ->key('headline')
                ->label('Headline')
                ->searchable()
                ->sortable()
                ->sticky()
                ->tooltip('Post title')
                ->width(240)
                ->labelClass('font-semibold')
                ->cellClass('text-slate-900'),
            BadgeColumn::make('status')
                ->visible(false)
                ->colors(['draft' => 'gray', 'published' => 'green'])
                ->solid(),
            NumericColumn::make('votes')
                ->sortable()
                ->alignment('right')
                ->mapAs(static fn (mixed $value): string => number_format((int) $value)),
            TextColumn::make('author.name')
                ->key('author')
                ->label('Author')
                ->sortable()
                ->searchable(),
        ];
    }

    public function actions(): array
    {
        return [
            Action::make('Publish')
                ->asBulkAction(chunkSize: 2, strategy: 'chunk')
                ->handle(static function (TestPost $post): int {
                    self::$handled[] = $post->id;

                    return $post->id;
                })
                ->before(static function (array $models): void {
                    self::$before[] = array_map(static fn (Model $model): int => $model->getKey(), $models);
                })
                ->after(static function (array $models, array $results): void {
                    self::$after[] = [
                        'models' => array_map(static fn (Model $model): int => $model->getKey(), $models),
                        'results' => $results,
                    ];
                }),
            Action::make('Hidden action')
                ->hidden()
                ->handle(static fn (): string => 'hidden'),
            Action::make('View', url: static fn (TestPost $post, Url $url): Url => $url->to('/posts/' . $post->id)),
        ];
    }

    public function isSelectable(Model $model): bool
    {
        return $model->status !== 'archived';
    }

    public function rowUrl(Model $model, Url $url): Url
    {
        return $url->to('/posts/' . $model->getKey())->preserveScroll();
    }

    public function withQueryBuilder(TableQueryBuilder $queryBuilder): ?TableQueryBuilder
    {
        return $queryBuilder->searchUsing(static function (Builder $query, string $search): void {
            $query->where('title', 'like', '%' . $search . '%');
        });
    }
}
