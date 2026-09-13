<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Action;
use Zonvoir\InertiaTable\Columns\BadgeColumn;
use Zonvoir\InertiaTable\Columns\BooleanColumn;
use Zonvoir\InertiaTable\Columns\ImageColumn;
use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\ColumnAlignment;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\Image;
use Zonvoir\InertiaTable\Tests\Fixtures\TestPost;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('serializes column configuration and resolves values urls and images', function (): void {
    $post = TestPost::query()->create([
        'title' => 'Hello Table',
        'status' => 'published',
        'votes' => 1234,
    ]);

    $column = TextColumn::make('title')
        ->key('headline')
        ->label(static fn (): string => 'Headline')
        ->alignment(ColumnAlignment::Center)
        ->sortable()
        ->searchable()
        ->toggleable(false)
        ->sticky()
        ->width('14rem')
        ->minWidth(160)
        ->maxWidth(320)
        ->labelClass('font-medium')
        ->cellClass('text-sm')
        ->tooltip('Title tooltip')
        ->defaultValue('Untitled')
        ->mapAs(static fn (mixed $value): string => strtoupper((string) $value))
        ->url(static fn (TestPost $record, Url $url): Url => $url->to('/posts/' . $record->id)->openInNewTab())
        ->meta(['density' => 'compact'])
        ->dontExport();

    expect($column->resolveValue($post))->toBe('HELLO TABLE')
        ->and($column->resolveUrl($post))->toBe([
            'url' => '/posts/' . $post->id,
            'target' => '_blank',
        ])
        ->and($column->toArray())->toBe([
            'key' => 'headline',
            'name' => 'title',
            'type' => 'text',
            'label' => 'Headline',
            'visible' => true,
            'sortable' => true,
            'searchable' => true,
            'toggleable' => false,
            'sticky' => true,
            'alignment' => 'center',
            'width' => '14rem',
            'minWidth' => 160,
            'maxWidth' => 320,
            'labelClass' => 'font-medium',
            'cellClass' => 'text-sm',
            'defaultValue' => 'Untitled',
            'export' => ['enabled' => false],
            'meta' => ['density' => 'compact'],
            'tooltip' => 'Title tooltip',
        ]);

    $imageColumn = ImageColumn::make('title')
        ->image(static fn (Image $image, TestPost $record): Image => $image
            ->url(['/one.png', '', '/two.png'])
            ->rounded()
            ->large()
            ->alt($record->title)
            ->limit(2));

    expect($imageColumn->resolveImage($post))->toBe([
        'url' => null,
        'urls' => ['/one.png', '/two.png'],
        'icon' => null,
        'size' => 'large',
        'width' => null,
        'height' => null,
        'rounded' => true,
        'position' => 'start',
        'class' => '',
        'alt' => 'Hello Table',
        'title' => '',
        'limit' => 2,
    ]);
});

it('stores badge and boolean column component specific meta', function (): void {
    $badge = BadgeColumn::make('status')
        ->colors(['published' => 'green'])
        ->solid()
        ->icon('check');

    $boolean = BooleanColumn::make('active')
        ->trueLabel('Yes')
        ->falseLabel('No')
        ->nullLabel('Unknown')
        ->trueIcon('check')
        ->falseIcon('x')
        ->displayAs('badge');

    expect($badge->toArray()['meta'])->toBe([
        'colors' => ['published' => 'green'],
        'variant' => 'solid',
        'icon' => 'check',
    ])
        ->and($boolean->toArray()['meta'])->toBe([
            'trueLabel' => 'Yes',
            'falseLabel' => 'No',
            'nullLabel' => 'Unknown',
            'trueIcon' => 'check',
            'falseIcon' => 'x',
            'displayAs' => 'badge',
        ]);
});

it('serializes action authorization visibility confirm urls and execution', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft post', 'status' => 'draft']);

    $action = Action::make('Review post')
        ->key('review')
        ->asDangerButton()
        ->asBulkAction(chunkSize: 0, strategy: 'invalid')
        ->confirm('Review :title?', 'This affects :status.', 'Review', 'Cancel')
        ->icon('eye')
        ->tooltip('Review this record')
        ->hideLabel()
        ->class('text-red-600')
        ->meta(['requiresReason' => true])
        ->data(['source' => 'tests'])
        ->handle(static fn (TestPost $record): string => 'handled:' . $record->id);

    $row = $action->forRow($post);
    $bulk = $action->forBulk();

    expect($action->execute($post))->toBe('handled:' . $post->id)
        ->and($row['key'])->toBe('review')
        ->and($row['label'])->toBe('Review post')
        ->and($row['type'])->toBe('action')
        ->and($row['endpoint'])->toBe('/zonvoir-table/actions')
        ->and($row['bulk'])->toBeTrue()
        ->and($row['onlyBulk'])->toBeFalse()
        ->and($row['chunkSize'])->toBe(1)
        ->and($row['chunkStrategy'])->toBe('chunkById')
        ->and($row['confirm'])->toBe([
            'title' => 'Review Draft post?',
            'message' => 'This affects draft.',
            'confirmButton' => 'Review',
            'cancelButton' => 'Cancel',
        ])
        ->and($row['variantColor'])->toBe('red')
        ->and($row['icon'])->toBe('eye')
        ->and($row['tooltip'])->toBe('Review this record')
        ->and($row['showLabel'])->toBeFalse()
        ->and($row['class'])->toBe('text-red-600')
        ->and($row['meta'])->toBe(['requiresReason' => true])
        ->and($row['data'])->toBe(['source' => 'tests'])
        ->and($bulk['key'])->toBe('review');
});

it('hides or disables actions when not authorized hidden or url disabled', function (): void {
    $post = TestPost::query()->create(['title' => 'Draft post']);

    $unauthorized = Action::make('Delete')->authorize(false);
    $hidden = Action::make('Secret')->hidden();
    $urlDisabled = Action::make('Open', url: static fn (TestPost $record, Url $url): Url => $url->to('/posts/' . $record->id)->disabled());
    $onlyBulk = Action::make('Archive')->onlyAsBulkAction();

    expect($unauthorized->forRow($post)['authorized'])->toBeFalse()
        ->and($unauthorized->forRow($post)['disabled'])->toBeTrue()
        ->and($hidden->forRow($post))->toBeNull()
        ->and($urlDisabled->forRow($post)['disabled'])->toBeTrue()
        ->and($onlyBulk->forRow($post))->toBeNull()
        ->and($onlyBulk->forBulk()['key'])->toBe('archive');
});

it('allows action success and error callbacks to customize responses', function (): void {
    $action = Action::make('Sync')
        ->success(static fn (array $payload): array => array_replace($payload, ['message' => 'Synced']))
        ->error(static fn (\RuntimeException $exception, array $payload): array => array_replace($payload, ['message' => 'Failed: ' . $exception->getMessage()]));

    expect($action->successResponse(['ok' => true])['message'])->toBe('Synced')
        ->and($action->errorResponse(new \RuntimeException('boom'), ['ok' => false])['message'])->toBe('Failed: boom');
});

it('requires action names', function (): void {
    Action::make('');
})->throws(InertiaTableException::class, 'Action name cannot be empty.');
