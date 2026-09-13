<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests;

use Symfony\Component\Process\Process;

uses(TestCase::class);

test('release version checker succeeds when git tag matches package version', function (): void {
    $script = dirname(__DIR__) . '/scripts/verify-release-version.mjs';
    $process = new Process(['node', $script, 'v0.1.0']);
    $process->run();

    expect($process->isSuccessful())->toBeTrue();
    expect($process->getOutput())->toContain('Release version verification passed');
});

test('release version checker succeeds with GITHUB_REF_NAME env var', function (): void {
    $script = dirname(__DIR__) . '/scripts/verify-release-version.mjs';
    $process = new Process(['node', $script], env: ['GITHUB_REF_NAME' => 'v0.1.0']);
    $process->run();

    expect($process->isSuccessful())->toBeTrue();
    expect($process->getOutput())->toContain('Release version verification passed');
});

test('release version checker fails when release tag is missing', function (): void {
    $script = dirname(__DIR__) . '/scripts/verify-release-version.mjs';
    $process = new Process(['node', $script], env: ['GITHUB_REF_NAME' => '']);
    $process->run();

    expect($process->isSuccessful())->toBeFalse();
    expect($process->getErrorOutput())->toContain('Missing release tag');
});

test('release version checker fails on invalid tag format without leading v', function (): void {
    $script = dirname(__DIR__) . '/scripts/verify-release-version.mjs';
    $process = new Process(['node', $script, '1.0.0']);
    $process->run();

    expect($process->isSuccessful())->toBeFalse();
    expect($process->getErrorOutput())->toContain('must strictly follow semantic versioning prefixed with \'v\'');
});

test('release version checker fails on version mismatch', function (): void {
    $script = dirname(__DIR__) . '/scripts/verify-release-version.mjs';
    $process = new Process(['node', $script, 'v2.0.0']);
    $process->run();

    expect($process->isSuccessful())->toBeFalse();
    expect($process->getErrorOutput())->toContain('Version mismatch detected');
});
