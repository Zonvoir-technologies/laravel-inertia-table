<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\HttpMethod;
use Zonvoir\InertiaTable\Tests\TestCase;
use Zonvoir\InertiaTable\Url;

uses(TestCase::class);

it('serializes default url configuration', function (): void {
    expect((new Url())->toArray())->toBe([
        'url' => null,
        'target' => null,
    ]);
});

it('serializes url flags only when enabled', function (): void {
    $url = (new Url())
        ->to('/posts')
        ->openInNewTab()
        ->preserveScroll()
        ->preserveState()
        ->asDownload()
        ->disabled()
        ->hidden()
        ->modal();

    expect($url->toArray())->toMatchArray([
        'url' => '/posts',
        'target' => '_blank',
        'preserveScroll' => true,
        'preserveState' => true,
        'download' => true,
        'disabled' => true,
        'hidden' => true,
        'modal' => true,
    ]);
});

it('serializes prefetch and non get methods', function (): void {
    expect((new Url())->to('/posts')->prefetch('hover', 60)->method(HttpMethod::POST)->toArray())->toMatchArray([
        'prefetch' => ['strategy' => 'hover', 'cacheFor' => 60],
        'method' => 'post',
    ]);
});

it('ignores invalid string http methods', function (): void {
    expect((new Url())->method('invalid')->toArray())->not->toHaveKey('method');
});

it('exposes url value target state string and json serialization', function (): void {
    $url = (new Url())->to('/posts')->openInNewTab();

    expect($url->value())->toBe('/posts')
        ->and($url->shouldOpenInNewTab())->toBeTrue()
        ->and((string) $url)->toBe('/posts')
        ->and($url->jsonSerialize())->toBe($url->toArray());
});

it('resolves route signed route and temporary signed route urls', function (): void {
    $route = (new Url())->route('zonvoir-table.exports.execute', absolute: false);
    $signed = (new Url())->signedRoute('zonvoir-table.exports.execute', absolute: false);
    $temporary = (new Url())->temporarySignedRoute('zonvoir-table.exports.execute', new DateTimeImmutable('+5 minutes'), absolute: false);

    expect($route->value())->toBe('/zonvoir-table/exports')
        ->and($signed->value())->toStartWith('/zonvoir-table/exports?signature=')
        ->and($temporary->value())->toContain('/zonvoir-table/exports?expires=')
        ->and($temporary->value())->toContain('signature=');
});

it('can turn flags off after enabling them', function (): void {
    $url = (new Url())
        ->to('/posts')
        ->openInNewTab(false)
        ->preserveScroll(false)
        ->preserveState(false)
        ->asDownload(false)
        ->disabled(false)
        ->hidden(false)
        ->modal(false);

    expect($url->toArray())->toBe([
        'url' => '/posts',
        'target' => null,
    ]);
});

it('sets a recognized HTTP method', function (): void {
    expect((new Url())->method('post')->toArray()['method'])->toBe('post');
});
