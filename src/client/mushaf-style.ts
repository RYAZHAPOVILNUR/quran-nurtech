// Стиль мусхафа: «Таджвид» (цветные COLRv1-шрифты с внешнего CDN, один файл на
// страницу) и «Классический» (локальные QCF4, один файл на ~13 страниц, лежит в
// public/fonts/qcf4 и кэшируется service worker'ом — работает офлайн).
//
// Раскладка классического стиля встроена в HTML страницы (~4 КБ), поэтому и
// переключение, и офлайн-фолбэк обходятся без единого запроса в сеть.
import { $, $$, K, LS, toast } from './shared';

export type MushafStyle = 'tajweed' | 'classic';

/** c — глиф, k — «сура:аят», t — роль (end/bismillah/header/quarter), f — шрифт, если не основной. */
interface SlimWord {
  c: string;
  k?: string;
  t?: 'e' | 'b' | 'h' | 'q';
  f?: string;
}

interface SlimPage {
  f: string;
  l: Array<{ n: number; w: SlimWord[] }>;
}

const LINE_SLOTS = 15;

function readClassicPayload(): SlimPage | null {
  const el = $('[data-mushaf-classic]');
  const raw = el?.textContent?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SlimPage;
    return parsed?.l?.length ? parsed : null;
  } catch {
    return null;
  }
}

/** Заголовок суры и басмала приходят готовыми глифами, а не собираются вёрсткой. */
const isDecoration = (words: SlimWord[]) => words.some((w) => w.t === 'h' || w.t === 'b');

function renderClassic(page: SlimPage, host: HTMLElement) {
  const byLine = new Map(page.l.map((line) => [line.n, line]));
  const frag = document.createDocumentFragment();

  for (let n = 1; n <= LINE_SLOTS; n++) {
    const line = byLine.get(n);
    const div = document.createElement('div');
    div.className = 'qcf-line';
    div.dataset.line = String(n);

    if (!line || !line.w.length) {
      div.classList.add('is-empty');
      frag.appendChild(div);
      continue;
    }

    const next = byLine.get(n + 1);
    if (isDecoration(line.w)) {
      div.classList.add('qcf-line-deco');
    } else if (!next || !next.w.length || isDecoration(next.w)) {
      // последняя строка блока в печатном мусхафе центрируется, а не растягивается
      div.classList.add('center');
    }

    for (const word of line.w) {
      const span = document.createElement('span');
      span.className = 'qcf-word';
      if (word.t === 'e') span.classList.add('qcf-word-end');
      if (word.t === 'h') span.classList.add('qcf-glyph-header');
      if (word.t === 'b') span.classList.add('qcf-glyph-basmala');
      if (word.f) span.dataset.qcfFont = word.f;
      if (word.k) {
        span.dataset.ayahKey = word.k;
        span.title = word.k;
      }
      span.textContent = word.c;
      div.appendChild(span);
    }
    frag.appendChild(div);
  }

  host.replaceChildren(frag);
}

/** Шрифт страницы приходит из --mushaf-page-font: у каждого стиля он свой. */
async function pageFontReady(pageEl: HTMLElement): Promise<boolean> {
  const family = getComputedStyle(pageEl).getPropertyValue('--mushaf-page-font').trim();
  if (!family || !document.fonts) return true;
  const spec = `1em ${family}`;
  try {
    await document.fonts.load(spec);
  } catch {
    /* load отклоняется при сетевой ошибке — вердикт выносит check ниже */
  }
  try {
    return document.fonts.check(spec);
  } catch {
    return true;
  }
}

export function initMushafStyle() {
  const pageEl = $('.qcf-page') as HTMLElement | null;
  if (!pageEl) return;

  const classic = readClassicPayload();
  const notice = $('[data-mushaf-font-missing]') as HTMLElement | null;
  const toggles = $$('[data-mushaf-style-toggle]');
  const tajweedHtml = pageEl.innerHTML;
  let current: MushafStyle = 'tajweed';

  const syncToggles = () =>
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(current === 'tajweed'));
      btn.classList.toggle('on', current === 'tajweed');
      btn.setAttribute(
        'title',
        current === 'tajweed'
          ? 'Стиль: цветной таджвид. Переключить на классический'
          : 'Стиль: классический. Переключить на цветной таджвид'
      );
    });

  const paint = (style: MushafStyle) => {
    if (style === 'classic' && classic) renderClassic(classic, pageEl);
    else pageEl.innerHTML = tajweedHtml;
    pageEl.dataset.mushafStyle = style;
    current = style;
    syncToggles();
    // лист пересобрался — пересчитать посадку страницы и зум
    document.dispatchEvent(new CustomEvent('mushaf:relayout'));
  };

  const settle = async (style: MushafStyle, allowFallback: boolean) => {
    paint(style);
    const ok = await pageFontReady(pageEl);
    if (ok) {
      pageEl.dataset.mushafFont = 'ready';
      if (notice) notice.hidden = true;
      return;
    }
    // Шрифт не доехал. Системный арабский нарисовал бы глифы QCF как случайные
    // presentation forms, поэтому либо уходим в офлайн-стиль, либо говорим прямо.
    if (allowFallback && style === 'tajweed' && classic) {
      toast('Шрифт таджвида недоступен — включён классический стиль');
      await settle('classic', false);
      return;
    }
    pageEl.dataset.mushafFont = 'missing';
    if (notice) notice.hidden = false;
  };

  const stored = LS.get<MushafStyle | null>(K.mushafStyle, null);
  const initial: MushafStyle = stored === 'classic' && classic ? 'classic' : 'tajweed';

  toggles.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (!classic) {
        toast('Классический стиль недоступен на этой странице');
        return;
      }
      const next: MushafStyle = current === 'tajweed' ? 'classic' : 'tajweed';
      LS.set(K.mushafStyle, next);
      settle(next, false);
    })
  );

  settle(initial, initial === 'tajweed');
}
