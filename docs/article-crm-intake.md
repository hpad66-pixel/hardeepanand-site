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

Existing IDEAS R2 and ENGAGE KV bindings provide private pending-note storage and basic submission throttling. No secrets go in public build variables. The local Astro preview deliberately does not submit to the CRM.

## Behavior and limits

The handler validates consent, origin, bounded fields and size, includes a honeypot and basic KV throttling, and persists a note before forwarding. Source article, company, email, message and consent reference accompany the contact candidate. HTTP 202 with a candidate ID is the only accepted receipt. Cloudflare redirects are not followed. This is CRM staging, not approval into the master CRM and not an automatic email to a prospect.

Private notes use the R2 prefix `website-inquiries/v1/`. Retries reuse the submission ID and unchanged payload. Receipt replay does not re-send accepted notes. A delayed submission remains pending and the form offers a retry; no autonomous background retry worker or failure-alert workflow is configured yet. KV throttling is best effort under concurrency, not a strict distributed rate limiter.

Before publication, run a clearly labeled test through a server-enabled preview, confirm its receipt and source in staging, then retry the same payload and confirm no duplicate candidate. Review retention and add scheduled pending-delivery handling before treating intake as unattended. Do not advertise the form as connected before the receipt check succeeds.
