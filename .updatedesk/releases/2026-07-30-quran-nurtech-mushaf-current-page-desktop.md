---
project: quran-nurtech
public: true
type: fix
audience: users
title: Мусхаф открывается на текущем месте
summary: Исправили переход в режим мусхафа: теперь с текущей суры или аята открывается соответствующая страница, а не начало Корана. Заодно аккуратнее оформили desktop-режим мусхафа и системную панель настроек.
user_impact:
  - При переходе из суры Сад, другой суры или конкретного аята мусхаф открывается на нужной странице.
  - На ПК страница мусхафа стала спокойнее: панель управления не наезжает на лист, фон и контролы выглядят цельнее.
  - Настройки чтения используют системные цвета дизайн-системы и меньше конфликтуют с темами.
screenshots:
  - qa-screens/2026-07-30-mushaf-desktop-polish/mushaf-453-desktop-fixed.png
checks:
  - npm run build
  - Browser smoke: /surah/38 topbar/drawer/mobile tabbar href -> /mushaf/453
  - Browser smoke: /mushaf/453 desktop layout gap=12px, horizontalOverflow=false
  - git diff --check
deploy_url: https://quran.nurtech.dev
---

Notes for editor:
- What changed: маршрут «Мусхаф» теперь вычисляется по текущей странице чтения; desktop-мусхаф получил более аккуратную панель управления и исправленный зазор между тулбаром и листом; settings CSS переведён с legacy colors на системные токены.
- Where to verify: откройте `/surah/38`, нажмите «Мусхаф» в верхней панели или боковом меню - должна открыться `/mushaf/453`; в `/mushaf/453` проверьте, что панель не перекрывает лист.
- Risks: изменение затрагивает общие ссылки shell на мусхаф и desktop CSS режима мусхафа; мобильная логика размеров не менялась, кроме общей ссылки таббара.
