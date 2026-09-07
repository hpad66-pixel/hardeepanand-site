# hardeepanand.com

Public Astro site and published content. The existing Cloudflare Pages project is
`hardeepanand`, with the custom domain `hardeepanand.com`. It uses direct uploads;
pushing GitHub alone does not publish the site.

## Work locally

```sh
npm ci
npm run dev
```

## Verify and publish

```sh
npm run deploy
```

This builds, tests Access verification, checks rendered internal links and feeds,
and uploads to the existing production project. Wrangler must be signed in to
the APAS Cloudflare account. To review without replacing production:

```sh
npm run build
npm run test
npm run verify
npx wrangler pages deploy dist --project-name hardeepanand --branch codex/redesign-preview
```

Keep `functions/` alongside the site when deploying. It protects `/admin/` and
`/api/save` on both the custom domain and Pages deployment URLs. The public
Access audience and team default to the existing application; `ACCESS_AUD` and
`ACCESS_TEAM_DOMAIN` can override them if that application changes.

## Editing

The protected studio is at `/admin/`. The inline editor saves browser previews,
exports edits, and can save named copy fields to GitHub with the existing
`GITHUB_TOKEN` secret. The repository defaults to `hpad66-pixel/hardeepanand-site`.
Saving copy does **not** automatically deploy. Pull the saved source, then run
`npm run deploy`. Article edits, profile changes, and theme changes use the
studio's export controls and must be incorporated in the source before deploy.

Newsletter signup continues to `www.thesystemslens.com/subscribe`; the reader
confirms there. Contact uses the published business address `hardeep@apas.ai`
or the verified LinkedIn profile. No fake form success or local service needed.

## Content

Only published public-lane content belongs here. Never add the private corpus,
transcripts, internal drafts, or personal records. `src/lib/content.js` retains
the production PUBLISHED gate and the OWOS import contract.

The September 2026 redesign recovered the existing public essays and Second
Climb pieces missing from this checkout. Provenance is recorded in
`content/published-pages.json`; the original public figures remain under their
existing asset paths. Previously missing reference pages now have sourced
replacements. Unavailable case-study and AI Watch links redirect to the relevant
collection; their original full text could not be recovered.

See `design/README.md` for the visual identity and image provenance.

## Private idea library

Open `https://hardeepanand.com/admin/ideas/` and sign in as `hardeep@apas.ai`.
Use **Upload an idea**, choose a self-contained HTML file (maximum 5 MB), and
add a title, context, and tags. Repeating this creates a new document rather
than overwriting an earlier one. Search covers titles, summaries, and tags.
The reader disables scripts and external resources. Download original retains
the original file for local use, including interactive recording-card controls.

Files and metadata live only in the private R2 bucket
`hardeepanand-private-ideas`, bound as `IDEAS`. Never enable its public URL or
copy its content into this repository. Both the shell and all API operations
require a signed Cloudflare Access token and the exact `IDEAS_OWNER_EMAIL`.
Missing owner configuration denies access. The existing KV bindings are
preserved in `wrangler.toml`; the existing GITHUB_TOKEN remains a dashboard secret.
A preview deployment uses the same bucket, so test with synthetic documents.

## Scheduling

The site supports a booking button on Work with me. Set `bookingUrl` in
`src/data/scheduling.js` to the owner's verified Google appointment-schedule or
Calendly URL, then deploy. Until supplied, the working email contact remains.
Google Calendar appointment schedules are the recommended starting point for
an existing Workspace user: calendar conflict checks, a shareable booking page,
and website integration without another scheduling account. Confirm account,
availability, duration, and Workspace feature availability before setup.
Official guidance: https://support.google.com/calendar/answer/11608416
and https://support.google.com/calendar/answer/10733297.

## Future second-brain architecture

The library is a document foundation, not an inferred knowledge graph. A next
phase can add a private D1 catalog with document IDs, revisions, curated topics,
people, and explicit relationships. Each relationship should carry a source
reference, excerpt, author/reviewer, and confidence/status so it can be inspected
and corrected. Preserve original HTML in R2; extract searchable text privately.
Use owner-reviewed entity resolution before connecting conversations. A private
search index can precede embeddings; a graph is useful only when navigation
between supported relationships improves retrieval. No private corpus has been
ingested and no relationships have been invented by this redesign.

## Telegram / Hermes uploads

A dedicated machine upload endpoint is deployed at
`POST /integrations/library/push`. It requires the narrowly scoped upload token;
all reading stays behind the existing owner-only Access checks. The complete
credential-free Hermes installation bundle is at
`https://hardeepanand.com/integrations/telegram-private-library.zip`.
See `integrations/telegram-private-library/README.md` and `SKILL.md` for installation,
"push it" behavior, environment setup, and revocation across retained deployments.

The token/verifier has been created and the live upload plus retry verified.
The upload credential is saved in Hostinger's managed Droobi environment.
The skill is installed at `/data/skills/telegram-private-library`, appears in
Hermes's skill list, and passed a real hosted upload plus identical retry.
The temporary test document was deleted, and the gateway is running.
A first model check exposed Nexos HTTP 402. The owner clarified that the
already-connected ChatGPT subscription should power Hermes. Hostinger now
saves `openai-codex` / `gpt-5.6-luna` as the default, with no configured fallback
or auxiliary provider overrides. A fresh ChatGPT conversation successfully
read the installed skill and reported the correct trigger and private URL.
No separate OpenAI API key or Hostinger AI-credit top-up is needed for this
configured connection. The final Telegram "push it" conversation test remains
outstanding; the hosted upload path and model readiness both passed.
The separate local Mac Hermes configuration has not been changed.
