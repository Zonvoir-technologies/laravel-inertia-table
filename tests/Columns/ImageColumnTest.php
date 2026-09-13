<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Columns\ImageColumn;
use Zonvoir\InertiaTable\Image;

it('resolves configured image data', function (): void {
    $column = ImageColumn::make('avatar')->image(static fn (Image $image): Image => $image->url('/avatar.png')->rounded());

    expect($column->resolveImage([]))->toMatchArray([
        'url' => '/avatar.png',
        'rounded' => true,
    ]);
});

it('inherits column factory behavior', function (): void {
    expect(ImageColumn::create('avatar')->toArray())->toMatchArray([
        'name' => 'avatar',
        'type' => 'image',
    ]);
});
it('serializes image column display metadata', function (): void {
    expect(ImageColumn::make('avatar')
        ->imageWidth(48)
        ->imageHeight('3rem')
        ->rounded()
        ->circle()
        ->fit('cover')
        ->alt('Avatar')
        ->placeholder('/placeholder.png')
        ->toArray()['meta'])->toBe([
            'imageWidth' => 48,
            'imageHeight' => '3rem',
            'shape' => 'circle',
            'fit' => 'cover',
            'alt' => 'Avatar',
            'placeholder' => '/placeholder.png',
        ]);
});
