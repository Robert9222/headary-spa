<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Head Spa Classic Ritual',
                'category' => 'Head Spa',
                'description' => 'Jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰90min.',
                'price' => 99.00,
                'duration_minutes' => 90,
                'image_url' => 'assets/images/_MG_0275.jpg',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Head Spa Classic & Face',
                'category' => 'Head Spa',
                'description' => 'Gentle facial massage finished with a calming sheet mask, jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰105min.',
                'price' => 109.00,
                'duration_minutes' => 105,
                'image_url' => 'assets/images/_MG_1387.jpg',
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'VIP Head Spa Ritual',
                'category' => 'Head Spa',
                'description' => 'Massage of chest, neck and nape, gentle facial massage finished with a calming sheet mask, jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰120min.',
                'price' => 129.00,
                'duration_minutes' => 120,
                'image_url' => 'assets/images/_MG_0453.jpg',
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'Kobido Facelifting Massage',
                'category' => 'Other Massage',
                'description' => 'Kobido is a unique Japanese facial massage, considered one of the most advanced manual facial treatments in the world. By combining intensive lifting techniques, deep relaxation, and precise muscle work, Kobido naturally rejuvenates facial features, improves skin firmness, and restores a healthy glow. This multi-level therapy not only smooths wrinkles and defines the facial contour, but also releases deep muscular tension, reduces stress, and supports lymphatic drainage - combining aesthetic results with full-body regeneration. Each Kobido session is individually tailored to your skin and muscle needs. A Kobido session includes: ➡️Deep muscle tension release ➡️Manual lymphatic drainage to support detoxification and circulation ➡️Intensive lifting massage to sculpt and firm the face ➡️Relaxation elements to reduce stress and emotional tension 🕛 Each session lasts approximately 60 to 90 minutes.',
                'price' => 69.00,
                'duration_minutes' => 75,
                'image_url' => 'assets/images/_MG_1327.jpg',
                'is_active' => true,
                'order' => 4,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}

