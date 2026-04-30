<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Review extends Model
{
    use HasTranslations;

    public $translatable = ['content'];

    protected $fillable = [
        'client_name',
        'client_email',
        'service_id',
        'rating',
        'content',
        'language',
        'is_approved',
        'is_featured',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
