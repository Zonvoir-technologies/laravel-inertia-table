<?php

declare(strict_types=1);

use Zonvoir\InertiaTable\SearchTermParser;

it('parses plain and quoted search terms', function (): void {
    expect((new SearchTermParser())->parse('alpha "beta gamma"'))->toBe(['alpha', 'beta gamma']);
});

it('returns an empty list for null blank and whitespace search', function (): void {
    $parser = new SearchTermParser();

    expect($parser->parse(null))->toBe([])
        ->and($parser->parse(''))->toBe([])
        ->and($parser->parse('   '))->toBe([]);
});

it('trims terms and ignores extra spacing', function (): void {
    expect((new SearchTermParser())->parse('  alpha   beta  " gamma "  '))->toBe(['alpha', 'beta', 'gamma']);
});
