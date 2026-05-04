<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Plikowy menedżer galerii.
 *
 * Wszystkie zdjęcia trzymamy w katalogu `storage/app/public/images`
 * (publicznie dostępne pod URL-em /storage/images/<plik>).
 *
 * Przy pierwszym wywołaniu listingu, jeśli katalog jest pusty,
 * zostanie zasiedlony plikami z `frontend/src/assets/images`,
 * tak aby admin widział od razu pełną kolekcję zdjęć projektu.
 */
class GalleryFilesController extends Controller
{
    private const FOLDER = 'images';
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    /**
     * GET /api/admin/gallery/files
     */
    public function index()
    {
        $disk = Storage::disk('public');

        if (!$disk->exists(self::FOLDER)) {
            $disk->makeDirectory(self::FOLDER);
        }

        // Auto-seed: jeżeli katalog jest pusty, skopiuj pliki z frontendu.
        $existing = collect($disk->files(self::FOLDER));
        if ($existing->isEmpty()) {
            $this->seedFromFrontend($disk);
        }

        $files = collect($disk->files(self::FOLDER))
            ->filter(fn ($p) => in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), self::ALLOWED_EXTENSIONS, true))
            ->map(function ($path) use ($disk) {
                $name = basename($path);
                return [
                    'name' => $name,
                    'path' => $path, // np. images/foo.jpg
                    'url' => $disk->url($path), // np. http://.../storage/images/foo.jpg lub /storage/...
                    'size' => $disk->size($path),
                    'modified' => $disk->lastModified($path),
                ];
            })
            ->sortBy('name')
            ->values();

        return response()->json($files);
    }

    /**
     * POST /api/admin/gallery/files  (multipart: image)
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:8192',
        ]);

        $file = $request->file('image');
        $original = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());

        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            return response()->json(['message' => 'Niedozwolone rozszerzenie pliku.'], 422);
        }

        $base = pathinfo($original, PATHINFO_FILENAME);
        $base = preg_replace('/[^A-Za-z0-9_\-]+/', '_', $base) ?: 'image';
        $base = trim($base, '_-');
        if ($base === '') {
            $base = 'image';
        }

        $disk = Storage::disk('public');
        $disk->makeDirectory(self::FOLDER);

        // Unikalna nazwa: jeśli istnieje, dołóż sufiks.
        $name = $base . '.' . $extension;
        $i = 1;
        while ($disk->exists(self::FOLDER . '/' . $name)) {
            $name = $base . '_' . $i . '.' . $extension;
            $i++;
        }

        $path = $file->storeAs(self::FOLDER, $name, 'public');

        // Konwersja do WebP (oszczędność transferu ~70%). Po sukcesie ścieżka
        // wskazuje już na plik .webp, oryginał jest usuwany.
        $path = WebpConverter::convert($path);

        return response()->json([
            'name' => basename($path),
            'path' => $path,
            'url' => '/storage/' . ltrim($path, '/'),
            'size' => $disk->size($path),
            'modified' => $disk->lastModified($path),
        ], 201);
    }

    /**
     * DELETE /api/admin/gallery/files/{name}
     */
    public function destroy(string $name)
    {
        // Twardo zabezpieczamy przed traversalem.
        $clean = basename($name);
        if ($clean !== $name || Str::contains($name, ['/', '\\', '..'])) {
            return response()->json(['message' => 'Nieprawidłowa nazwa pliku.'], 422);
        }

        $disk = Storage::disk('public');
        $path = self::FOLDER . '/' . $clean;

        if (!$disk->exists($path)) {
            return response()->json(['message' => 'Plik nie istnieje.'], 404);
        }

        $disk->delete($path);
        return response()->json(null, 204);
    }

    /**
     * Skopiuj zdjęcia ze `frontend/src/assets/images` (jeżeli dostępne)
     * do `storage/app/public/images`.
     */
    private function seedFromFrontend($disk): void
    {
        $candidates = [
            base_path('../frontend/src/assets/images'),
            base_path('../../frontend/src/assets/images'),
        ];

        $source = null;
        foreach ($candidates as $c) {
            if (is_dir($c)) {
                $source = realpath($c);
                break;
            }
        }
        if (!$source) {
            return;
        }

        $entries = @scandir($source) ?: [];
        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            $full = $source . DIRECTORY_SEPARATOR . $entry;
            if (!is_file($full)) continue;
            $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) continue;

            $target = self::FOLDER . '/' . $entry;
            if ($disk->exists($target)) continue;

            $contents = @file_get_contents($full);
            if ($contents === false) continue;
            $disk->put($target, $contents);
        }
    }
}

