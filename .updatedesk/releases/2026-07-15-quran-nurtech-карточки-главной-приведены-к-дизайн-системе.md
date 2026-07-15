---
project: quran-nurtech
public: false
type: design
audience: team
title: Карточки главной приведены к дизайн-системе
summary: Карточки сур, быстрые суры, фильтр и hero-слой главной переведены на системные токены.
user_impact:
  - Названия сур и подписи стабильнее укладываются в карточки на desktop и mobile.
  - Главная больше не использует старые glass/ink/surface цвета в home-слоях.
screenshots:
  - qa-screens/2026-07-15-home-cards-system/mobile-home-cards-system.png
checks:
  - npm run build
  - Browser smoke: home desktop overflow = 0, surah cards text overflow = 0
  - Browser smoke: home mobile 390x844 overflow = 0, cards width = 358px
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: home cards, quick surahs, filter and legacy hero tokens.
- Where to verify: home page in desktop and mobile widths.
- Risks: remaining page-specific screens still need the same token cleanup pass.
