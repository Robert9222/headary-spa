<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            [
                'name' => 'Eliza Johnson',
                'email' => 'eliza@headary-spa.local',
                'phone' => '+48123456789',
                'specialization' => 'Head Spa & Massage Therapy',
                'avatar_url' => 'https://via.placeholder.com/150x150?text=Eliza',
                'bio' => 'Certified spa therapist with 5+ years of experience in traditional and modern head spa techniques.',
                'is_active' => true,
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria@headary-spa.local',
                'phone' => '+48123456790',
                'specialization' => 'Facial Spa & Skincare',
                'avatar_url' => 'https://via.placeholder.com/150x150?text=Maria',
                'bio' => 'Expert in facial treatments and skincare with knowledge of natural products.',
                'is_active' => true,
            ],
            [
                'name' => 'Anna Kowalski',
                'email' => 'anna@headary-spa.local',
                'phone' => '+48123456791',
                'specialization' => 'Wellness & Relaxation',
                'avatar_url' => 'https://via.placeholder.com/150x150?text=Anna',
                'bio' => 'Holistic wellness specialist dedicated to providing ultimate relaxation experiences.',
                'is_active' => true,
            ],
            [
                'name' => 'Sophie Martin',
                'email' => 'sophie@headary-spa.local',
                'phone' => '+48123456792',
                'specialization' => 'Premium Treatments',
                'avatar_url' => 'https://via.placeholder.com/150x150?text=Sophie',
                'bio' => 'Luxury spa therapist specializing in premium and customized spa packages.',
                'is_active' => true,
            ],
        ];

        foreach ($employees as $employee) {
            Employee::create($employee);
        }
    }
}

