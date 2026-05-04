<?php

namespace App\Models;

use App\Models\Concerns\NormalizesImageUrls;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use NormalizesImageUrls;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'specialization',
        'avatar_url',
        'bio',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
