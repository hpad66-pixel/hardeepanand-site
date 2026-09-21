# Public Site Mobile QA

Date: 2026-09-21. Authorized by Hardeep through task `01a0c51d-c27b-7d01-b2ea-d8188b55af63`. Scope: responsive presentation and usability only. Restored hero concept, original ivory/obsidian identity, article wording, published URLs, draft states and private authorization are preserved.

## Route Inventory

Discovered from the sitemap and recursively followed same-site page links, not a hand-selected homepage sample:

| Public page | Scope |
| --- | --- |
| `/` | Hero, library, author introduction/video, newsletter, footer |
| `/writing/` | All writing, Start Here, visual index, search/topics |
| `/about/` | Author page |
| `/work/` | Service descriptions and email invitation |
| `/summits/` | Public speaking page, still in sitemap |
| `/case-studies/` | Legacy public collection, still in sitemap |
| `/ai-watch/` | Legacy public collection, still in sitemap |
| `/climb/adapt-dont-pivot/` | Published essay, two figures |
| `/climb/in-your-head/` | Published essay, two figures |
| `/writing/data-governance/` | Published essay, five figures |
| `/writing/fifty-steps-back/` | Published essay, five figures |
| `/writing/vital-signs/` | Published essay, five figures |
| `/writing/nature-already-has-the-math/` | Published essay, five figures |

Also checked the rendered 404 experience, RSS XML, JSON feed and XML sitemap. Feeds are machine-readable resources, not responsive HTML pages. `/climb/` remains an alias to the unified writing library. Former lexicon/minute and collection aliases retain their redirect rules. Private admin/API routes and unpublished drafts are excluded from the public layout inventory and checked separately for access boundaries.

## Matrix And Findings

| Environment | Widths | Result |
| --- | --- | --- |
| Local Chromium, touch/mobile emulation | 430, 390, 375, 320, 768 | PASS |
| Local WebKit, touch/mobile emulation | 430, 390, 375, 320, 768 | PASS |
| Short landscape menu, both engines | 844 x 390 | PASS |
| Restored hero regression | 1920, 1440, 1024, 820, 650, 390, 320 | PASS |
| Full existing publication regression | 1920, 1440, 1024, 820, 390, 320 | PASS |
| Production matrix | Same five phone/tablet widths in both engines | Pending deployment verification |

Each browser's local report contains 87 measured page/state layouts: 70 primary route/viewport combinations, 14 dark/reduced-motion pages, the expanded introduction, and two mocked ready-form states. All detected overflow, clipping, broken images, undersized tested controls, input font-size and SVG label findings are cleared. All 24 article figures are checked for readable rendered labels, SVG containment, owner-box containment and label collisions. Explicit UI controls target at least 44 CSS pixels; inline prose links are not claimed as 44px buttons.

Issues found and corrected:

- Footer/social links, menu/replay buttons, email/discussion links, article actions and introduction disclosure had small touch targets. Enlarged these without replacing the editorial hierarchy.
- WebKit rendered the native topic select at 25px despite `min-height`. Explicit 44px height preserves the native select and fixes the browser-specific issue.
- Signup inputs used 14px text; contact inputs also needed a phone-safe size in their conditional ready state. Both use 16px mobile input text, with larger consent text/checkboxes.
- Older article diagrams had labels as small as 7.8px at 320px. Enlarged mobile SVG labels, wrapped long labels, expanded the affected boxes and used the independently authored mobile compositions through tablet widths. Wording and relationships are retained. The catalog connector now leaves clear space around its label.
- The short landscape menu could extend below the screen. It now scrolls within the available dynamic viewport. Navigation also remains visible when JavaScript is disabled.
- The existing `/case-studies/*` redirect matched its own index and caused a production redirect loop. Requiring a descendant fixes the index while retaining child redirects. Verified in the local Cloudflare Pages runtime. Rule behavior follows [Cloudflare's redirect documentation](https://developers.cloudflare.com/pages/configuration/redirects/).

## Verification

- Build: 19 pages. Tests: 62 passed, one existing private-manuscript skip. Internal links/assets, six feed entries and sitemap exclusions pass.
- Search, topics, clear/empty results, Start Here, visual-index expansion, menu open/Escape/link navigation and article-to-library Back state pass at every requested width. The separate Back test verifies nine expanded diagrams, search and scroll restoration.
- All six essays retain print-isolated takeaways and article-attributed email/share destinations. No email, subscription or inquiry was sent.
- Video metadata loads, native controls and inline playback attributes are present, and expanded video layout fits. Conditional CRM-ready forms were checked using local mocked readiness only; this is not a live CRM delivery claim.
- Representative phone screenshots inspected: hero/library, About/Work, newsletter/inquiry, and modified figure families. Full-page and individual-figure screenshots are retained locally, not shipped.
- Source prose, article publication metadata, Nature's approved fragment/figures, hero markup and private backend are unchanged.

Evidence: `mobile-site-local/{chromium,webkit}-results.json`, `mobile-site-hero/hero-checks.json`, and `mobile-site-regression/browser-results.json`. Reproduce with `PLAYWRIGHT_MODULE=<module> node scripts/check-mobile-site.mjs`; set `BROWSER=webkit` for WebKit or `PREVIEW_URL=https://hardeepanand.com` for production. JSON evidence is versioned; screenshot/PDF artifacts stay local.

## Release And Limits

Corrective deployment and live verification pending. No local blocker remains.

This is complete coverage of the discovered public surface at the stated viewport matrix, not a guarantee for every physical device or browser release. Chromium and WebKit were tested; physical iOS/Android hardware, Firefox, screen-reader workflows and third-party Substack/APAS destinations were not audited. Live contact/subscription submissions were deliberately excluded. No change to article arguments or claim/source validation is implied by this presentation pass.
