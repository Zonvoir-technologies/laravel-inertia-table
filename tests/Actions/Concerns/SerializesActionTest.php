<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('serializes row bulk array and json action payloads', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    $action = Action::make('Open')
        ->url(static fn (TestPost $post): Url => (new Url())->to('/posts/' . $post->id)->hidden(false))
        ->asBulkAction()
        ->confirm('Open :title?');

    expect($action->forRow($post))->toMatchArray([
        'key' => 'open',
        'label' => 'Open',
        'type' => 'link',
        'url' => ['url' => '/posts/' . $post->id, 'target' => null],
        'bulk' => true,
        'onlyBulk' => false,
        'confirm' => ['title' => 'Open Draft?', 'message' => null, 'confirmButton' => null, 'cancelButton' => null],
    ])
        ->and($action->forBulk())->toMatchArray([
            'key' => 'open',
            'type' => 'custom',
        ])
        ->and($action->jsonSerialize())->toBe($action->toArray());
});

it('returns null for hidden row and unavailable bulk actions', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    expect(Action::make('Hide')->hidden()->forRow($post))->toBeNull()
        ->and(Action::make('Single')->forBulk())->toBeNull();
});

it('serializes array URLs for actions', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    expect(Action::make('Open')->url(['/posts/1'])->forRow($post))->toMatchArray(['url' => ['/posts/1']]);
});

it('resolves action name with string closure interpolation and fallback to keyName', function (): void {
    $post = TestPost::query()->create(['title' => 'Release Notes']);

    // String name with model placeholder interpolation
    $stringAction = Action::make('Publish :title');
    expect($stringAction->forRow($post)['label'])->toBe('Publish Release Notes');
    // In bulk (null model), placeholder is preserved
    expect($stringAction->toArray()['label'])->toBe('Publish :title');

    // Closure name with model parameter and interpolation
    $closureAction = Action::make(static fn (TestPost $model): string => 'Edit :' . 'title');
    expect($closureAction->forRow($post)['label'])->toBe('Edit Release Notes');

    // Closure strictly requiring model returns null when model is null, falls back to keyName
    $strictClosureAction = Action::make(static fn (TestPost $model): string => 'Archive ' . $model->title, key: 'archive-btn');
    expect($strictClosureAction->toArray()['label'])->toBe('archive-btn');

    // Closure allowing null model
    $nullableClosureAction = Action::make(static fn (?TestPost $model): string => $model ? 'Single' : 'Bulk All');
    expect($nullableClosureAction->forRow($post)['label'])->toBe('Single')
        ->and($nullableClosureAction->toArray()['label'])->toBe('Bulk All');
});

it('resolves confirm options with boolean closure string array and placeholder interpolation', function (): void {
    $post = TestPost::query()->create(['title' => 'Announcement']);

    // Boolean confirm
    expect(Action::make('Delete')->confirm(false)->forRow($post)['confirm'])->toBeFalse()
        ->and(Action::make('Delete')->confirm(true)->forRow($post)['confirm'])->toBeTrue();

    // String confirm title with placeholder
    $stringConfirm = Action::make('Delete')->confirm('Delete :title?');
    expect($stringConfirm->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Delete Announcement?',
        'message' => null,
        'confirmButton' => null,
        'cancelButton' => null,
    ]);

    // Entire confirm as a Closure returning array with placeholders
    $closureConfirm = Action::make('Delete')
        ->confirm(static fn (TestPost $model): array => [
            'title' => 'Confirm :title',
            'message' => 'Are you sure about :title?',
        ]);
    expect($closureConfirm->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Confirm Announcement',
        'message' => 'Are you sure about Announcement?',
    ]);

    // Confirm array with closure values and string interpolation
    $arrayConfirm = Action::make('Delete')
        ->confirm(
            title: static fn (TestPost $model): string => 'Delete ' . $model->title,
            message: 'Remove :title permanently',
            confirmButton: static fn (TestPost $model): string => 'Yes, delete :title',
            cancelButton: 'No, keep it',
        );

    expect($arrayConfirm->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Delete Announcement',
        'message' => 'Remove Announcement permanently',
        'confirmButton' => 'Yes, delete Announcement',
        'cancelButton' => 'No, keep it',
    ]);
});
