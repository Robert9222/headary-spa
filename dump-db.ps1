# dump-db.ps1
# Eksportuje aktualną bazę PostgreSQL aplikacji Headary SPA do pliku .sql
# (czyta dane logowania z backend/.env). Wynik trafia do exports/.
#
# Uruchomienie z katalogu głównego projektu:
#   .\dump-db.ps1
#
# Wymaga zainstalowanego PostgreSQL (pg_dump w PATH lub w C:\Program Files\PostgreSQL\<wersja>\bin).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# 1) Wczytaj DB_* z backend/.env
$envFile = Join-Path $root 'backend\.env'
if (-not (Test-Path $envFile)) { throw "Brak pliku $envFile" }
$envVars = @{}
foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*(DB_[A-Z_]+)\s*=\s*(.*)\s*$') {
        $envVars[$matches[1]] = $matches[2].Trim('"').Trim("'")
    }
}
foreach ($k in 'DB_CONNECTION','DB_HOST','DB_PORT','DB_DATABASE','DB_USERNAME','DB_PASSWORD') {
    if (-not $envVars.ContainsKey($k)) { throw "Brak $k w .env" }
}
if ($envVars.DB_CONNECTION -ne 'pgsql') {
    throw "Ten skrypt wspiera tylko DB_CONNECTION=pgsql (jest: $($envVars.DB_CONNECTION))"
}

# 2) Znajdź pg_dump
$pgDump = (Get-Command pg_dump -ErrorAction SilentlyContinue).Source
if (-not $pgDump) {
    $pgDump = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\pg_dump.exe' -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $pgDump) { throw "Nie znaleziono pg_dump.exe — zainstaluj PostgreSQL lub dodaj go do PATH." }

# 3) Przygotuj plik wyjściowy
$exports = Join-Path $root 'exports'
if (-not (Test-Path $exports)) { New-Item -ItemType Directory $exports | Out-Null }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path $exports "$($envVars.DB_DATABASE)-$stamp.sql"

# 4) Uruchom pg_dump
$env:PGPASSWORD = $envVars.DB_PASSWORD
try {
    & $pgDump `
        -h $envVars.DB_HOST `
        -p $envVars.DB_PORT `
        -U $envVars.DB_USERNAME `
        -d $envVars.DB_DATABASE `
        --clean --if-exists --no-owner --no-privileges `
        -E UTF8 `
        -f $out
    if ($LASTEXITCODE -ne 0) { throw "pg_dump zakończył się kodem $LASTEXITCODE" }
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

$sizeKB = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host ""
Write-Host "✓ Dump utworzony: $out ($sizeKB KB)" -ForegroundColor Green
Write-Host ""
Write-Host "Aby odbiorca zaimportował go u siebie:" -ForegroundColor Cyan
Write-Host "  1. createdb -U postgres $($envVars.DB_DATABASE)"
Write-Host "  2. psql  -U postgres -d $($envVars.DB_DATABASE) -f `"$([System.IO.Path]::GetFileName($out))`""
Write-Host "  3. W backend/.env ustawić DB_* na swoje dane PostgreSQL"
Write-Host ""

