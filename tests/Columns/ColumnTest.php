<?php

declare(strict_types=1);


use Zonvoir\InertiaTable\Columns\TextColumn;
use Zonvoir\InertiaTable\Enums\ColumnAlignment;
use Zonvoir\InertiaTable\Url;

it('serializes common column configuration', function (): void {
    $column = TextColumn::make('author.name')
        ->key('author')
        ->label('Author')
        ->sortable()
        ->searchable()
        ->sticky()
        ->width(240);

    expect($column->toArray())->toMatchArray([
        'key' => 'author',
        'name' => 'author.name',
        'type' => 'text',
        'label' => 'Author',
        'sortable' => true,
        'searchable' => true,
        'sticky' => true,
        'width' => 240,
    ]);
});

it('resolves labels values urls images and export configuration', function (): void {
    $record = ['title' => 'Hello', 'image' => '/image.png'];
    $column = TextColumn::make('title')
        ->label(static fn (): string => 'Headline')
        ->alignment(ColumnAlignment::Center)
        ->defaultValue('Untitled')
        ->mapAs(static fn (mixed $value): string => strtoupper((string) $value))
        ->url(static fn (): Url => (new Url())->to('/posts/1'))
        ->image('image')
        ->exportLabel(static fn (): string => 'Export headline')
        ->exportAs(static fn (mixed $value): string => strtolower((string) $value))
        ->exportFormat('@')
        ->exportStyle(['font' => ['bold' => true]]);

    expect($column->resolvedLabel())->toBe('Headline')
        ->and($column->resolveValue($record))->toBe('HELLO')
        ->and($column->resolveUrl($record)['url'])->toBe('/posts/1')
        ->and($column->resolveImage($record)['url'])->toBe('/image.png')
        ->and($column->resolvedExportLabel())->toBe('Export headline')
        ->and($column->resolveExportValue($record))->toBe('hello')
        ->and($column->resolvedExportFormat())->toBe('@')
        ->and($column->resolvedExportStyle())->toBe(['font' => ['bold' => true]])
        ->and($column->toArray()['alignment'])->toBe('center');
});
it('exposes search and sort flags and callbacks', function (): void {
    $searchCallback = static fn (): string => 'searched';
    $sortCallback = static fn (): string => 'sorted';

    $column = TextColumn::make('title')
        ->searchable()
        ->searchUsing($searchCallback)
        ->sortable()
        ->sortUsing($sortCallback);

    expect($column->isSearchable())->toBeTrue()
        ->and($column->searchCallback())->toBeInstanceOf(\Closure::class)
        ->and(($column->searchCallback())())->toBe('searched')
        ->and($column->isSortable())->toBeTrue()
        ->and($column->sortCallback())->toBeInstanceOf(\Closure::class)
        ->and(($column->sortCallback())())->toBe('sorted');
});

it('serializes all common layout visibility and export toggles', function (): void {
    $column = TextColumn::create(
        name: 'title',
        label: 'Title',
        sortable: true,
        toggleable: false,
        searchable: true,
        visible: false,
        meta: ['initial' => true],
        sticky: true,
        labelClass: 'text-xs',
        cellClass: 'truncate',
    )
        ->alignment('custom-align')
        ->minWidth('12rem')
        ->maxWidth(480)
        ->tooltip('Visible in the header')
        ->export(['queued' => true])
        ->exportAs(false);

    expect($column->type())->toBe('text')
        ->and($column->name())->toBe('title')
        ->and($column->resolvedKey())->toBe('title')
        ->and($column->isExportable())->toBeFalse()
        ->and($column->toArray())->toMatchArray([
            'label' => 'Title',
            'visible' => false,
            'sortable' => true,
            'searchable' => true,
            'toggleable' => false,
            'sticky' => true,
            'alignment' => 'custom-align',
            'minWidth' => '12rem',
            'maxWidth' => 480,
            'labelClass' => 'text-xs',
            'cellClass' => 'truncate',
            'tooltip' => 'Visible in the header',
            'export' => ['queued' => true, 'enabled' => false],
            'meta' => ['initial' => true],
        ]);
});

it('resolves fallback values plain urls and configurable images', function (): void {
    $record = ['title' => null, 'avatar' => ['/one.png', '/two.png']];

    $column = TextColumn::make('title')
        ->defaultValue('Untitled')
        ->url('/posts')
        ->image('avatar', static fn (\Zonvoir\InertiaTable\Image $image): \Zonvoir\InertiaTable\Image => $image->small()->limit(1));

    expect($column->resolveValue($record))->toBeNull()
        ->and($column->toArray()['defaultValue'])->toBe('Untitled')
        ->and($column->resolveUrl($record))->toBe('/posts')
        ->and($column->resolveImage($record))->toMatchArray([
            'urls' => ['/one.png', '/two.png'],
            'size' => 'small',
            'limit' => 1,
        ]);
});

it('covers nullable URLs, image callback signatures, and export callbacks', function (): void {
    $record = ['avatar' => '/avatar.png'];
    $column = TextColumn::make('avatar')
        ->url(null)
        ->image(static fn (): string => '/generated.png', static fn (\Zonvoir\InertiaTable\Image $image, array $record): \Zonvoir\InertiaTable\Image => $image->rounded())
        ->exportStyle(static fn (mixed $sheet): array => ['sheet' => $sheet])
        ->exportLabel(static fn (): string => 'Label');
    $recordCallback = TextColumn::make('avatar')->image(static fn (array $record): string => $record['avatar']);
    $twoArgumentCallback = TextColumn::make('avatar')->image(static fn (array $record, \Zonvoir\InertiaTable\Image $image): \Zonvoir\InertiaTable\Image => $image->small());

    expect($column->resolveUrl($record))->toBeNull()
        ->and($column->resolveImage($record))->toMatchArray(['url' => '/generated.png', 'rounded' => true])
        ->and($recordCallback->resolveImage($record)['url'])->toBe('/avatar.png')
        ->and($twoArgumentCallback->resolveImage($record)['size'])->toBe('small')
        ->and($column->resolvedExportLabel())->toBe('Label')
        ->and($column->resolvedExportStyle('Sheet'))->toBe(['sheet' => 'Sheet']);
});

it('returns null when an export style callback does not return an array', function (): void {
    expect(TextColumn::make('title')->exportStyle(static fn (): string => 'bad')->resolvedExportStyle())->toBeNull();
});

it('uses string export labels', function (): void {
    expect(TextColumn::make('title')->exportLabel('Title')->resolvedExportLabel())->toBe('Title');
});
