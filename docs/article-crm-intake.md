# Article inquiry connection

The shared APAS article section posts to `/api/inquiries`. The server adapter targets the documented APAS CRM partner intake endpoint at `https://apascrm.com/api/v1/partner/contact-candidates`.

## Activation

Register https://hardeepanand.com in APAS CRM → Integrations → Website setup. Use a separate contacts.stage-only credential restricted to that site. Configure a Cloudflare Service Auth policy for `apascrm.com/api/v1/partner/*`, without changing employee-facing access. Store these in the Pages project's server secret settings:

- APAS_CRM_API_KEY
- APAS_ORGANIZATION_ID
- APAS_SITE_ID
- CF_ACCESS_CLIENT_ID
- CF_ACCESS_CLIENT_SECRET
- APAS_PROJECT_ID, only if associating this intake with an existing project

Existing IDEAS R2 and ENGAGE KV bindings provide private pending-note storage and basic submission throttling. No secrets go in public build variables. The static Astro preview has no Pages Functions backend. The form checks same-origin readiness in every environment, shows the form only when the endpoint reports ready, and otherwise offers an email invitation. Readers never see setup or CRM configuration messages. No JavaScript also leaves the email invitation available.

## Behavior and limits

The handler validates consent, origin, bounded fields and size, includes a honeypot and basic KV throttling, and persists a note before forwarding. Source article, company, email, message and consent reference accompany the contact candidate. HTTP 202 with a candidate ID is the only accepted receipt. Cloudflare redirects are not followed. This is CRM staging, not approval into the master CRM and not an automatic email to a prospect.

Private notes use the R2 prefix `website-inquiries/v1/`. Retries reuse the submission ID and unchanged payload. Receipt replay does not re-send accepted notes. A delayed submission remains pending and the form offers a retry; no autonomous background retry worker or failure-alert workflow is configured yet. KV throttling is best effort under concurrency, not a strict distributed rate limiter.

Before publication, run a clearly labeled test through a server-enabled preview, confirm its receipt and source in staging, then retry the same payload and confirm no duplicate candidate. Review retention and add scheduled pending-delivery handling before treating intake as unattended. Do not advertise the form as connected before the receipt check succeeds.

## Configuration audit — September 7, 2026

APAS CRM has an active website key for Hardeep Anand — The Systems Lens (https://hardeepanand.com). Its organization ID is `11111111-1111-4111-8111-111111111111` and site ID is `e34b0c75-3ccd-4846-93f1-785ce977f365`; these non-secret identifiers are now in wrangler.toml for the next deployment. The key secret is not recoverable from the setup page.

At this check, Cloudflare Pages production had no APAS or Cloudflare service credentials installed. Its deployed `/api/inquiries` status returned `ready: false` on pages.dev; the custom-domain endpoint returned HTTP 302 rather than JSON. Installing the saved API key and service credentials, enabling public access to the exact website intake endpoint while preserving private routes, deploying, and verifying a real staging receipt are still required. Do not confuse a registered active CRM key with a verified website connection.


## Reader signup (September 7 homepage revision)

`GET/POST /api/subscriptions` reuses the same server-only delivery, storage, consent, origin, rate-limit, and receipt checks. The form falls back to a supported Substack subscription URL when intake is unavailable. Only after the readiness check succeeds does it offer a separate APAS contact opt-in. The server records `systems-lens-reader`, `reader-connection`, source `/`, and `subscriptionStatus: unconfirmed`. A confirmed CRM staging receipt is not a Substack subscription. The reader must finish confirmation on Substack; no automatic membership synchronization is implemented.

A refreshed Cloudflare login on September 7 verified that production still has only GITHUB_TOKEN, IDEAS_OWNER_EMAIL, and LIBRARY_PUSH_TOKEN_SHA256 environment entries. APAS_CRM_API_KEY and the Cloudflare service credentials are absent. The public organization/site IDs in wrangler.toml will be supplied on deployment; they are not proof of an authenticated intake. Live reader capture remains unavailable until the missing integration credentials and route access are configured and a receipt is verified. No contacts were submitted during preview testing.


## Activated and verified — September 8, 2026

The live connection is now active. Production secrets APAS_CRM_API_KEY, CF_ACCESS_CLIENT_ID, and CF_ACCESS_CLIENT_SECRET are encrypted in Cloudflare Pages. The dedicated website key is named **Hardeep Anand — Systems Lens reader intake**, API key ID `801ec62e-07f0-4840-8e90-d551affe27d7`, for the existing site ID above. The earlier unused key remains unchanged.

Cloudflare service token **Systems Lens to APAS CRM** has a one-year lifetime, expiring September 2027. Policy **Systems Lens CRM service** (`604a5beb-03c6-4a0a-ab25-7c0c6063efeb`) is Service Auth for that token only, attached to the existing partner API application `362d209b-3b67-4662-8141-2e65fcf4a30e`, destination `apascrm.com/api/v1/partner/*`. The employee CRM policy was preserved.

A separate **Systems Lens public intake** application grants public access only to `hardeepanand.com/api/inquiries` and `hardeepanand.com/api/subscriptions`. Its Bypass policy is `8d396af6-dc83-4e2e-b115-8c9809a0616b`. These public endpoints retain server validation, explicit consent, rate limiting, private pending storage and receipt checks. `/admin/ideas/` and `/api/ideas` still return an authentication redirect to unauthenticated requests.

Production deployment: `https://ff6e8543.hardeepanand.pages.dev`. Built from live baseline commit `b221ef5` in `/tmp/systems-lens-crm-release`, overlaying only `src/server/inquiries.js`, inquiry/subscription function wrappers, ReaderSignup, its placement in the existing homepage newsletter slot, tests, and public wrangler variables. The redesigned homepage and new article drafts were NOT published. Release checks: build, 30 tests, 18 rendered pages/links/assets, five feed entries.

Live GET readiness returned true for both endpoints. Two clearly synthetic contacts were sent through the actual website endpoints and each payload was repeated: all four requests returned HTTP 202 with accepted=true. APAS CRM displayed exactly two receipts: inquiry `448cebd4-3a21-49db-9ab7-ee080a02dbff`, reader `0f47d9e0-4111-4bf5-bb01-fbac9f033e35`. Consent, test email and website source were visible in staging. Both synthetic entries were removed from staging after verification; neither was approved into master CRM. Audit receipts and website deduplication records remain.

Credential handling note: Cloudflare's copy buttons copy the header label along with the value; strip `CF-Access-Client-Id:` and `CF-Access-Client-Secret:` before storing. Existing encrypted values must be edited in place, not added under duplicate names. Confirm successful save before redeploying. Never log the values.

Membership limits remain: APAS receives only separately consented website contact opt-ins. Substack subscription confirmation, unsubscribes, and the Substack membership list remain with Substack; automatic list synchronization is not implemented. Direct Substack subscribers do not automatically become CRM contacts. Local Astro preview has no Pages Functions and therefore still offers the direct Substack fallback.
