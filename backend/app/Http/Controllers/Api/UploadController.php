<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WebpConverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Admin: generic image uploader.
     * Accepts: image file (max 8 MB), optional "folder" (default "uploads").
     * Po zapisie próbujemy skonwertować do WebP (sharp/Node) i zwrócić
     * lżejszą wersję. Gdy konwersja się nie uda, zostaje oryginał.
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

        // Spróbuj wygenerować WebP (i usunąć oryginał, gdy się powiedzie).
        $path = WebpConverter::convert($path);

        // Zwracamy ścieżkę WZGLĘDNĄ ('/storage/...'), żeby działało zarówno
        // w trybie lokalnym (localhost:8000), jak i na produkcji.
        $url = '/storage/' . ltrim($path, '/');

        return response()->json([
            'path' => $path,
            'image_url' => $url,
        ]);
    }
}

