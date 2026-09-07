# Hardeep's Telegram → private library connection

This package is installed in the **hosted Hermes instance that runs Droobi**.
Installing it in the Mac's separate Hermes app does not connect Telegram.

## Install

Copy this folder into `$HERMES_HOME/skills/telegram-private-library/` (normally
`~/.hermes/skills/telegram-private-library/`). The folder must contain SKILL.md
and scripts/push_html.py. The client uses Python 3 standard-library modules.

In Hostinger's hosted Hermes Environment settings, add `HA_LIBRARY_PUSH_TOKEN`
using the privately generated credential. Keep it in the runtime environment,
not SKILL.md, source control, a Telegram message, or model-visible instructions.
Restart/reload the hosted runtime after preserving its existing settings.
Keep its existing Telegram sender allowlist intact. Confirm the skill appears
in Hermes's skill list and run the preflight command before a real push.

## User workflow

Generate an HTML document in the Telegram conversation, review it, and say
**push it** (preferably replying to that document). Hermes resolves the file,
runs its preflight, then calls the script with `--push` and replies with the
private URL after the server confirms the stored SHA-256. If the reference is
ambiguous, Hermes asks which document rather than selecting an unrelated file.

Identical HTML gets the same ID across retries. New HTML gets a new ID. The token
cannot list, read, delete, or overwrite library documents, edit site copy,
deploy the site, change DNS, or access GitHub. Document viewing remains behind
Cloudflare Access and the exact owner identity.

## Server administration

Endpoint: `POST https://hardeepanand.com/integrations/library/push`
Credential header: `Authorization: Bearer <upload token>`
Form fields: file (.html, up to 5 MB), title, summary, tags (comma-separated).
The server stores only a SHA-256 verifier in the Cloudflare Pages encrypted
secret `LIBRARY_PUSH_TOKEN_SHA256`. The full token belongs only in the hosted
Hermes environment and the owner's private local credential file.

To rotate, generate a fresh 32-byte random token with prefix `ha_push_`, update
its SHA-256 verifier with Wrangler, update the hosted environment, and redeploy
Pages. To revoke, remove the Pages secret and redeploy, then remove retained Pages
deployments that contain the previous verifier. Deployment snapshots preserve
their original secrets; updating production alone does not revoke old snapshots.
Preview branches do not have this production secret and deny uploads by default.
The existing site and private reader auth must remain enabled.

A model-provider authentication error in Hermes is separate from this upload
connection. The model must be healthy to interpret the user's natural-language
request; do not report Telegram integration working until a hosted-runtime
request and its result have been verified.
