<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->index();
            $table->string('section_key');
            $table->string('type'); // hero | rich-text | two-column-lists | list | warning-list | cta
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('image_url')->nullable();

            // Translatable fields (stored as JSON by spatie/laravel-translatable)
            $table->json('title')->nullable();      // { pl: "...", en: "...", fi: "..." }
            $table->json('subtitle')->nullable();   // eyebrow / lead-in
            $table->json('body')->nullable();       // main markdown content
            $table->json('content')->nullable();    // structured JSON per type (lists, columns, ...)

            $table->json('meta')->nullable();       // non-translatable: variants, cta URLs, etc.
            $table->timestamps();

            $table->unique(['page_key', 'section_key']);
            $table->index(['page_key', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};

