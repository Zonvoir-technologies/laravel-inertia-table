<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\RelationFieldResolver;

it('returns null for non relation fields', function (): void {
    $resolver = new RelationFieldResolver();

    expect($resolver->resolve('title'))->toBeNull()
        ->and($resolver->resolve('.title'))->toBeNull()
        ->and($resolver->resolve('author.'))->toBeNull();
});

it('resolves nested relation fields', function (): void {
    expect((new RelationFieldResolver())->resolve('author.company.name'))->toBe([
        'relation' => 'author.company',
        'column' => 'name',
    ]);
});

it('returns null when no relation segments remain', function (): void {
    expect((new RelationFieldResolver())->resolve('.'))->toBeNull();
});
