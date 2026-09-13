<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TestPost extends Model
{
    public $timestamps = false;

    protected $table = 'zonvoir_test_posts';

    protected $guarded = [];

    public function author(): BelongsTo
    {
        return $this->belongsTo(TestAuthor::class, 'author_id');
    }
}
