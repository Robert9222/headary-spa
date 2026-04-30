<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'site_name',
                'value' => 'Headary Spa',
                'description' => 'Main site name',
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Relaxation & Wellness',
                'description' => 'Site tagline',
            ],
            [
                'key' => 'primary_color',
                'value' => '#8B6F47',
                'description' => 'Primary brand color',
            ],
            [
                'key' => 'secondary_color',
                'value' => '#D4AF37',
                'description' => 'Secondary brand color (gold)',
            ],
            [
                'key' => 'accent_color',
                'value' => '#E8DCC8',
                'description' => 'Accent color',
            ],
            [
                'key' => 'font_primary',
                'value' => 'Nunito, sans-serif',
                'description' => 'Primary font family',
            ],
            [
                'key' => 'font_secondary',
                'value' => 'Playfair Display, serif',
                'description' => 'Secondary font family for headings',
            ],
            [
                'key' => 'hero_title',
                'value' => 'Welcome to Headary Spa',
                'description' => 'Hero section title',
            ],
            [
                'key' => 'hero_subtitle',
                'value' => 'Experience ultimate relaxation and wellness',
                'description' => 'Hero section subtitle',
            ],
            [
                'key' => 'phone',
                'value' => '+48123456789',
                'description' => 'Contact phone number',
            ],
            [
                'key' => 'email',
                'value' => 'info@headary-spa.local',
                'description' => 'Contact email',
            ],
            [
                'key' => 'timma_url',
                'value' => 'https://timma.no/salong/headary-spa',
                'description' => 'Timma booking URL',
            ],
            [
                'key' => 'address',
                'value' => 'ul. Spa 123, 31-000 Kraków, Poland',
                'description' => 'Business address',
            ],
            [
                'key' => 'about_description',
                'value' => 'Headary Spa is dedicated to providing the highest quality spa and wellness treatments in a luxurious environment.',
                'description' => 'About section description',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}

