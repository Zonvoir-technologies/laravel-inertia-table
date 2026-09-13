<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TestAuthor extends Model
{
    public $timestamps = false;

    protected $table = 'zonvoir_test_authors';

    protected $guarded = [];

    public function posts(): HasMany
    {
        return $this->hasMany(TestPost::class, 'author_id');
    }
}
