---
project: quran-nurtech
public: true
type: fix
audience: users
title: Выровняли левое меню и карточки главной
summary: Привели левый список сур и джузов к устойчивой macOS-like сетке, чтобы номера, названия и арабские подписи больше не съезжали. Быстрые карточки на главной теперь переносятся адаптивно и не режут текст.
user_impact:
  - В левом меню «Суры / Джузы» строки стали ровными и не вылезают за колонку.
  - Названия сур, подписи и арабские имена в сайдбаре сохраняют единый ритм.
  - Быстрые карточки на главной больше не выглядят зажатыми на desktop.
screenshots:
  - qa-screens/2026-07-30-sidebar-source-list/desktop-sidebar-home-fixed.png
checks:
  - npm run build
  - Browser smoke: desktop sidebar rows overflow=false
  - Browser smoke: desktop juz rows overflow=false
  - Browser smoke: quick surah cards overflow=false
deploy_url: https://quran.nurtech.dev
---

Notes for editor:
- What changed: список drawer получил явную сетку номер/текст/арабское имя, джузы используют такую же стабильную колонку номера, а быстрые карточки главной перешли на адаптивный `auto-fit`.
- Where to verify: откройте главную страницу на desktop, переключите «Суры / Джузы» в левом меню и проверьте первые строки списка и быстрые карточки сур.
- Risks: изменение затрагивает только левое меню и быстрые карточки главной; мобильные размеры сохранены отдельным media-блоком.
