#!/usr/bin/env node
// Импорт: التفسير الميسر (аль-Муяссар, Комплекс им. Фахда) — ясный простой смысл
// Корана на арабском → поле `mu` у каждого аята в data/quran/<n>.json.
// Источник: alquran.cloud edition `ar.muyassar` (по-аятно выровнено, 6236 аятов).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QDIR = join(ROOT, 'data', 'quran');

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((res) => setTimeout(res, 700 * (i + 1)));
    }
  }
}

// нормализуем: убираем управляющие пробелы/повторные, схлопываем пустые строки
const clean = (t) =>
  String(t || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

console.log('→ التفسير الميسر (ar.muyassar) весь Коран одним запросом…');
const all = await getJson('https://api.alquran.cloud/v1/quran/ar.muyassar');
const surahs = all?.data?.surahs;
if (!Array.isArray(surahs) || surahs.length !== 114) {
  throw new Error('Неожиданный ответ alquran.cloud: сур=' + (surahs?.length ?? 'нет'));
}

let total = 0;
let missing = 0;
for (const s of surahs) {
  const n = s.number;
  const path = join(QDIR, `${n}.json`);
  if (!existsSync(path)) {
    console.warn(`  ! нет ${path}`);
    continue;
  }
  const local = JSON.parse(readFileSync(path, 'utf8'));
  // карта numberInSurah → text
  const byN = new Map(s.ayahs.map((a) => [a.numberInSurah, clean(a.text)]));
  for (const ayah of local.a) {
    const mu = byN.get(ayah.n);
    if (mu) {
      ayah.mu = mu;
      total++;
    } else {
      missing++;
    }
  }
  writeFileSync(path, JSON.stringify(local));
}

console.log(`✓ аль-Муяссар вписан: ${total} аятов${missing ? `, пропущено ${missing}` : ''}`);
if (total < 6200) throw new Error('Слишком мало аятов — проверь источник');
