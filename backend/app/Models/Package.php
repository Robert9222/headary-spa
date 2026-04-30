<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_minutes',
        'service_ids',
        'is_active',
    ];

    protected $casts = [
        'service_ids' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];
}
