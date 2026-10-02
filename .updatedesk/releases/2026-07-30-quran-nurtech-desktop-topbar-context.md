---
project: quran-nurtech
public: true
type: design
audience: users
title: Верхняя панель стала ближе к macOS
summary: На страницах чтения верхняя панель теперь показывает компактную иконку приложения и отдельный контекст текущей суры или страницы. Поле перехода остаётся главным поисковым действием, а кнопки чтения визуально меньше конфликтуют между собой.
user_impact:
  - На desktop проще понять, где находится пользователь: текущая сура выводится прямо в toolbar.
  - Бренд больше не спорит с названием суры и занимает меньше места.
  - Поле «Сура, 2:255 или слово» остаётся единственным главным поиском в верхней панели.
screenshots:
  - qa-screens/2026-07-30-topbar-polish/surah-38-topbar.png
checks:
  - npm run build
  - Browser smoke: /surah/38 toolbar context = "Сад" / "Сура 38"
  - Browser smoke: desktop toolbar horizontalOverflow=false
deploy_url: https://quran.nurtech.dev
---

Notes for editor:
- What changed: toolbar context получил ellipsis-safe стили, а на desktop при наличии контекста бренд сворачивается до иконки приложения; поле быстрого перехода получило устойчивую ширину.
- Where to verify: откройте `/surah/38` на desktop и проверьте верхнюю панель: слева должна быть иконка приложения, рядом «Сад / Сура 38», далее поле перехода.
- Risks: используется CSS `:has()` для desktop-polish; актуальные Safari/Chrome/Firefox поддерживают его, mobile-ветка не зависит от этого правила.
