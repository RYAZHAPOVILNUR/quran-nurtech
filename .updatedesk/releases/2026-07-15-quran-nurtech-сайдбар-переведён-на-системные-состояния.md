---
project: quran-nurtech
public: false
type: design
audience: team
title: Сайдбар переведён на системные состояния
summary: Сайдбар и мобильное меню используют системные цвета, мягкие hover/selected состояния и единые размеры строк.
user_impact:
  - Выбранные пункты больше не выглядят как тяжёлые плашки и не спорят с macOS/iOS палитрой.
  - Иконки, подписи, прогресс и футер меню стали визуально ровнее и спокойнее.
screenshots:
  - qa-screens/2026-07-15-drawer-source-list/drawer-source-list-system-tokens.png
checks:
  - npm run build
  - Browser smoke: drawer source list, tabs, row metrics, horizontal overflow = 0
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: source list and drawer states moved from legacy aliases to system tokens.
- Where to verify: left sidebar and mobile menu on home/surah pages.
- Risks: remaining shell visibility rules still contain a few structural !important overrides.
