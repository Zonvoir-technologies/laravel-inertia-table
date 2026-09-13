<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Enums\ButtonVariant;
use Zonvoir\InertiaTable\Enums\TableColor;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('creates an action with a resolved key name', function (): void {
    expect(Action::make('Review Post')->keyName())->toBe('review-post')
        ->and(Action::make('Review Post')->key('review')->keyName())->toBe('review');
});

it('rejects empty action names', function (): void {
    Action::make('');
})->throws(InertiaTableException::class, 'Action name cannot be empty.');

it('serializes custom link and handler action types', function (): void {
    $link = Action::make('Open', url: '/posts')->toArray();
    $handler = Action::make('Publish')->handle(static fn (): string => 'done')->toArray();
    $custom = Action::make('Custom')->toArray();

    expect($link['type'])->toBe('link')
        ->and($link['url']['url'])->toBe('/posts')
        ->and($handler['type'])->toBe('action')
        ->and($handler['endpoint'])->toBe('/zonvoir-table/actions')
        ->and($custom['type'])->toBe('custom');
});

it('serializes visual state meta data and enum variants', function (): void {
    $payload = Action::make('Delete')
        ->icon('trash')
        ->tooltip('Delete row')
        ->hideLabel()
        ->variant(ButtonVariant::Ghost)
        ->variantColor(TableColor::Red)
        ->class('text-red-600')
        ->meta(['danger' => true])
        ->data(['source' => 'test'])
        ->toArray();

    expect($payload)->toMatchArray([
        'icon' => 'trash',
        'tooltip' => 'Delete row',
        'showLabel' => false,
        'variant' => 'ghost',
        'variantColor' => 'red',
        'class' => 'text-red-600',
        'meta' => ['danger' => true],
        'data' => ['source' => 'test'],
    ]);
});

it('normalizes bulk chunk configuration', function (): void {
    $action = Action::make('Archive')->asBulkAction(chunkSize: 0, strategy: 'invalid');

    expect($action->isBulk())->toBeTrue()
        ->and($action->chunkSize())->toBe(1)
        ->and($action->chunkStrategy())->toBe('chunkById');
});

it('hides row actions that are only bulk actions', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $action = Action::make('Archive')->onlyAsBulkAction();

    expect($action->forRow($post))->toBeNull()
        ->and($action->forBulk())->not->toBeNull()
        ->and($action->isOnlyBulk())->toBeTrue();
});

it('applies authorization disabled hidden and url disabled flags', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    expect(Action::make('Delete')->authorize(false)->forRow($post))->toMatchArray([
        'authorized' => false,
        'disabled' => true,
    ])
        ->and(Action::make('Hide')->hidden()->forRow($post))->toBeNull()
        ->and(Action::make('Open')->url((new Url())->to('/posts')->disabled())->forRow($post)['disabled'])->toBeTrue();
});

it('interpolates confirmation text from row models', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft', 'status' => 'draft']);

    expect(Action::make('Review')->confirm('Review :title?', 'Status :status')->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Review Draft?',
        'message' => 'Status draft',
    ]);
});

it('executes handlers and lifecycle callbacks', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $action = Action::make('Publish')
        ->handle(static fn (TestPost $model): int => $model->id)
        ->before(static fn (array $models, Action $action): int => count($models))
        ->after(static fn (array $models, array $results): array => [$models[0]->id, $results[0]])
        ->success(static fn (array $payload): array => array_replace($payload, ['ok' => true]))
        ->error(static fn (RuntimeException $exception, array $payload): array => array_replace($payload, ['message' => $exception->getMessage()]));

    expect($action->hasHandler())->toBeTrue()
        ->and($action->execute($post))->toBe($post->id)
        ->and($action->runBefore([$post]))->toBe(1)
        ->and($action->runAfter([$post], [$post->id]))->toBe([$post->id, $post->id])
        ->and($action->successResponse([]))->toBe(['ok' => true])
        ->and($action->errorResponse(new RuntimeException('failed'), []))->toBe(['message' => 'failed']);
});

it('passes url helpers into two argument url callbacks', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    $row = Action::make('Open')
        ->url(static fn (TestPost $model, Url $url): Url => $url->to('/posts/' . $model->id)->openInNewTab())
        ->forRow($post);

    expect($row['url'])->toMatchArray([
        'url' => '/posts/' . $post->id,
        'target' => '_blank',
    ]);
});
it('creates actions through the create factory alias', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    $action = Action::create(
        name: 'Review Post',
        key: 'review',
        url: '/posts/review',
        handle: static fn (TestPost $post): string => $post->title,
        authorize: false,
        disabled: true,
        hidden: false,
        bulk: true,
        onlyBulk: false,
        chunkSize: 25,
        chunkStrategy: 'chunk',
        icon: 'eye',
        tooltip: 'Review this post',
        variant: ButtonVariant::Ghost,
        variantColor: TableColor::Blue,
        class: 'text-blue-600',
        confirm: ['title' => 'Review?'],
        meta: ['source' => 'create'],
        data: ['id' => 1],
        showLabel: false,
    );

    expect($action->keyName())->toBe('review')
        ->and($action->execute($post))->toBe('Draft')
        ->and($action->forBulk())->toMatchArray([
            'key' => 'review',
            'label' => 'Review Post',
            'type' => 'link',
            'authorized' => false,
            'disabled' => true,
            'bulk' => true,
            'chunkSize' => 25,
            'chunkStrategy' => 'chunk',
            'icon' => 'eye',
            'tooltip' => 'Review this post',
            'variant' => 'ghost',
            'variantColor' => 'blue',
            'class' => 'text-blue-600',
            'confirm' => ['title' => 'Review?'],
            'meta' => ['source' => 'create'],
            'data' => ['id' => 1],
            'showLabel' => false,
        ]);
});

it('evaluates dynamic callable names and confirmation dialogs per row model', function (): void {
    $published = TestPost::query()->create(['title' => 'First Post', 'status' => 'published']);
    $draft = TestPost::query()->create(['title' => 'Second Post', 'status' => 'draft']);

    $action = Action::make('toggle-status', key: 'toggle-status')
        ->name(fn (TestPost $post): string => $post->status === 'published' ? 'Unpublish' : 'Publish')
        ->confirm(
            title: fn (TestPost $post): string => $post->status === 'published' ? 'Unpublish post' : 'Publish post',
            message: fn (TestPost $post): string => 'Are you sure you want to toggle :title?',
            confirmButton: fn (TestPost $post): string => $post->status === 'published' ? 'Yes, unpublish' : 'Yes, publish',
        )
        ->icon('heroicons:user-minus')
        ->variant('outline')
        ->variantColor('yellow')
        ->asBulkAction();

    $publishedRow = $action->forRow($published);
    $draftRow = $action->forRow($draft);

    expect($publishedRow)->toMatchArray([
        'key' => 'toggle-status',
        'label' => 'Unpublish',
        'icon' => 'heroicons:user-minus',
        'variant' => 'outline',
        'variantColor' => 'yellow',
        'confirm' => [
            'title' => 'Unpublish post',
            'message' => 'Are you sure you want to toggle First Post?',
            'confirmButton' => 'Yes, unpublish',
            'cancelButton' => null,
        ],
    ]);

    expect($draftRow)->toMatchArray([
        'key' => 'toggle-status',
        'label' => 'Publish',
        'icon' => 'heroicons:user-minus',
        'variant' => 'outline',
        'variantColor' => 'yellow',
        'confirm' => [
            'title' => 'Publish post',
            'message' => 'Are you sure you want to toggle Second Post?',
            'confirmButton' => 'Yes, publish',
            'cancelButton' => null,
        ],
    ]);

    // Bulk action serialization should not crash when model is null
    $bulk = $action->forBulk();
    expect($bulk)->not->toBeNull()
        ->and($bulk['key'])->toBe('toggle-status')
        ->and($bulk['label'])->toBe('toggle-status');
});

it('supports callable passed directly into make for dynamic name', function (): void {
    $post = TestPost::query()->create(['title' => 'Post A']);

    $action = Action::make(fn (TestPost $p): string => 'Action ' . $p->title, key: 'custom-key');
    expect($action->keyName())->toBe('custom-key')
        ->and($action->forRow($post)['label'])->toBe('Action Post A');

    $actionWithoutKey = Action::make(fn (TestPost $p): string => 'Action ' . $p->title);
    expect($actionWithoutKey->keyName())->toBe('action')
        ->and($actionWithoutKey->forRow($post)['label'])->toBe('Action Post A');
});

it('supports callable returning confirm config array or boolean', function (): void {
    $published = TestPost::query()->create(['title' => 'First Post', 'status' => 'published']);
    $draft = TestPost::query()->create(['title' => 'Second Post', 'status' => 'draft']);

    $actionWithArray = Action::make('conditional-confirm')
        ->confirm(fn (TestPost $post): array => [
            'title' => 'Confirm ' . $post->title,
            'message' => 'Status is ' . $post->status,
        ]);

    expect($actionWithArray->forRow($published)['confirm'])->toMatchArray([
        'title' => 'Confirm First Post',
        'message' => 'Status is published',
    ]);

    $actionWithBool = Action::make('only-confirm-published')
        ->confirm(fn (TestPost $post): bool => $post->status === 'published');

    expect($actionWithBool->forRow($published)['confirm'])->toBeTrue()
        ->and($actionWithBool->forRow($draft)['confirm'])->toBeFalse();
});
