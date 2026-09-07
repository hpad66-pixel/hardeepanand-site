# Release · 5 September 2026

Production: https://hardeepanand.com/
Deployment: https://6bfb9cd4.hardeepanand.pages.dev
Cloudflare project: hardeepanand
Previous deployment (rollback): 95b5df0e-44aa-47b8-ae6d-d17e45f0bc17

Verified: 25 rendered HTML pages, internal links/assets, 10 feed entries,
sitemap exclusions, 14 tests including signed Access JWT validation, owner-only
library gating, cross-origin upload denial, and the real Cloudflare HTML reader.
Desktop/mobile browser review, menu and essay-search behavior checked.
Live homepage returns 200; private custom-domain URL redirects to Access (302);
alternate deployment private API denies unauthenticated requests (403).
R2 public dev URL is disabled.

Pending user-provided inputs: verified booking URL and confirmed first HTML
attachment. Owner-only email is hardeep@apas.ai. A real owner sign-in and upload
still need to be exercised in the live browser; server behavior was tested with
synthetic data. No private content was imported or added to Git/static output.
Source changes are saved in this workspace and have not been committed/pushed.

## Telegram connection preparation · 5 September 2026

Latest production deployment: https://6280a3dd.hardeepanand.pages.dev
Added POST /integrations/library/push with an upload-only bearer token,
stream-bounded 5 MB input, immutable HTML storage, and idempotent retries.
19 tests passed, including real R2 concurrent conditional writes. Live client
upload and retry passed; downloaded R2 bytes matched the original fixture.
The synthetic fixture was removed after verification. Unauthenticated upload
returns 401. The earlier /api/ candidate was covered by the existing Access
edge policy, so the final integration uses its own token-authenticated path.
The existing /admin/ideas/ owner authentication is unchanged.

The credential-free Hermes package is built and available. The private token
is stored outside this repo; its SHA-256 verifier is a Pages secret.
HA_LIBRARY_PUSH_TOKEN was saved in Hostinger's managed Hermes instance
khaki-dugong-843746, and the dashboard showed Running after the apply/restart.
Chrome successfully opened the hosted app and CLI when the in-app browser
could not. A managed-instance restart cleared a stale CLI session. The runtime
confirmed the upload token was present without exposing its value.
Installed the checksum-verified three-file bundle at
`/data/skills/telegram-private-library`; Hermes's skill list recognizes it.
A hosted Python preflight, real upload, and identical retry all passed with
matching SHA-256 and one document ID. The temporary test document was deleted
from R2 after verification. `hermes gateway status` reported running (PID 13).

The read-only model readiness check in hosted conversation `18acf56a7fea`
returned HTTP 402: out of AI credits. No credits were purchased and no provider
settings were changed. The library integration is installed and verified;
the final natural-language Telegram test remains outstanding. No Telegram
messages were sent during setup.

Owner clarified that the already-connected ChatGPT subscription in Hostinger
is the intended OpenAI connection. Selected GPT 5.6 Luna in that connection's
AI Model control. Verified `/data/config.yaml` now contains provider
`openai-codex` and model `gpt-5.6-luna`, with no explicit base URL, auxiliary
provider overrides, or fallback chain. No credentials were rotated or added.
A fresh conversation `f96ee5fbc57c` showed OpenAI Codex selected and successfully
read the installed skill, returning the correct trigger and private library
destination. The earlier Nexos-credit blocker is resolved through the owner's
connected ChatGPT account. A real Telegram-triggered push remains untested.

## Authorized real-file push · 5 September 2026

Uploaded the original Telegram attachment
`Organic-Utilities-Recording-Cards-v0.3-TELEPROMPTER.html` through the secure
upload client after explicit user authorization. Private item title:
Organic Utilities Recording Cards · v0.3 — Teleprompter.
Item ID: `4bb08fef-b80d-44e7-92e9-33ce584b7e99`.
Original and stored bytes match SHA-256
`4bb08fefb80d14e792e933ce584b7e991f906df66f4920608302a8136549b318`.
The original has five recording cards, 36 speaker turns, and 118 underlines.
It differs from the earlier archive-wrapped version, which was preserved.
Owner browser verification passed for the new library card and reader; the
reader iframe retains an empty sandbox and no-referrer policy. Anonymous
listing, list API, reader, and download requests redirect to Access; the
deployment-domain reader denies access. Original teleprompter scripting is
removed from the reading view; the authenticated original download is intact.
No public publication or Telegram message was performed.
