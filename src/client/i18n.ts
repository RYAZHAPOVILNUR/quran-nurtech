// Клиентская локализация интерфейса RU ↔ AR (+ RTL).
// Сервер рендерит русский (дефолт). При locale=ar на клиенте:
//   - <html lang=ar dir=rtl data-locale=ar> (dir ставится ещё в anti-flash до отрисовки)
//   - текст элементов с data-i18n="key" заменяется на арабский из словаря AR
//   - плейсхолдеры (data-i18n-ph), title/aria-label (data-i18n-title) — так же
// Переключение локали делает reload (сервер снова отдаёт RU, клиент свапает в AR),
// поэтому восстанавливать оригиналы не нужно.
import { AR } from '../i18n/ar';

export type Locale = 'ru' | 'ar';
const KEY = 'q_locale';

export function getLocale(): Locale {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '"ru"') === 'ar' ? 'ar' : 'ru';
  } catch {
    return 'ru';
  }
}
export function setLocale(l: Locale): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
  } catch {}
}

function swap(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const v = AR[el.getAttribute('data-i18n') || ''];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-ph]').forEach((el) => {
    const v = AR[el.getAttribute('data-i18n-ph') || ''];
    if (v != null) el.placeholder = v;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const v = AR[el.getAttribute('data-i18n-title') || ''];
    if (v != null) {
      el.title = v;
      if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', v);
    }
  });
}

export function applyLocale(): void {
  const html = document.documentElement;
  const l = getLocale();
  html.setAttribute('lang', l);
  html.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
  html.setAttribute('data-locale', l);
  if (l === 'ar') swap();
}

// Переключатель локали в шапке (глобус). Смена локали делает reload; в читалке
// заодно переводит аяты (ar → التفسير الميسر, ru → Кулиев).
function initLocaleSwitch(): void {
  const cur = getLocale();
  const label = document.querySelector('[data-lang-current]');
  if (label) label.textContent = cur === 'ar' ? 'ع' : 'RU';
  document.querySelectorAll<HTMLElement>('[data-locale-set]').forEach((b) => {
    const v = (b.getAttribute('data-locale-set') as Locale) || 'ru';
    b.classList.toggle('on', v === cur);
    b.addEventListener('click', () => {
      if (v === cur) return;
      setLocale(v);
      const sid = document.body.getAttribute('data-surah');
      const tr = document.body.getAttribute('data-tr');
      if (sid && v === 'ar') {
        location.href = '/surah/' + sid + '/muyassar';
        return;
      }
      if (sid && v === 'ru' && tr === 'muyassar') {
        location.href = '/surah/' + sid + '/kuliev';
        return;
      }
      location.reload();
    });
  });
}

function init(): void {
  applyLocale();
  initLocaleSwitch();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
