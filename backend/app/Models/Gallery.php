<?php

namespace App\Models;

use App\Models\Concerns\NormalizesImageUrls;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use NormalizesImageUrls;

    protected $table = 'gallery';

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'service_id',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}

