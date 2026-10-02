---
project: quran-nurtech
public: false
type: design
audience: team
title: Reader приведён к системным поверхностям
summary: Reader-слои, заметки и контекстное меню аята переведены с legacy-палитры на системные поверхности.
user_impact:
  - Текст аятов, перевод и кнопки тафсира стабильнее укладываются в карточку без горизонтального переполнения.
  - Мобильный reader получил нижний запас под плеер и tab bar, а вложенные поверхности выглядят спокойнее.
screenshots:
  - qa-screens/2026-07-15-reader-system/mobile-reader-system.png
checks:
  - npm run build
  - Browser smoke: /surah/109 desktop overflow = 0, no text child overflow
  - Browser smoke: /surah/109 mobile 390x844 overflow = 0, ayahs padding-bottom = 112px
deploy_url: https://quran.nurtech.dev/
---

Notes for editor:
- What changed: reader compat, notes, context menu and mobile ayahs bottom padding.
- Where to verify: surah pages with translation and tafsir buttons.
- Risks: full removal of reader-compat/reader-polish files remains a later cleanup task.
