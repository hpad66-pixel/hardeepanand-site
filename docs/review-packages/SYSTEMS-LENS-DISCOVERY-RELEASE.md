# Systems Lens Discovery Release

Date: 2026-09-21. Local release QA: PASS. User authorized production release in the originating voice task. Article-specific review is in `US-CONTENT-008-RELEASE-QAQC.md`.

## Outcome

The homepage names Hardeep Anand prominently over the existing connected-waterways artwork, retains The Systems Lens identity, and introduces the featured essay before the library. The engineering-paper treatment is restrained to the shared masthead and author section. Actual writing begins in the first viewport on desktop and phone. The waterways are illustrative artwork, not a documented aerial location.

The owner's final background constraint is applied: page, feature, library and author sections inherit the original theme background, including ivory and obsidian. The grid is an overlay, not a replacement palette. Direct old-live versus release computed-color evidence is recorded in `publication-evidence/background-comparison.json`.

The unified library contains six public essays, six curated reader questions and nine genuine teaching diagrams. Search and topics combine with useful empty/clear states. Six-at-a-time expansion supports a growing archive. Related reading now explains the connection on all six public essays. Existing article URLs and private authorization are unchanged.

## Quality Assessment

Discovery/UX score: **93/100**, an editorial engineering assessment rather than a user-study result. Reader value appears earlier, routes and diagram links are grounded in actual published content, and desktop/phone controls work. The catalog is still small, curated routes require editorial upkeep, and diagram thumbnails are invitations to the full reading rather than substitutes for full-size diagrams. No measured engagement increase is claimed.

- Combined browser checks: home/library/Nature at 1920, 1440, 1024, 820, 390 and 320px; no detected overflow or broken images.
- Six essays, six routes and nine diagrams remain available without JavaScript.
- Keyboard tabs, mobile menu/Escape, search/topic/clear/empty/load-more and deep links pass.
- Independent critic's browser-Back finding was corrected and verified at 390px, including expanded diagrams and scroll restoration.
- Saved obsidian controls and text are readable; reduced-motion respects the static reading.
- Tests: 60 passed, one private-manuscript skip when browser regression is enabled. Build: 19 pages. Verification: six feed entries, internal links/assets and sitemap exclusions pass.
- No contact messages, subscriptions or CRM records were submitted during QA.

Evidence lives in `publication-evidence/`. Reproduce with `npm run build`, a production preview, `PLAYWRIGHT_MODULE=<installed Playwright module> node scripts/check-publication-browser.mjs`, and `DISCOVERY_BASE_URL=<preview> PLAYWRIGHT_MODULE=<module> npm test`.

## Revision

| Source | SHA-256 |
| --- | --- |
| `src/pages/index.astro` | `597c7a2d1cb979c2401943293ecbeb3e7687c76574bb5fc8f2af77603b427bda` |
| `src/components/ReadingRoom.astro` | `22176825f825ae360e67e7b36b9bbc4e18e3312a12b9033c94547697408b483e` |
| `src/lib/discovery.js` | `a3d6d1e1384bdb0988894995507e6824de12112505c0224bda0b3b72ef9b8b93` |

Isolated source branch: `codex/systems-lens-publication`, based on `a82aa1653beb148ac96376812f89d9548fe08d54`. The saved workspace's unrelated draft changes were not copied, reverted or shipped. Git source delivery and Pages publication are recorded separately.
