<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@headary-spa.local',
            'password' => bcrypt('admin123'),
            'is_admin' => true,
        ]);

        // Run seeders
        $this->call([
            ServiceSeeder::class,
            EmployeeSeeder::class,
            GallerySeeder::class,
            SettingSeeder::class,
            KobidoPageSeeder::class,
            HomePageSeeder::class,
            HeadarySpaPageSeeder::class,
        ]);
    }
}


