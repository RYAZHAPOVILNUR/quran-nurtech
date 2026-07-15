---
project: quran-nurtech
public: true
type: internal
audience: team
title: Desktop shell переведён на системные токены
summary: Desktop sidebar и toolbar hover/selected states больше не используют старые палитры `--ink`, `--accent`, `--hairline`, `--panel-bg`; слой переведён на `--sys-*` токены.
user_impact:
  - Сайдбар и toolbar выглядят стабильнее в светлой и тёмной темах.
  - Меньше риска конфликтов между старой и новой дизайн-системой.
screenshots:
  - qa-screens/2026-07-15-drawer-tabs/drawer-tabs-juz-fixed.png
checks:
  - npm run build
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: desktop shell переведён на системные separator/fill/sidebar/label tokens.
- Where to verify: desktop sidebar, hover/selected rows, toolbar icon hover.
- Risks: visual-only cleanup, low risk.
