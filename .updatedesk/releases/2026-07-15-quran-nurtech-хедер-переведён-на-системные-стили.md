---
project: quran-nurtech
public: false
type: design
audience: team
title: Хедер переведён на системные стили
summary: Верхняя панель и быстрый переход больше не зависят от старых glass/ink алиасов и используют системные токены.
user_impact:
  - Хедер выглядит спокойнее и одинаковее в светлой, тёмной и сепия-темах.
  - В toolbar остаётся один быстрый поиск/переход без отдельной дублирующей search-кнопки.
screenshots:
  - qa-screens/2026-07-15-topbar-system/mobile-topbar-system-home.png
checks:
  - npm run build
  - Browser smoke: desktop toolbar overflow = 0, search icon links = 0
  - Browser smoke: mobile 390x844 toolbar overflow = 0
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: shell topbar, quick input, logo badge and reciter filter were moved to system tokens.
- Where to verify: home and surah pages in desktop/mobile widths.
- Risks: platform layers still contain separate responsive overrides for toolbar sizing.
