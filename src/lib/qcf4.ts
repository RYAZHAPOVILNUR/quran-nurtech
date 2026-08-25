import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const QCF_ROOT = join(ROOT, 'node_modules', 'quran-qcf4');

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

export const QCF_TOTAL_PAGES = 604;
export const QCF_FONT_COUNT = 47;

export interface QcfSurahRange {
  id: number;
  name: string;
  name_arabic: string;
  verse_start: number;
  verse_end: number;
}

export interface QcfWord {
  code: number;
  char: string;
  font: string;
  text?: string;
  type: 'word' | 'end' | 'surah_header' | 'bismillah' | 'quarter';
  verse_key?: string;
  position?: number;
  sura?: number;
}

export interface QcfLine {
  line: number;
  words: QcfWord[];
}

export interface QcfPage {
  page: number;
  font: string;
  surahs: QcfSurahRange[];
  lines: QcfLine[];
}

export interface QcfVerseIndex {
  [verseKey: string]: {
    page: number;
    lines: Array<{ line: number; word_start: number; word_end: number }>;
  };
}

export function getQcfPage(page: number): QcfPage {
  const n = Math.max(1, Math.min(QCF_TOTAL_PAGES, Math.trunc(page || 1)));
  return readJson<QcfPage>(join(QCF_ROOT, 'pages', `${String(n).padStart(3, '0')}.json`));
}

export function getQcfVerses(): QcfVerseIndex {
  return readJson<QcfVerseIndex>(join(QCF_ROOT, 'verses.json'));
}

export function getQcfPageForAyah(surah: number, ayah: number): number | undefined {
  return getQcfVerses()[`${surah}:${ayah}`]?.page;
}

export function qcfFontFaces(base = '/fonts/qcf4'): string {
  const faces = Array.from({ length: QCF_FONT_COUNT }, (_, i) => {
    const id = String(i + 1).padStart(2, '0');
    return `@font-face{font-family:'QCF4_Hafs_${id}';src:url('${base}/QCF4_Hafs_${id}_W.woff2') format('woff2');font-display:block;}`;
  });
  faces.push(
    `@font-face{font-family:'QCF4_QBSML';src:url('${base}/QCF4_QBSML.woff2') format('woff2');font-display:block;}`
  );
  return faces.join('\n');
}

/* --------------------------------------------------------------------------
   Классический стиль мусхафа: те же 604 страницы, но на локальных QCF4-шрифтах.
   В отличие от таджвид-набора (внешний CDN, свой шрифт на каждую страницу) здесь
   один шрифт на ~13 страниц, всё лежит в public/fonts/qcf4 и кэшируется
   service worker'ом — режим работает офлайн. Заголовки сур и басмала приходят
   готовыми глифами (QCF4_QBSML / QCF4_Hafs_01), а не рисуются вёрсткой.
   -------------------------------------------------------------------------- */

/** Слово классической раскладки: c — глиф, k — «сура:аят», t — роль, f — шрифт, если не основной. */
export interface QcfSlimWord {
  c: string;
  k?: string;
  t?: 'e' | 'b' | 'h' | 'q';
  f?: string;
}

export interface QcfSlimPage {
  f: string;
  l: Array<{ n: number; w: QcfSlimWord[] }>;
}

const SLIM_TYPE: Record<string, QcfSlimWord['t']> = {
  end: 'e',
  bismillah: 'b',
  surah_header: 'h',
  quarter: 'q',
};

/**
 * Ужимает страницу до того, что нужно для отрисовки: ~4 КБ вместо ~33 КБ.
 * Payload встраивается в HTML страницы, поэтому переключение стиля не ходит в сеть.
 */
export function qcfSlimPage(page: QcfPage): QcfSlimPage {
  return {
    f: page.font,
    l: page.lines.map((line) => ({
      n: line.line,
      w: line.words.map((word) => {
        const slim: QcfSlimWord = { c: word.char };
        if (word.verse_key) slim.k = word.verse_key;
        const t = SLIM_TYPE[word.type];
        if (t) slim.t = t;
        if (word.font !== page.font) slim.f = word.font;
        return slim;
      }),
    })),
  };
}

/** Шрифты, которые реально встречаются на странице — только их и объявляем. */
export function qcfPageFonts(page: QcfPage): string[] {
  const fonts = new Set<string>([page.font]);
  for (const line of page.lines) for (const word of line.words) fonts.add(word.font);
  return [...fonts];
}

/** @font-face только под шрифты этой страницы плюс привязка основного к .qcf-page. */
export function qcfPageFontCss(page: QcfPage, base = '/fonts/qcf4'): string {
  const file = (family: string) =>
    family === 'QCF4_QBSML' ? `${base}/QCF4_QBSML.woff2` : `${base}/${family}_W.woff2`;
  const faces = qcfPageFonts(page).map(
    (family) =>
      `@font-face{font-family:'${family}';src:url('${file(family)}') format('woff2');font-display:block;}`
  );
  // :root в начале поднимает специфичность до уровня тематических правил
  // таджвид-палитры (:root[data-theme=…] .qcf-page[data-mushaf-page=…])
  faces.push(
    `:root .qcf-page[data-mushaf-page="${page.page}"][data-mushaf-style="classic"]{--mushaf-page-font:'${page.font}';font-palette:normal;}`
  );
  return faces.join('\n');
}
