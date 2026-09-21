# US-CONTENT-008 Release QA/QC

Article: Nature Already Has the Math. Integration revision: 2026-09-21.

Status: publication authorized; final integrated local release checks PASS. Deployment and live verification are recorded separately below.

## Authority and exact parity

The owner explicitly authorized publication on hardeepanand.com. Only the new Nature article is marked PUBLISHED by this change. The existing status filter still controls production route and feed inclusion. This approval does not change any other article's status.

Saved originals were read, never edited, under `/Users/apas/Documents/Github/hardeepanand-site/`:

| Original | SHA-256 |
| --- | --- |
| `docs/article-drafts/2026-09-21-nature-already-has-the-math-preview.html` | `8f97fbb00a3ba45ec92ad2c83898cf46d286bd6728d1238088bc6ef245546af5` |
| `docs/article-drafts/2026-09-21-nature-already-has-the-math.md` | `5b9fdcec176f3d2ffc285d8dd88228138877e73442d9e13c9e021855f08664b7` |
| `docs/review-packages/US-CONTENT-008-QAQC.md` | `f700c45f2052cd08c2b27ae43eea3e4b6c8d120a7771e58e6465ebb53be638df` |

The source report's editorial 95/100 and visual 95/100 apply to the saved standalone reading edition. They are historical source-review evidence, not scores for this new public route. Its C01-C29 ledger, primary-source locators, numerical inventory, reviewer identity, benchmark comparison and figure reviews remain the source claim authority. This integration makes no new factual claim and does not purport to repeat that independent source review.

The article argument and approved five figure families are settled. No additional human/place illustration or argument revision is introduced during release integration.

| Release artifact | SHA-256 |
| --- | --- |
| `src/assets/nature-already-has-the-math/article.html` | `426a70d992d0af5fe5a52bb05b4cb544ce2ec578810916ea002c1f23ee5ee3cb` |
| `content/substack/2026/2026-09-21-nature-already-has-the-math.md` | `9ca137b648179bb72f538f35c726db11aa14016c204dfbed678c3f9d2fd74c54` |
| `src/assets/nature-already-has-the-math/manifest.json` | `b8535da8f0b5306109e358ebbd6919362d3387ec1822691e167c079bbb94af9e` |

The raw article fragment is a byte-for-byte extraction of the approved HTML's prose section. It contains all five original desktop SVGs, all five phone SVGs, captions, source links, both authored quote plates, three utility examples, five takeaways and the approved APAS signature. The manifest records each original SVG's exact hash separately from its styled standalone export hash.

The public route adds the existing site header/byline, discussion footer and takeaway share/print controls. The takeover controls require only class substitutions and added controls; a parsed production-DOM test removes those added control/attribution nodes and proves the remaining normalized reading text equals the approved fragment exactly. The original APAS block is used once; the generic APAS signature component is suppressed only for this article.

The Markdown discovery/feed body retains every approved prose paragraph, caption, source link, example and takeaway. The six Mermaid source blocks and repeated title/byline are removed from that derivative. Original Mermaid authoring remains untouched in the saved manuscript. No SVG, script or style markup enters the Markdown body. Topic is Water & systems; summary, thesis and takeaway are copied from the approved article.

## Implementation and exports

Route: `https://hardeepanand.com/writing/nature-already-has-the-math/` (intended canonical; this worker has not deployed it).

- `src/components/NatureArticle.astro` renders the approved inner article and adds existing takeaway actions.
- `src/styles/nature-article.generated.css` scopes the canonical reading CSS to Nature; `src/styles/nature-article.css` handles integration with the shared shell. The approved ivory palette is deliberately local to the reading edition, including when the surrounding shell has another theme. Parent must inspect the theme transition.
- `src/lib/nature-motion.js` preserves the original finite trace/replay behavior, now scoped to Nature. Reduced motion retains static diagrams and suppresses moving traces/replay. Static route tests check this code; interaction verification belongs to parent final browser QA.
- `scripts/build-nature-article.mjs` checks exact original hashes before generating derivatives. It refuses to run in the source workspace. Regeneration command from this release worktree: `node scripts/build-nature-article.mjs /Users/apas/Documents/Github/hardeepanand-site`.
- `src/pages/writing/[slug].astro` changes only the Nature component import, slug flag, article class, body branch and suppression of the duplicate generic APAS block.

Public export directory: `/images/articles/nature-already-has-the-math/`.

| Anchor | Desktop SVG / PNG | Phone SVG / PNG | Instructional purpose |
| --- | --- | --- | --- |
| `fig-hydrologic` | `fig-hydrologic.svg`, `fig-hydrologic.png` | `fig-hydrologic-mobile.svg`, `fig-hydrologic-mobile.png` | Physical water movement and utility intervention |
| `fig-storm` | `fig-storm.svg`, `fig-storm.png` | `fig-storm-mobile.svg`, `fig-storm-mobile.png` | Distinct storm pathways and consequences |
| `fig-algae` | `fig-algae.svg`, `fig-algae.png` | `fig-algae-mobile.svg`, `fig-algae-mobile.png` | Possible ecological and treatment pathways |
| `fig-ai-test` | `fig-ai-test.svg`, `fig-ai-test.png` | `fig-ai-test-mobile.svg`, `fig-ai-test-mobile.png` | Evidence checks and human decision authority |
| `fig-framework` | `fig-framework.svg`, `fig-framework.png` | `fig-framework-mobile.svg`, `fig-framework-mobile.png` | Responsibilities and separate human/community feedback |

Each standalone SVG carries original shape styling and its required markers; CSS variables are resolved for portable rasterization. Geometry and text remain the original composition. PNGs are transparent, generated at 2x through Sharp. The hydrologic PNG was visually inspected and all ten PNGs pass format/dimension/nonblank pixel tests. Font fallbacks can differ from browser-loaded Inter; parent should inspect export label containment before scoring them. These are conceptual diagrams, not measured outcome charts.

## Checks completed

At the integration checkpoint before final parent shell/discovery changes:

- `node --test tests/nature-article.test.mjs`: six passed, zero failures, zero skips after production build. Checks approved source/body hashes; Markdown paragraph/link parity and publication status; five anchors; ten byte-matched SVGs; unique accessible IDs; styled standalone marker resolution and nonblank PNGs; scoped reduced-motion/replay code; production rendered-text parity and share controls.
- `npm run build`: passed, 19 pages, including the Nature writing route.
- `npm test`: 51 tests, 50 passed, one existing private-manuscript skip, zero failures.
- `npm run verify`: passed, 19 rendered pages, internal links/assets, six feed entries and sitemap exclusions.
- Canonical SOUL v1.7.0 scanner against release Markdown and exact article fragment: PASS, no configured voice-rule matches. This is not proof of authorship.
- Original source HTML, Markdown and report hashes rechecked unchanged.
- `git diff --check`: passed. Final article-only CSS specificity adjustments protect the approved layout from shared import ordering; parent final build/browser QA must include those adjustments.

## Scores and parent handoff

Release editorial score: **95/100**. Exact approved reading text, source links, conceptual boundaries, human authority, three utility examples and useful takeaways survive integration. The original independent editorial assessment remains applicable because text parity is tested; this release does not claim a new independent fact review. The framework remains an interpretation for discussion, not field-validated performance evidence.

Release visual score: **95/100**. All five teaching figures retain distinct purposes, independent phone compositions, replay, static exports and accessible identities. Final own-box checks after fonts load pass for 97 desktop and 80 phone labels, with no text collision or sampled connector crossing. Finite traces explain paths while the complete static diagrams remain visible. The smallest phone text is approximately 13px at 320px; that narrow viewport is the main readability constraint and a reason not to claim a perfect score.

Reader value and offer remain unchanged: utility teams can test AI answers against source records, physical relationships, operator knowledge, consequences and decision ownership. The pressure complaint, loading spike and capital-plan examples support that practical test. The APAS readiness-map invitation follows the same problem without promising outcomes.

Parent owns final desktop, phone and 320px route rendering; text/box containment and connector checks after fonts load; replay early/mid/end and reduced-motion checks; theme transition; sources, print/share controls and APAS link; final homepage/visual-index/discovery integration; final production build/verification after all workers finish; and deployment. Newton owns RelatedReading integration. All five figure anchors and static PNG paths are ready for those links.

The worker checkpoint did not make a final browser or live-publication claim. The parent review below supplies the final browser scores and evidence. Neither review claims audience-tested results.

## Final Integrated Review

The preceding worker handoff describes the earlier checkpoint. Final parent checks on 2026-09-21 supersede its pending-browser status:

- `npm run build`: PASS, 19 static pages. `npm run verify`: PASS, internal links/assets, six feed entries and sitemap exclusions.
- Full tests with `DISCOVERY_BASE_URL=http://127.0.0.1:4395` and the Playwright module configured: **60 passed, one existing private-manuscript skip, zero failures**.
- `scripts/check-publication-browser.mjs`: PASS on home, library and Nature at 1920, 1440, 1024, 820, 390 and 320px. Zero page overflow, broken images or JavaScript exceptions. Existing public essays, About and Work pass 320px route/overflow checks.
- All five diagram anchors resolve from the nine-entry visual index. All ten SVG identities remain unchanged. Replay states differ between early/mid frames at desktop and 320px and leave zero moving traces at completion. Reduced motion hides replay and traces. OS dark mode preserves the intentional reading edition; saved obsidian theme retains readable discovery text and controls.
- Print action isolates the five takeaways with title, author and canonical link. Email text contains the takeaways and canonical URL; no mail or social post was sent. Printable article and takeaway proofs were generated.
- No-JavaScript library exposes six essays, six reader routes and nine diagrams. Search, multiword/topic selection, clearing, empty state, keyboard tabs, direct mode links and load more pass.
- Independent release critic: Locke, read-only. Found browser Back resetting filters/expanded results. Corrected with validated URL/history state and `pageshow` restoration; dedicated 390px browser regression confirms two filtered essays, nine expanded diagrams, search and scroll survive navigation.
- Parent visual QA found standalone-shell selectors leaking into Nature's article root, creating horizontal overflow and uppercase labels. Corrected the PostCSS conversion to remove empty selector rules rather than promoting them. Added a root-property regression test. All viewport, own-box and connector checks were rerun and pass. These were release blockers, not accepted defects.
- SOUL v1.7.0 scanner passes for new homepage copy, discovery metadata, article Markdown and exact HTML fragment. It is a configured-language check, not authorship certification.

Final evidence: `publication-evidence/browser-results.json`, desktop/phone screenshots, individual figure screenshots, `nature-print.pdf`, and `takeaway-sheet.pdf`. Individual figure captures suppress sticky navigation only for the isolated screenshot; layout measurements use the normal page. Evidence files are local review artifacts, not public article assets.

| Final source | SHA-256 |
| --- | --- |
| Article HTML | `426a70d992d0af5fe5a52bb05b4cb544ce2ec578810916ea002c1f23ee5ee3cb` |
| Generated Nature CSS | `01ed7da9b03b751124ef06ba503cdc809f3df4cdc8c9c53a06ed0034f8f523f5` |
| Nature integration CSS | `481d6fac63c60d5638e81b32ae3192eaa9fb852e4e136f95d439d1e8d4ff8f7a` |

Publication approval applies only to Nature and this discovery redesign. Other drafts remain excluded. No claim is made about audience feedback, CRM submission, or new commercial outcomes.

## Deployment

Pending successful Pages upload and public verification. Authentication and the existing APAS Pages project `hardeepanand`, mapped to `hardeepanand.com`, have been verified. Existing Functions and storage bindings are preserved.
