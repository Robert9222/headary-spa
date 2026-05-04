// Konwersja zdjęć JPG/PNG -> WebP, max 1920 px po dłuższym boku.
// Bez backupu: po udanej konwersji oryginał jest usuwany.
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
// Jedno źródło zdjęć: backend/storage/app/public/.
// Skrypt rekursywnie obejdzie wszystkie pod-katalogi (images, services,
// page-sections, employees, uploads, …).
const TARGET_DIRS = [
  join(ROOT, 'backend', 'storage', 'app', 'public'),
];

const MAX_SIDE = 1920;
const QUALITY = 82;
const EXTS = new Set(['.jpg', '.jpeg', '.png']);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile() && EXTS.has(extname(e.name).toLowerCase())) {
      yield full;
    }
  }
}

function fmtMB(b) { return (b / 1024 / 1024).toFixed(2) + ' MB'; }

let totalIn = 0, totalOut = 0, count = 0, skipped = 0, failed = 0;

for (const dir of TARGET_DIRS) {
  try { await stat(dir); } catch { console.log('Pomijam (brak):', dir); continue; }
  console.log('\n== Katalog:', dir);
  for await (const file of walk(dir)) {
    const ext = extname(file).toLowerCase();
    const base = basename(file, ext);
    const outFile = join(dirname(file), base + '.webp');
    try {
      const inStat = await stat(file);
      const meta = await sharp(file).metadata();
      const longSide = Math.max(meta.width || 0, meta.height || 0);
      let pipeline = sharp(file, { failOn: 'none' }).rotate(); // honor EXIF orientation
      if (longSide > MAX_SIDE) {
        pipeline = pipeline.resize({
          width: meta.width >= meta.height ? MAX_SIDE : null,
          height: meta.height > meta.width ? MAX_SIDE : null,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
      await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(outFile);
      const outStat = await stat(outFile);

      totalIn += inStat.size;
      totalOut += outStat.size;
      count++;

      console.log(
        `OK  ${basename(file)} (${meta.width}x${meta.height}, ${fmtMB(inStat.size)}) -> ${basename(outFile)} (${fmtMB(outStat.size)})`
      );

      // Usuń oryginał tylko jeśli nazwa się różni (czyli zawsze tutaj, bo .jpg -> .webp)
      if (file !== outFile) {
        await unlink(file);
      }
    } catch (err) {
      failed++;
      console.error('FAIL', file, '-', err.message);
    }
  }
}

console.log('\n== Podsumowanie ==');
console.log(`Skonwertowano: ${count}, błędów: ${failed}, pominięto: ${skipped}`);
console.log(`Rozmiar przed: ${fmtMB(totalIn)}, po: ${fmtMB(totalOut)}, oszczędność: ${fmtMB(totalIn - totalOut)} (${totalIn ? Math.round((1 - totalOut / totalIn) * 100) : 0}%)`);

