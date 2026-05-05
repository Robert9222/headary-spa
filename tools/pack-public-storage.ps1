# Pakuje lokalne obrazy (backend/public/storage) do ZIP-a gotowego do wgrania
# na produkcje (FTP / cPanel File Manager / scp).
#
# Po wgraniu na serwer rozpakuj zawartosc do:
#   <ROOT_LARAVEL>/public/storage/

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$source  = Join-Path $root 'backend\public\storage'
$outDir  = Join-Path $root 'exports'
$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
$zipPath = Join-Path $outDir "storage-public-$stamp.zip"

if (-not (Test-Path $source)) { throw "Nie znaleziono katalogu: $source" }
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

Write-Host "Pakuje $source -> $zipPath" -ForegroundColor Cyan

$temp = Join-Path $env:TEMP ("storage-public-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
    Copy-Item -Path (Join-Path $source '*') -Destination $temp -Recurse -Force
    Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $zipPath -Force
} finally {
    Remove-Item -Path $temp -Recurse -Force -ErrorAction SilentlyContinue
}

$size = (Get-Item $zipPath).Length / 1KB
Write-Host ("Gotowe: {0} ({1:N1} KB)" -f $zipPath, $size) -ForegroundColor Green
Write-Host ""
Write-Host "Nastepne kroki na produkcji:" -ForegroundColor Yellow
Write-Host "  1. Wgraj plik ZIP na serwer (FTP / cPanel)."
Write-Host "  2. Rozpakuj zawartosc do: <laravel>/public/storage/"
Write-Host "  3. Sprawdz uprawnienia: 644 plik / 755 katalog."

