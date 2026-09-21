# Hero Correction QA

Date: 2026-09-21. Explicit corrective publication authorization received through originating task `01a0c51d-c27b-7d01-b2ea-d8188b55af63`.

## Scope

Restore the prior side-by-side homepage composition with the vertical connected-waterways illustration, large identity statement, original supporting copy/actions and Meet Hardeep. Remove the rejected banner. Preserve original ivory `#f5f3ed` and obsidian `#101820`, unified discovery features, and all article prose/publication states.

Library cleanup: title-leading Newsreader headings, readable Inter summaries/metadata and quieter Inter takeaways. Desktop measured sizes: statement 69px, library titles 32px, summaries/takeaways 16px, metadata 13px, navigation 14px. Mobile sizes and navigation collapse are explicitly responsive. Fonts were loaded before inspection; the issue was hierarchy, not missing fonts.

## Local Evidence

- `hero-correction-evidence/hero-checks.json`: 1920, 1440, 1024, 820, 650, 390 and 320px; banner absent, side-by-side desktop, stacked phone, no page/nav overflow, fonts loaded and original theme colors preserved.
- `hero-correction-regression/browser-results.json`: full publication browser regression completed with no errors, including library behavior, article diagrams and label containment across desktop/phone, dark/reduced-motion, print and no-JavaScript reading.
- Screenshots retained locally in those evidence folders; desktop, phone and library screenshots visually inspected.
- Before deployment: build 19 pages; verification passed for assets, internal links, six feed entries and draft exclusions; tests 60 passed, one existing private-manuscript skip.
- No article source or publication state changed. No subscriptions or contact forms submitted during QA.

## Deployment

**LIVE, verified:** corrective code commit `d5ff65d` deployed through the existing `npm run deploy` Cloudflare Pages workflow to `https://e348d567.hardeepanand.pages.dev`, serving `https://hardeepanand.com/`. Source pushed to `codex/systems-lens-publication`; not merged into origin/main. The deployment build/test/verify repeated successfully: 19 pages, 60 tests passed, one existing private-manuscript skip, six feed entries.

Live `hero-correction-live/hero-checks.json` confirms the rejected banner is absent, the vertical side-by-side composition is restored, the 69px desktop statement and library typography are present, and all seven viewport/theme checks pass. Live screenshots of desktop ivory/obsidian and phone library were visually inspected.

Live `hero-correction-live-regression/browser-results.json` records zero browser errors, no detected overflow/broken images, valid article label containment, six essays, six reader routes and nine diagram anchors. Search, topic filtering, clear/empty states, tabs, keyboard, deep links, progressive loading, mobile menu, animation/replay, reduced motion, print/email content and no-JavaScript reading pass. The independent live 390px Back regression also passes for filters, expanded diagrams, search and scroll restoration.

Direct public checks: homepage/library/Nature HTTP 200; AI Jobs draft HTTP 404; private ideas UI and API retain HTTP 302 Cloudflare Access redirects. No remaining release blocker found. Residual coverage limits: browser automation uses Chromium rather than a cross-browser/device lab; contact/subscription submissions were intentionally not exercised. Local screenshot/PDF artifacts remain untracked; structured JSON evidence is versioned.
