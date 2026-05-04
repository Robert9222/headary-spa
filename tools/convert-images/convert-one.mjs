// Konwertuje POJEDYNCZY plik JPG/PNG -> WebP (do MAX_SIDE px po dłuższym boku).
// Użycie: node convert-one.mjs <ścieżka-do-pliku> [--keep-original]
// Domyślnie usuwa oryginał po udanej konwersji.
// Zwraca przez stdout (JSON): { ok, output, width, height, sizeIn, sizeOut }
// Kod wyjścia: 0 = sukces, 1 = błąd.
import { stat, unlink } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import sharp from 'sharp';

const MAX_SIDE = 1920;
const QUALITY = 82;
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png']);

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const keepOriginal = args.includes('--keep-original');

if (!file) {
  console.error('Brak ścieżki pliku.');
  process.exit(1);
}

try {
  const ext = extname(file).toLowerCase();
  if (!SUPPORTED.has(ext)) {
    // Już webp / svg / gif — nic nie robimy, ale to nie błąd.
    console.log(JSON.stringify({ ok: false, reason: 'unsupported', ext }));
    process.exit(0);
  }
  const inStat = await stat(file);
  const meta = await sharp(file).metadata();
  const longSide = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(file, { failOn: 'none' }).rotate();
  if (longSide > MAX_SIDE) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_SIDE : null,
      height: meta.height > meta.width ? MAX_SIDE : null,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  const outFile = join(dirname(file), basename(file, ext) + '.webp');
  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(outFile);
  const outStat = await stat(outFile);

  if (!keepOriginal && file !== outFile) {
    try { await unlink(file); } catch { /* ignore */ }
  }
  console.log(JSON.stringify({
    ok: true,
    output: outFile,
    width: meta.width,
    height: meta.height,
    sizeIn: inStat.size,
    sizeOut: outStat.size,
  }));
  process.exit(0);
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: String(err && err.message || err) }));
  process.exit(1);
}

