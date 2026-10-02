# План приведения quran.nurtech.dev к macOS-like стилю

Цель: сделать веб-приложение визуально и поведенчески похожим на аккуратное native macOS/iOS приложение, насколько это возможно в браузере: единый app shell, системная типографика, спокойные материалы, предсказуемые панели, независимые scroll-зоны и отсутствие конфликтующих CSS-слоёв.

## 1. Дизайн-система

- Закрепить `src/styles/design-tokens.css` как единственный источник токенов:
  - цвета системных слоёв: `background`, `groupedBackground`, `secondaryGroupedBackground`, `separator`, `label`, `secondaryLabel`, `tertiaryLabel`;
  - размеры: `control-h`, `touch-h`, `toolbar-h`, `sidebar-w`, `inspector-w`;
  - радиусы: compact controls, cards, sheets, popovers;
  - тени и материалы: toolbar, sidebar, inspector, popover, player;
  - типографика: UI, русский reader text, арабский reader text, mushaf text.
- Запретить новые “ручные” значения в feature CSS без причины: `font-weight: 800`, случайные `border-radius`, произвольные `box-shadow`, нестандартные `padding`.
- Вынести повторяемые компоненты в отдельные файлы:
  - `component-buttons.css`;
  - `component-segmented.css`;
  - `component-fields.css`;
  - `component-lists.css`;
  - `component-cards.css`;
  - `component-sheets.css`;
  - `component-focus.css`.

## 2. CSS-архитектура

Текущий порядок должен стать строгим:

1. `design-tokens.css`
2. `global.css`
3. `utilities.css`
4. `component-*`
5. `shell-*`
6. `settings-*`
7. `page-*`
8. `reader-*`
9. `mushaf-*`
10. `platform-*`

Что удалить/не допускать:

- файлы вида `compat`, `polish`, `final`, если они переопределяют всё подряд;
- правила, где platform-layer знает про конкретный компонент (`.dtabs`, `.ayah-card`, `.home-card`);
- `!important` кроме точечных accessibility/visibility случаев;
- дубли стилей `.seg`, `.switch`, `.btn`, `.icon-btn` в разных слоях.

## 3. Desktop macOS Shell

### Toolbar

- Сделать верхнюю панель похожей на native macOS toolbar:
  - высота 44-52 px;
  - одна строка;
  - один search/quick-jump control;
  - компактные icon buttons 32-36 px;
  - без декоративных больших заливок;
  - активное состояние мягкое, без тяжёлой плашки.
- На узких desktop ширинах toolbar должен деградировать предсказуемо:
  - скрывать второстепенные подписи;
  - не дублировать поиск;
  - не ломать строку.

### Sidebar

- Сайдбар должен быть как macOS source list:
  - независимый scroll;
  - footer закреплён снизу;
  - секции uppercase 11-12 px;
  - строки 28-34 px на desktop;
  - иконки 16-18 px, строго выровнены;
  - selected row мягкий и системный;
  - `Суры / Джузы` как compact segmented control внутри сетки сайдбара.

### Inspector

- Настройки справа должны быть inspector-панелью, а не popover:
  - открывается справа;
  - ужимает content, а не перекрывает его на wide desktop;
  - при нехватке ширины может закрывать левый sidebar;
  - собственный scroll;
  - grouped controls как в System Settings.

### Content

- Центральная область:
  - max-width зависит от режима;
  - не должна растягивать reader-карточки на всю ширину монитора;
  - cards использовать только для повторяемых сущностей, не вкладывать card в card;
  - страницы должны иметь один общий `PageShell`/`PageHeader`.

## 4. Типографика

- UI:
  - `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, `Inter`, fallback;
  - веса 400/500/600;
  - почти полностью убрать 700/800 из интерфейса;
  - заголовки меньше и спокойнее.
- Русский reader text:
  - отдельный scale;
  - line-height комфортный для чтения;
  - не использовать UI-вес для длинного текста.
- Арабский:
  - отдельные presets для обычного чтения и mushaf;
  - не смешивать UI tokens с Quran text tokens;
  - сохранить читаемость diacritics.

## 5. Light/Dark Палитра

- Light mode:
  - не “белая веб-страница”, а iOS/macOS grouped surface;
  - фон `groupedBackground`;
  - панели `secondaryGroupedBackground`;
  - separators тонкие.
- Dark mode:
  - уйти от тяжёлых чёрных пятен;
  - использовать layered dark surfaces;
  - акцент только точечно;
  - выбранные состояния не должны выглядеть жирными.

## 6. Reader / Surah

- Карточки аятов:
  - убрать тяжёлые outlines;
  - action icons сделать тише;
  - tafsir blocks без “карточка в карточке”;
  - длинный русский текст не должен выходить за контейнер.
- Перевод/тафсир:
  - grouped sections;
  - separators вместо вложенных рамок;
  - collapsed/expanded состояния одинаковые на desktop/mobile.
- Progress/dwell:
  - маленькие unobtrusive indicators;
  - не превращать чтение в dashboard внутри reader.

## 7. Mushaf Mode

- Мушаф должен быть отдельным reader-mode:
  - без footer;
  - без обычной page chrome;
  - стабильный fullscreen;
  - fit-to-screen по умолчанию;
  - zoom/pan без потери scroll;
  - remembered page/zoom/theme state.
- Палитры:
  - light: бумага/чернила, не белый лист сайта;
  - dark: мягкая тёмная бумага, не просто инверсия.
- Навигация:
  - page controls как compact floating toolbar;
  - стрелки RTL/LTR должны быть понятными;
  - на mobile controls не перекрывают текст.

## 8. Mobile iOS-like

- Нижняя tab bar:
  - safe-area aware;
  - blur/material;
  - активный tab мягкий.
- Drawer/settings/search:
  - bottom sheets;
  - body scroll lock;
  - собственный internal scroll;
  - клавиатура не открывается сама при открытии меню.
- Touch targets:
  - 44-48 px;
  - без мелких иконок рядом без отступов.
- Mobile reader:
  - меньше вложенных контейнеров;
  - tafsir/translation как sections, не nested cards.

## 9. Компонентная миграция

Порядок миграции:

1. TopBar → `Toolbar`, `SearchField`, `IconButton`.
2. Drawer → `SourceList`, `SourceListSection`, `SourceListRow`, `SegmentedControl`.
3. Settings → `Inspector`, `InspectorSection`, `SwitchRow`, `SelectRow`, `SliderRow`.
4. Player → `PlayerBar`, `TransportButton`, `SpeedControl`.
5. Pages → `PageShell`, `PageHeader`, `StatTile`, `ListRow`, `Card`.
6. Reader → `AyahBlock`, `TafsirSection`, `TranslationBlock`.
7. Mushaf → `MushafViewport`, `MushafToolbar`, `MushafPager`.

## 10. Проверка качества

Обязательный smoke перед релизом:

- desktop 1440/1728/1920:
  - `/`;
  - `/surah/1`;
  - `/mushaf/1`;
  - `/search`;
  - `/progress`;
  - `/stats`;
  - `/audio`;
  - `/bookmarks`;
  - `/topics`;
  - `/glossary`;
  - `/tasbih`.
- mobile 390x844 и 430x932:
  - topbar не переполняется;
  - drawer/settings имеют внутренний scroll;
  - body под sheet не скроллится;
  - player не перекрывает критичный текст;
  - mushaf не обрезается.

Метрики:

- `documentElement.scrollWidth - clientWidth = 0`;
- topbar overflow = 0;
- sidebar rows within sidebar bounds;
- inspector не перекрывает content на wide desktop;
- selected states только в одном месте.

## 11. Definition of Done

- Нет `compat/final/polish` CSS-слоёв, которые перебивают компоненты.
- Все базовые controls используют `component-*`.
- Desktop выглядит как app shell, а не сайт с меню.
- Mobile выглядит как iOS app, а не адаптивная страница.
- Mushaf имеет отдельный immersive reader mode.
- Любая новая UI-правка добавляется через токены/компоненты, а не через локальный override.
