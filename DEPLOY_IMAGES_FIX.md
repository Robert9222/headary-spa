# Zdjecia na produkcji - jak naprawic

## Problem

Na shared hostingu `headaryspa.motivogroup.pl` domena wskazuje wprost na
katalog `public/`. Wszystko ponad nim jest poza document rootem - serwer
go nie widzi. Domyslny mechanizm Laravela trzyma uploady w
`storage/app/public/` i udostepnia je przez symlink
`public/storage -> ../storage/app/public`. Na tym hostingu symlink nie
dziala (brak `Options +FollowSymLinks` lub `open_basedir` blokuje), wiec
`/storage/...` zwraca 404.

## Rozwiazanie

Zmieniona konfiguracja: Laravel zapisuje pliki **wprost do `public/storage/`**
- czyli do katalogu publicznego. Symlink znika z ukladanki, a `/storage/...`
to po prostu zwykle pliki statyczne, ktore Apache serwuje bezposrednio.

## Co zostalo zmienione w kodzie

| Plik | Zmiana |
|------|--------|
| `backend/config/filesystems.php` | `disks.public.root` -> `public_path('storage')`; `links` puste |
| `backend/app/Services/WebpConverter.php` | sciezka z `Storage::disk('public')->path('')` zamiast hardkodu |
| `backend/app/Http/Controllers/Api/GalleryFilesController.php` | dodany import `WebpConverter` (uzywal go bez `use`) |
| `tools/pack-public-storage.ps1` | pakuje `backend/public/storage` do ZIP-a |

Lokalnie pliki zostaly zmigrowane: ze `storage/app/public/` przeniesione
do `public/storage/` (40 plikow .webp, ~4 MB), Junction usuniety. Smoke
test przeszedl: `Storage::disk('public')->exists('images/_MG_0013.webp') = yes`.

## Co zrobic na produkcji

### 1. Wgraj zaktualizowany kod backendu

Wgraj na serwer co najmniej:

- `backend/config/filesystems.php`
- `backend/app/Services/WebpConverter.php`
- `backend/app/Http/Controllers/Api/GalleryFilesController.php`

Po wgraniu wyczysc cache (jesli masz SSH):

```bash
php artisan config:clear
php artisan cache:clear
```

Bez SSH usun recznie `bootstrap/cache/config.php` (jesli istnieje).

### 2. Wgraj pliki obrazow

Spakowane sa w `exports/storage-public-<stamp>.zip` (~4 MB, 40 plikow .webp).

Pakowanie kolejnej paczki:
```powershell
powershell -ExecutionPolicy Bypass -File tools/pack-public-storage.ps1
```

Na serwerze:

1. Wgraj ZIP do `<laravel-root>/public/`.
2. Rozpakuj **bezposrednio do `public/storage/`**. Po rozpakowaniu maja byc:
   ```
   public/storage/images/_MG_0013.webp
   public/storage/services/...
   public/storage/page-sections/...
   ```
3. Usun ZIP po rozpakowaniu.
4. Uprawnienia: `644` na pliki, `755` na katalogi.

### 3. Usun stary symlink (jezeli byl)

Jesli kiedys odpalales `php artisan storage:link` na produkcji, moze tam
siedziec symlink `public/storage`. Skasuj go **zanim** wgrasz nowy katalog:

```bash
ls -la <laravel>/public/storage    # jesli zaczyna sie od 'l' to symlink
rm <laravel>/public/storage
```

Usuniecie symlinka nie kasuje zawartosci `storage/app/public/`.

### 4. Test

Otworz w przegladarce:
```
https://headaryspa.motivogroup.pl/storage/images/_MG_0013.webp
```
- 200 + obrazek -> dziala.
- 404 -> ZIP byl prawdopodobnie rozpakowany do `public/` zamiast do
  `public/storage/`.

Potem strona glowna SPA + galeria + uslugi.

### 5. Upload z panelu admina

Wejdz na `/admin`, dodaj zdjecie do galerii. Plik trafi do
`public/storage/images/<nazwa>.webp` i bedzie od razu pod
`/storage/images/<nazwa>.webp`. Zaden symlink nie jest potrzebny.

## Dlaczego to dziala

`backend/public/.htaccess` ma standardowa regule:

```apache
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

Tylko gdy plik **nie istnieje**, request idzie do Laravela. Skoro
`public/storage/images/foo.webp` istnieje fizycznie, Apache serwuje go
bezposrednio, a `.htaccess` nie przepuszcza go do `index.php`.

## Dlaczego baza nie wymaga migracji

W bazie sa zapisane sciezki **wzgledne**, np. `/storage/services/foo.webp`
(robi to `App\Models\Concerns\NormalizesImageUrls`). Frontend dokleja
prefiks domeny w runtime (`ContentService.resolveImage`). Po zmianie
konfiguracji ten sam URL `/storage/services/foo.webp` mapuje sie po prostu
na inny katalog fizyczny - dane w bazie zostaja bez zmian.

