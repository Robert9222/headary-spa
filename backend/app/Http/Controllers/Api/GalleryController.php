<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    // Public endpoints
    public function index()
    {
        return response()->json(
            Gallery::where('is_active', true)
                ->orderBy('order')
                ->get()
        );
    }

    public function show(Gallery $gallery)
    {
        return response()->json($gallery);
    }

    // Admin endpoints
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'image_url' => 'required|string',
            'service_id' => 'nullable|exists:services,id',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $gallery = Gallery::create($validated);
        return response()->json($gallery, 201);
    }

    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'image_url' => 'sometimes|string',
            'service_id' => 'nullable|exists:services,id',
            'order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        $gallery->update($validated);
        return response()->json($gallery);
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();
        return response()->json(null, 204);
    }
}

