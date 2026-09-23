# Draft Articles QHUC Readiness Ledger

Review date: 2026-09-22  
Scope: draft-phase HardeepAnand.com article candidates in `content/substack/2026/` plus the local reading draft in `docs/article-drafts/`.

This is a readiness ledger, not publication approval. No article is green until the exact publication revision has a clean article-specific QA/QC report, claim ledger, rendered browser evidence, source boundary approval, voice approval, and Hardeep's explicit release approval.

## Current verdict

| Article | Path | Green check | Reason |
|---|---|---:|---|
| The Civic Curriculum We Never Had | `content/substack/2026/2026-09-08-civic-curriculum.md` | No | No revision-matched QA/QC package found. Older layout loads cleanly after scroll, but it still needs full source, voice, visual, and owner-review certification. |
| There Is No Away | `content/substack/2026/2026-09-08-there-is-no-away.md` | No | SOUL punctuation blocker fixed on this review date, but it still needs a full claim ledger, source recertification, visual review, and article QA/QC report. |
| Governance Must Live Inside the Work | `content/substack/2026/2026-09-20-governance-must-live-inside-the-work.md` | No | Strong package with passing figure tests, but the existing QA/QC remains provisional and names dark-theme and reduced-motion checks as open. |
| The Question Missing From the AI Jobs Debate | `content/substack/2026/2026-09-20-the-question-missing-from-the-ai-jobs-debate.md` | No | Strong package with passing figure tests, but the existing QA/QC needs updated phone-browser evidence, static export parity, and owner release approval. |
| Head in the Clouds Is Not an Insult | `content/substack/2026/2026-09-21-head-in-the-clouds-is-not-an-insult.md` | Approved for website publication | Hardeep approved website publication on 2026-09-22. The article is now `PUBLISHED`, includes the generated inline teaching diagrams, and has a relevant cloud-to-ground reading-room card diagram. Substack remains separate. |
| Nature Already Has the Math | `docs/article-drafts/2026-09-21-nature-already-has-the-math.md` | No | Strong local reading edition, but it is not integrated as a normal routed article in the current site content system. It needs publication packaging before release review. |

## Checks completed in this pass

- SOUL scanner command ran across all scoped drafts. Result after fixes: pass, with the scanner warning that this is not proof of human authorship.
- Generated figure tests ran for the AI access, governance, and head-in-clouds packages. Result: 10 passed.
- Full project test suite: 56 passed, 1 skipped, 0 failed. Local listener tests required unsandboxed execution.
- `npm run build`: passed. The production build generated 18 pages. Drafts remain excluded from production routes.
- `npm run verify`: passed. The verifier checked 18 rendered pages, internal links and assets, 5 feed entries, and sitemap exclusions.
- Local draft render sweep ran at 1440 by 900, 390 by 844, and 320 by 740 for the five routed draft articles. Result: HTTP 200, no console errors, no failed requests, no broken image loads after scroll, and no horizontal overflow.
- `Head in the Clouds Is Not an Insult` received a separate 2026-09-22 recertification after a narrow risk-reduction edit, then a follow-up opening revision that incorporated Hardeep's inline notes while keeping the private mayor-response context out of the public article. Hardeep approved website publication later on 2026-09-22. The revised manuscript hash is recorded in `docs/review-packages/US-CONTENT-007-QAQC.md`.

## Fixes made in this pass

- Added a development-only `/api/inquiries` readiness fallback to the existing local draft Vite plugin so local article QA does not throw a false `/api/inquiries` 404 while Cloudflare Pages functions remain the production route.
- Replaced forbidden en dash characters in `There Is No Away`, including date ranges and the ReFED page-range link text.
- Tightened the `Head in the Clouds Is Not an Insult` political passage so it reads as neutral interpretation, and made the pump-station scene explicitly illustrative.
- Folded Hardeep's opening comments into `Head in the Clouds Is Not an Insult`: consent-decree context, the "next order" operating question, and the need to operationalize vision across strategy, tactics, operations, finance, engineering, regulators, field crews, and public trust.
- Marked `Head in the Clouds Is Not an Insult` as `PUBLISHED` and added a relevant cloud-to-ground reading-room card diagram.

## Remaining recursive work

1. Create or refresh a separate revision-matched QA/QC report for every article before publication.
2. Build complete claim ledgers for the older drafts, especially `There Is No Away`, where the source claims are current and need fresh primary-source verification before release.
3. Upgrade the older Civic Curriculum and There Is No Away visual packages to the current Systems Lens standard, or explicitly score them lower with reasons.
4. Re-run visual checks for each final revision after any prose or figure edits: desktop, 390, 320, dark theme, reduced motion, replay controls, and static export parity.
5. Confirm APAS bottom-block fit for every article and verify the live CRM/staging receipt path separately from local preview readiness.
6. Record Hardeep's explicit release decision article by article. A clean score is not publication approval.

## Current publication decision

Only `Head in the Clouds Is Not an Insult` has website publication approval as of 2026-09-22. Do not publish the other scoped drafts until their article-specific QA/QC and release approvals are complete.
