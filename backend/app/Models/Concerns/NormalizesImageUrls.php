<?php

namespace App\Models\Concerns;

/**
 * Trait wspólny dla modeli przechowujących URL-e obrazów (image_url / avatar_url).
 *
 * Wymusza zapis WZGLĘDNYCH ścieżek (np. "/storage/services/foo.jpg")
 * — wycina prefiks "https://host" i pozostawia samą ścieżkę.
 *
 * Powód: APP_URL w środowisku deweloperskim wskazuje na produkcyjną domenę
 * (żeby dev mógł korzystać z prawdziwych zasobów), więc Storage::url()
 * zwracał pełne URL-e produkcyjne. Po normalizacji dane w bazie są
 * portable między dev i prod — frontend skleja host samodzielnie.
 */
trait NormalizesImageUrls
{
    public static function normalizeImageUrl(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }
        if (preg_match('#^(data:|blob:|assets/)#i', $value)) {
            return $value;
        }
        // Wyciągamy ścieżkę tylko jeżeli URL należy do NASZEJ aplikacji
        // (host APP_URL) albo prowadzi do /storage/... — wtedy chcemy
        // przechowywać go jako relatywny. URL-e do innych hostów (np.
        // via.placeholder.com) zostawiamy bez zmian.
        if (preg_match('#^https?://([^/]+)(/.*)$#i', $value, $m)) {
            $host = strtolower($m[1]);
            $path = $m[2];

            $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
            $appHost = $appHost ? strtolower($appHost) : null;

            $isOwnHost = $appHost && $host === $appHost;
            $isStoragePath = str_starts_with($path, '/storage/');

            if ($isOwnHost || $isStoragePath) {
                return $path;
            }
        }
        return $value;
    }

    public function setImageUrlAttribute($value): void
    {
        $this->attributes['image_url'] = self::normalizeImageUrl($value);
    }

    public function setAvatarUrlAttribute($value): void
    {
        $this->attributes['avatar_url'] = self::normalizeImageUrl($value);
    }
}

