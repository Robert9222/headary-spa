<?php

namespace App\Models;

use App\Models\Concerns\NormalizesImageUrls;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class PageSection extends Model
{
    use HasTranslations;
    use NormalizesImageUrls;

    public $translatable = ['title', 'subtitle', 'body', 'content'];

    protected $fillable = [
        'page_key',
        'section_key',
        'type',
        'order',
        'is_active',
        'image_url',
        'title',
        'subtitle',
        'body',
        'content',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'meta' => 'array',
    ];

    public function scopeForPage($query, string $pageKey)
    {
        return $query->where('page_key', $pageKey)->orderBy('order');
    }
}

