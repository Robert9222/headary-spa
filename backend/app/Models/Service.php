<?php

namespace App\Models;

use App\Models\Concerns\NormalizesImageUrls;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Service extends Model
{
    use HasTranslations;
    use NormalizesImageUrls;

    public $translatable = ['name', 'description'];

    protected $fillable = [
        'name',
        'category',
        'description',
        'duration_minutes',
        'price',
        'image_url',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];


    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
