<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Enums\ButtonVariant;
use Zonvoir\InertiaTable\Enums\TableColor;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('configures action identity urls handlers visibility and bulk options', function (): void {
    $action = Action::make('Review')
        ->key('review-post')
        ->url(['/posts/1'])
        ->handle(static fn (): string => 'handled')
        ->authorize(false)
        ->disabledAndHidden()
        ->asBulkAction(50, 'chunk')
        ->confirm(false);

    expect($action->keyName())->toBe('review-post')
        ->and($action->hasHandler())->toBeTrue()
        ->and($action->isAuthorized())->toBeFalse()
        ->and($action->isDisabled())->toBeTrue()
        ->and($action->isHidden())->toBeTrue()
        ->and($action->isBulk())->toBeTrue()
        ->and($action->chunkSize())->toBe(50)
        ->and($action->chunkStrategy())->toBe('chunk');
});

it('configures labels variants classes metadata and data', function (): void {
    $payload = Action::make('Archive')
        ->showLabel()
        ->hideLabel()
        ->variant(ButtonVariant::Outline)
        ->variantColor(TableColor::Amber)
        ->asInfoButton()
        ->asSuccessButton()
        ->asDangerButton()
        ->class('font-medium')
        ->meta(['first' => true, 'replace' => 'old'])
        ->meta(['replace' => 'new'])
        ->data(['id' => 1])
        ->toArray();

    expect($payload)->toMatchArray([
        'showLabel' => false,
        'variant' => 'outline',
        'variantColor' => 'red',
        'class' => 'font-medium',
        'meta' => ['first' => true, 'replace' => 'new'],
        'data' => ['id' => 1],
    ]);
});

it('configures action name and rejects empty string name', function (): void {
    $action = Action::make('Initial')
        ->name('Renamed');

    expect($action->keyName())->toBe('renamed');

    $callableAction = Action::make('Initial')
        ->name(static fn (): string => 'Dynamic');

    expect($callableAction->toArray()['label'])->toBe('Dynamic');

    expect(static fn () => Action::make('Initial')->name(''))
        ->toThrow(InertiaTableException::class, 'Action name cannot be empty.');
});

it('configures confirm options with boolean closure array and callable parameters', function (): void {
    $post = TestPost::query()->create(['title' => 'Article']);

    // Boolean confirm
    $boolAction = Action::make('Delete')->confirm(true);
    expect($boolAction->forRow($post)['confirm'])->toBe(true);

    $boolFalseAction = Action::make('Delete')->confirm(false);
    expect($boolFalseAction->forRow($post)['confirm'])->toBe(false);

    // Sole closure for confirm
    $closureAction = Action::make('Delete')
        ->confirm(static fn (TestPost $model): array => [
            'title' => 'Remove ' . $model->title,
        ]);
    expect($closureAction->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Remove Article',
    ]);

    // Callable arguments for title, message, confirmButton, cancelButton
    $callableArgsAction = Action::make('Delete')
        ->confirm(
            title: static fn (TestPost $model): string => 'Delete ' . $model->title . '?',
            message: static fn (TestPost $model): string => 'This removes ' . $model->title . ' permanently.',
            confirmButton: static fn (TestPost $model): string => 'Yes, delete ' . $model->title,
            cancelButton: static fn (): string => 'No, keep it',
        );

    expect($callableArgsAction->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Delete Article?',
        'message' => 'This removes Article permanently.',
        'confirmButton' => 'Yes, delete Article',
        'cancelButton' => 'No, keep it',
    ]);

    // Array confirm with closures and strings
    $arrayAction = Action::make('Delete')
        ->confirm([
            'title' => static fn (TestPost $model): string => 'Confirm ' . $model->title,
            'message' => 'Are you sure?',
            'confirmButton' => 'Proceed',
            'cancelButton' => 'Abort',
        ]);

    expect($arrayAction->forRow($post)['confirm'])->toMatchArray([
        'title' => 'Confirm Article',
        'message' => 'Are you sure?',
        'confirmButton' => 'Proceed',
        'cancelButton' => 'Abort',
    ]);
});
