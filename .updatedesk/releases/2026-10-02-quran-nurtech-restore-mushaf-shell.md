---
project: quran-nurtech
public: true
type: fix
audience: users
title: Restore mushaf shell
summary: Restored the compact reading header and centred fullscreen Mushaf page while retaining compatibility changes from main.
user_impact:
  - The header no longer contains the global RU/AR switch, preserving the compact reading controls.
  - Fullscreen Mushaf keeps a centred, page-shaped layout on mobile instead of stretching into a full-width reading column.
screenshots:
  - artifacts/screens/mushaf-shell-mobile-2026-10-02.png
checks:
  - node --test scripts/test-topbar-layout.mjs
  - node --test scripts/test-mushaf-offline.mjs
  - npm run build
deploy_url: http://127.0.0.1:4321/mushaf/80
---

Notes for editor:
- What changed: The locale selector is available inside the navigation drawer. The responsive fullscreen Mushaf overrides now retain the page aspect ratio, border, and centred alignment.
- Where to verify: Open /mushaf/80, enter fullscreen, and repeat at a 390 px viewport.
- Risks: The language selector has moved from the header to the drawer by design; locale persistence continues to use the existing data-locale-set bindings.
