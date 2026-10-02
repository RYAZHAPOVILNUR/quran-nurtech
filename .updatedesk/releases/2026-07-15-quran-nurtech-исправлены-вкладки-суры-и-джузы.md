---
project: quran-nurtech
public: true
type: fix
audience: users
title: Исправлены вкладки Суры и Джузы
summary: В боковом меню исправлено переключение между списком сур и джузов. Активной теперь остаётся только одна вкладка, а визуальное выделение стало спокойнее и ближе к macOS segmented control.
user_impact:
  - Вкладки «Суры» и «Джузы» больше не выглядят одновременно выбранными.
  - Локальная и продовая версии корректнее обновляют UI после релиза благодаря обновлению service worker cache.
screenshots:
  - qa-screens/2026-07-15-drawer-tabs/drawer-tabs-juz-fixed.png
checks:
  - npm run build
  - Browser check: переключение «Суры» → «Джузы» на http://127.0.0.1:4330/
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: синхронизировано состояние `.on` и `aria-selected`, убран поздний общий override для `.dtabs`, обновлена версия service worker.
- Where to verify: открыть боковое меню, переключить «Суры» и «Джузы».
- Risks: у пользователей со старым PWA-кэшем обновление может примениться после первого reload.
