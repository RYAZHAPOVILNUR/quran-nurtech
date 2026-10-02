---
project: quran-nurtech
public: false
type: design
audience: team
title: Унифицированы переключатели интерфейса
summary: Убран отдельный старый стиль segmented controls в настройках. Переключатели теперь используют общий компонентный слой, а мобильная высота задана точечно через компонентную переменную.
user_impact:
  - Переключатели в настройках и боковом меню выглядят консистентнее.
  - Меньше риска, что мобильные правила случайно растянут элементы в сайдбаре.
screenshots:
  - qa-screens/2026-07-15-drawer-tabs/drawer-tabs-juz-fixed.png
checks:
  - npm run build
  - Browser check: drawer tabs 28px, settings segmented controls 40px on local viewport.
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: удалены дубли `.menu .seg`, общий `component-segmented.css` получил управляемую высоту кнопки.
- Where to verify: боковое меню и настройки чтения.
- Risks: точечные страницы с собственным segmented могут потребовать последующего polish.
