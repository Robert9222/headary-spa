<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Admin: generic image uploader.
     * Accepts: image file (max 8 MB), optional "folder" (default "uploads").
     * Returns: { path, image_url }
     */
    public function image(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:8192',
            'folder' => 'nullable|string|max:50|regex:/^[a-zA-Z0-9_\-]+$/',
        ]);

        $folder = $request->input('folder', 'uploads');
        $path = $request->file('image')->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'path' => $path,
            'image_url' => $url,
        ]);
    }
}

