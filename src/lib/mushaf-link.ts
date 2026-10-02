import { getSurah } from './quran';
import { getMushafMeta, MUSHAF_TOTAL_PAGES } from './mushaf';

const clampPage = (page: number) => Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, Math.trunc(page || 1)));

function surahStartPage(surah: number): number | null {
  if (!Number.isFinite(surah) || surah < 1 || surah > 114) return null;
  try {
    const metaPage = getMushafMeta().suraStart[String(surah)];
    if (metaPage) return clampPage(metaPage);
  } catch {}
  try {
    return clampPage(getSurah(surah).a[0]?.p || 1);
  } catch {
    return null;
  }
}

function ayahPage(surah: number, ayah: number): number | null {
  if (!Number.isFinite(surah) || !Number.isFinite(ayah) || surah < 1 || ayah < 1) return null;
  try {
    const found = getSurah(surah).a.find((item) => item.n === ayah);
    if (found?.p) return clampPage(found.p);
  } catch {}
  return surahStartPage(surah);
}

export function getMushafPageForPath(pathname: string): number {
  const path = pathname || '/';

  let match = path.match(/^\/mushaf\/(\d+)/);
  if (match) return clampPage(Number(match[1]));

  match = path.match(/^\/surah\/(\d+)/);
  if (match) return surahStartPage(Number(match[1])) ?? 1;

  match = path.match(/^\/ayah\/(\d+)\/(\d+)/);
  if (match) return ayahPage(Number(match[1]), Number(match[2])) ?? 1;

  match = path.match(/^\/(\d+):(\d+)/);
  if (match) return ayahPage(Number(match[1]), Number(match[2])) ?? 1;

  return 1;
}

export function getMushafHrefForPath(pathname: string): string {
  return `/mushaf/${getMushafPageForPath(pathname)}`;
}
