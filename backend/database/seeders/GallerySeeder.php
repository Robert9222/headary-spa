<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $gallery = [
            [
                'title' => 'Head Spa Classic Ritual',
                'description' => 'Relaxing head spa treatment',
                'image_url' => 'assets/images/_MG_0275.jpg',
                'service_id' => 1,
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Premium Spa Ambiance',
                'description' => 'Our luxurious spa environment',
                'image_url' => 'assets/images/_MG_0013.jpg',
                'service_id' => null,
                'order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Head Spa with Face Treatment',
                'description' => 'Combined head and facial spa treatment',
                'image_url' => 'assets/images/_MG_1387.jpg',
                'service_id' => 2,
                'order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Organic Spa Products',
                'description' => 'Premium organic products used in our treatments',
                'image_url' => 'assets/images/_MG_0079.jpg',
                'service_id' => null,
                'order' => 4,
                'is_active' => true,
            ],
            [
                'title' => 'VIP Head Spa Ritual',
                'description' => 'Our premium VIP spa treatment',
                'image_url' => 'assets/images/_MG_0453.jpg',
                'service_id' => 3,
                'order' => 5,
                'is_active' => true,
            ],
            [
                'title' => 'Relaxation Corner',
                'description' => 'Peaceful relaxation space',
                'image_url' => 'assets/images/_MG_0207.jpg',
                'service_id' => null,
                'order' => 6,
                'is_active' => true,
            ],
            [
                'title' => 'Kobido Facelifting Massage',
                'description' => 'Japanese facial rejuvenation treatment',
                'image_url' => 'assets/images/_MG_1327.jpg',
                'service_id' => 4,
                'order' => 7,
                'is_active' => true,
            ],
            [
                'title' => 'Spa Candles & Ambiance',
                'description' => 'Creating perfect spa atmosphere',
                'image_url' => 'assets/images/_MG_0327.jpg',
                'service_id' => null,
                'order' => 8,
                'is_active' => true,
            ],
            [
                'title' => 'Premium Treatment Room',
                'description' => 'Our main treatment facility',
                'image_url' => 'assets/images/_MG_1313.jpg',
                'service_id' => null,
                'order' => 9,
                'is_active' => true,
            ],
            [
                'title' => 'Herbal Tea Experience',
                'description' => 'Relaxing herbal tea after treatment',
                'image_url' => 'assets/images/_MG_1467.jpg',
                'service_id' => null,
                'order' => 10,
                'is_active' => true,
            ],
            [
                'title' => 'Spa Wellness Zone',
                'description' => 'Complete wellness experience',
                'image_url' => 'assets/images/_MG_1355.jpg',
                'service_id' => null,
                'order' => 11,
                'is_active' => true,
            ],
            [
                'title' => 'Spa Entrance',
                'description' => 'Welcome to Headary Spa',
                'image_url' => 'assets/images/_MG_1533.jpg',
                'service_id' => null,
                'order' => 12,
                'is_active' => true,
            ],
        ];

        foreach ($gallery as $item) {
            Gallery::create($item);
        }
    }
}

