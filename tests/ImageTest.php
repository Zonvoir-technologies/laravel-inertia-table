<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\ImagePosition;
use Zonvoir\InertiaTable\Enums\ImageSize;
use Zonvoir\InertiaTable\Image;
use Zonvoir\InertiaTable\Tests\TestCase;

uses(TestCase::class);

it('serializes default image configuration', function (): void {
    expect(Image::make()->toArray())->toBe([
        'url' => null,
        'urls' => [],
        'icon' => null,
        'size' => 'medium',
        'width' => null,
        'height' => null,
        'rounded' => false,
        'position' => 'start',
        'class' => '',
        'alt' => '',
        'title' => '',
        'limit' => null,
    ]);
});

it('normalizes blank single urls and multiple urls', function (): void {
    expect(Image::make()->url('   ')->toArray()['url'])->toBeNull()
        ->and(Image::make()->url(['/one.png', '', '  ', '/two.png'])->toArray())->toMatchArray([
            'url' => null,
            'urls' => ['/one.png', '/two.png'],
        ]);
});

it('serializes image sizing positioning classes labels and limits', function (): void {
    $image = Image::make()
        ->to('/avatar.png')
        ->size(ImageSize::Large)
        ->position(ImagePosition::End)
        ->dimensions(64, 32)
        ->rounded()
        ->class(' rounded-md ')
        ->class('')
        ->alt('Avatar')
        ->title('Profile photo')
        ->icon('user')
        ->limit(-5);

    expect($image->toArray())->toMatchArray([
        'url' => '/avatar.png',
        'icon' => 'user',
        'size' => 'large',
        'width' => 64,
        'height' => 32,
        'rounded' => true,
        'position' => 'end',
        'class' => 'rounded-md',
        'alt' => 'Avatar',
        'title' => 'Profile photo',
        'limit' => 0,
    ]);
});

it('uses convenience methods for size and position', function (): void {
    expect(Image::make()->small()->toArray()['size'])->toBe('small')
        ->and(Image::make()->medium()->toArray()['size'])->toBe('medium')
        ->and(Image::make()->large()->toArray()['size'])->toBe('large')
        ->and(Image::make()->extraLarge()->toArray()['size'])->toBe('extra-large')
        ->and(Image::make()->start()->toArray()['position'])->toBe('start')
        ->and(Image::make()->end()->toArray()['position'])->toBe('end');
});

it('json serializes to the same array payload', function (): void {
    $image = Image::make()->url('/image.png');

    expect($image->jsonSerialize())->toBe($image->toArray());
});

it('resolves route signed route and temporary signed route image urls', function (): void {
    $route = Image::make()->route('zonvoir-table.exports.execute');
    $signed = Image::make()->signedRoute('zonvoir-table.exports.execute');
    $temporary = Image::make()->temporarySignedRoute('zonvoir-table.exports.execute', new DateTimeImmutable('+5 minutes'));

    expect($route->toArray()['url'])->toBe('http://localhost/zonvoir-table/exports')
        ->and($signed->toArray()['url'])->toStartWith('http://localhost/zonvoir-table/exports?signature=')
        ->and($temporary->toArray()['url'])->toContain('http://localhost/zonvoir-table/exports?expires=')
        ->and($temporary->toArray()['url'])->toContain('signature=');
});

it('can set width height and rounded state independently', function (): void {
    $image = Image::make()
        ->width(120)
        ->height(80)
        ->rounded(false);

    expect($image->toArray())->toMatchArray([
        'width' => 120,
        'height' => 80,
        'rounded' => false,
    ]);
});
