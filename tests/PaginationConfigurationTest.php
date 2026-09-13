<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\Enums\PaginationType;
use Zonvoir\InertiaTable\Exceptions\InertiaTableException;
use Zonvoir\InertiaTable\PaginationConfiguration;

it('normalizes pagination values', function (): void {
    $pagination = PaginationConfiguration::make(defaultPerPage: 30, perPageOptions: [15, 30, 50]);

    expect($pagination->normalizePage('2'))->toBe(2)
        ->and($pagination->normalizePage(0))->toBe(1)
        ->and($pagination->normalizePage('abc'))->toBe(1)
        ->and($pagination->normalizePerPage('50'))->toBe(50)
        ->and($pagination->normalizePerPage('999'))->toBe(30)
        ->and($pagination->normalizeCursor('  cursor  '))->toBe('cursor')
        ->and($pagination->normalizeCursor('  '))->toBeNull();
});

it('normalizes and de duplicates per page options', function (): void {
    $pagination = PaginationConfiguration::make(type: PaginationType::Cursor, defaultPerPage: 20, perPageOptions: ['10', '20', 20], scrollToTop: false);

    expect($pagination->toArray())->toBe([
        'enabled' => true,
        'type' => 'cursor',
        'defaultPerPage' => 20,
        'perPageOptions' => [10, 20],
        'scrollToTop' => false,
    ]);
});

it('rejects invalid pagination configuration', function (): void {
    expect(fn () => PaginationConfiguration::make(defaultPerPage: 0))->toThrow(InertiaTableException::class)
        ->and(fn () => PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: []))->toThrow(InertiaTableException::class)
        ->and(fn () => PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: ['abc']))->toThrow(InertiaTableException::class)
        ->and(fn () => PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [10]))->toThrow(InertiaTableException::class);
});
it('exposes pagination configuration accessors', function (): void {
    $pagination = PaginationConfiguration::make(
        enabled: false,
        type: PaginationType::Simple,
        defaultPerPage: 20,
        perPageOptions: [10, 20, 40],
        scrollToTop: false,
    );

    expect($pagination->enabled())->toBeFalse()
        ->and($pagination->type())->toBe(PaginationType::Simple)
        ->and($pagination->defaultPerPage())->toBe(20)
        ->and($pagination->perPageOptions())->toBe([10, 20, 40])
        ->and($pagination->scrollToTop())->toBeFalse()
        ->and($pagination->validPerPage(40))->toBeTrue()
        ->and($pagination->validPerPage(15))->toBeFalse();
});

it('validates nonnumeric pagination values and invalid options', function (): void {
    expect(fn () => PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [0]))->toThrow(InertiaTableException::class)
        ->and(PaginationConfiguration::make(defaultPerPage: 15, perPageOptions: [15])->normalizePerPage('bad'))->toBe(15);
});
