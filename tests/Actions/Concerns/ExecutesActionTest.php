<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('executes handlers with zero one action and url helper arguments', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);

    expect(Action::make('No handler')->execute($post))->toBeNull()
        ->and(Action::make('Zero')->handle(static fn (): string => 'zero')->execute($post))->toBe('zero')
        ->and(Action::make('One')->handle(static fn (TestPost $model): int => $model->id)->execute($post))->toBe($post->id)
        ->and(Action::make('Two')->handle(static fn (TestPost $model, Action $action): string => $action->keyName() . '-' . $model->id)->execute($post))->toBe('two-' . $post->id)
        ->and(Action::make('Url')->handle(static fn (TestPost $model, Url $url): string => $url->to('/posts/' . $model->id)->value())->execute($post))->toBe('/posts/' . $post->id);
});

it('returns default and custom lifecycle responses', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft']);
    $exception = new RuntimeException('failed');

    $plain = Action::make('Plain');
    $custom = Action::make('Custom')
        ->before(static fn (array $models): int => count($models))
        ->after(static fn (array $models, array $results): array => [$models[0]->id, $results[0]])
        ->success(static fn (array $payload): array => ['wrapped' => $payload])
        ->error(static fn (RuntimeException $exception, array $payload): array => ['message' => $exception->getMessage(), 'payload' => $payload]);

    expect($plain->runBefore([$post]))->toBeNull()
        ->and($plain->runAfter([$post], ['ok']))->toBeNull()
        ->and($plain->successResponse(['ok' => true]))->toBe(['ok' => true])
        ->and($plain->errorResponse($exception, ['ok' => false]))->toBe(['ok' => false])
        ->and($custom->runBefore([$post]))->toBe(1)
        ->and($custom->runAfter([$post], ['done']))->toBe([$post->id, 'done'])
        ->and($custom->successResponse(['ok' => true]))->toBe(['wrapped' => ['ok' => true]])
        ->and($custom->errorResponse($exception, ['ok' => false]))->toBe(['message' => 'failed', 'payload' => ['ok' => false]]);
});

it('invokes callbacks safely with null and non-null models across parameter signatures', function (): void {
    $action = Action::make('Test', key: 'test-key');
    $post = TestPost::query()->create(['title' => 'Sample']);

    $method = new ReflectionMethod($action, 'invoke');
    $method->setAccessible(true);

    // 0 parameters
    expect($method->invoke($action, static fn (): string => 'zero', null))->toBe('zero')
        ->and($method->invoke($action, static fn (): string => 'zero', $post))->toBe('zero');

    // 1 parameter - strict type requiring model (returns null when model is null)
    expect($method->invoke($action, static fn (TestPost $p): string => $p->title, null))->toBeNull()
        ->and($method->invoke($action, static fn (TestPost $p): string => $p->title, $post))->toBe('Sample');

    // 1 parameter - nullable type
    expect($method->invoke($action, static fn (?TestPost $p): string => $p ? $p->title : 'null-model', null))->toBe('null-model')
        ->and($method->invoke($action, static fn (?TestPost $p): string => $p ? $p->title : 'null-model', $post))->toBe('Sample');

    // 1 parameter - untyped
    expect($method->invoke($action, static fn ($p): string => $p ? $p->title : 'untyped-null', null))->toBe('untyped-null')
        ->and($method->invoke($action, static fn ($p): string => $p ? $p->title : 'untyped-null', $post))->toBe('Sample');

    // 2 parameters - with Action helper
    expect($method->invoke($action, static fn (?TestPost $p, Action $act): string => ($p ? $p->title : 'no-model') . '@' . $act->keyName(), null))->toBe('no-model@test-key')
        ->and($method->invoke($action, static fn (?TestPost $p, Action $act): string => ($p ? $p->title : 'no-model') . '@' . $act->keyName(), $post))->toBe('Sample@test-key');

    // 2 parameters - with Url helper
    expect($method->invoke($action, static fn (?TestPost $p, Url $url): string => $url->to('/posts/' . ($p ? $p->id : 'all'))->value(), null))->toBe('/posts/all')
        ->and($method->invoke($action, static fn (?TestPost $p, Url $url): string => $url->to('/posts/' . ($p ? $p->id : 'all'))->value(), $post))->toBe('/posts/' . $post->id);
});
