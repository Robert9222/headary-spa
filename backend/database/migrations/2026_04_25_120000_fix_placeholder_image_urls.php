<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * One-shot data fix:
     *  - replaces the dead via.placeholder.com image URLs in services & gallery
     *    with the real photos that already live in the Angular `assets/images/`
     *    folder (so admin previews and public listings actually render).
     */
    public function up(): void
    {
        // Services: match by name -> known asset.
        $services = [
            'Head Spa Classic Ritual'    => 'assets/images/_MG_0275.jpg',
            'Head Spa Classic & Face'    => 'assets/images/_MG_1387.jpg',
            'VIP Head Spa Ritual'        => 'assets/images/_MG_0453.jpg',
            'Kobido Facelifting Massage' => 'assets/images/_MG_1327.jpg',
        ];
        foreach ($services as $name => $url) {
            DB::table('services')->where('name', $name)->update(['image_url' => $url]);
        }

        // Replace anything still on placeholder.com for services we don't know about.
        DB::table('services')
            ->where('image_url', 'like', '%via.placeholder.com%')
            ->update(['image_url' => 'assets/images/_MG_0013.jpg']);

        // Gallery: deterministic mapping by title where possible.
        $galleryByTitle = [
            'Head Spa Classic Ritual'        => 'assets/images/_MG_0275.jpg',
            'Premium Spa Ambiance'           => 'assets/images/_MG_0013.jpg',
            'Head Spa with Face Treatment'   => 'assets/images/_MG_1387.jpg',
            'Organic Spa Products'           => 'assets/images/_MG_0079.jpg',
            'VIP Head Spa Ritual'            => 'assets/images/_MG_0453.jpg',
            'Relaxation Corner'              => 'assets/images/_MG_0207.jpg',
            'Kobido Facelifting Massage'     => 'assets/images/_MG_1327.jpg',
            'Spa Candles & Ambiance'         => 'assets/images/_MG_0327.jpg',
            'Premium Treatment Room'         => 'assets/images/_MG_1313.jpg',
            'Herbal Tea Experience'          => 'assets/images/_MG_1467.jpg',
            'Spa Wellness Zone'              => 'assets/images/_MG_1355.jpg',
            'Spa Entrance'                   => 'assets/images/_MG_1533.jpg',
        ];
        foreach ($galleryByTitle as $title => $url) {
            DB::table('gallery')->where('title', $title)->update(['image_url' => $url]);
        }

        // Catch-all: anything still placeholder gets a default existing photo.
        $fallbackPool = [
            'assets/images/_MG_0020.jpg',
            'assets/images/_MG_0056.jpg',
            'assets/images/_MG_0124.jpg',
            'assets/images/_MG_0267.jpg',
            'assets/images/_MG_0399.jpg',
        ];
        $stale = DB::table('gallery')
            ->where('image_url', 'like', '%via.placeholder.com%')
            ->orderBy('id')
            ->get();
        foreach ($stale as $i => $row) {
            DB::table('gallery')
                ->where('id', $row->id)
                ->update(['image_url' => $fallbackPool[$i % count($fallbackPool)]]);
        }
    }

    public function down(): void
    {
        // No-op: we don't want to bring back broken placeholder URLs.
    }
};

