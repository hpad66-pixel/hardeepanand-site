# Visual article studio

Open a local article and select **Edit this article**, or go to `/admin/#content` and choose **Edit visually**. The URL ends in `?edit=1`.

## Controls

- Click the title, article prose, figure heading/caption, or takeaway text and type. Existing emphasis and links remain in place; editing is plain text within each styled passage.
- Click an SVG label or shape. Change its label, fill/stroke, text size, scale, or position in the Diagram Studio. Drag on the canvas, or use arrow keys (Shift for larger moves). **Select parent group** moves a set together. **Reset element** restores its source appearance.
- **Undo / Redo** cover this editing session. **Save draft** (Cmd/Ctrl+S) persists the text and SVG edits. Reloading the editor restores the saved draft.
- **Preview** shows the draft without editing outlines and resumes article animations. **Resume editing** brings the controls back.
- **Download SVG** exports the selected diagram with resolved theme colors and a static reading. **Export draft** downloads the full structured change document as a backup.

Desktop and phone illustrations may be different SVGs. Editing one does not automatically rewrite the other. Check both, especially after changing labels or positions. The editor changes existing text and diagram elements; it does not yet insert new article sections, redraw paths, or reroute connectors automatically. Shared APAS forms, navigation, and site settings remain outside the article editor.

## Storage and access

Local Astro development saves to `content/editor-drafts/<collection>--<slug>.json`. This directory is ignored by Git and never copied into public assets. Keep a backup using Export draft. Local write requests require the loopback host and matching origin.

The production adapter saves under `visual-drafts/v1/` in the private `IDEAS` R2 bucket. It requires a valid Cloudflare Access JWT for `IDEAS_OWNER_EMAIL`, even if the endpoint is reached directly. Do not bypass Access for `/api/editor/drafts`. Deployed to https://hardeepanand.com on September 8, 2026. Open `/admin/#content`, sign in as `hardeep@apas.ai`, and select **Edit visually**. Production requests without a session redirect to Cloudflare Access; authenticated save/reload verification is pending the owner’s renewed sign-in. Local save/reload and real R2 conditional-write tests pass.

Saves are explicit, not automatic. Unsaved edits prompt before leaving. If another tab saves first, the older tab cannot overwrite it: export its draft as a backup, then close/reopen or reload to retrieve the latest saved copy. R2 writes also use conditional ETags so simultaneous requests cannot both win.

A fingerprint ties each change to the source version and target list. If article markup or source text changes, the editor blocks applying the old draft. Export that draft and reconcile its edits against the new source; do not clear it without preserving the writer’s work. Only text and bounded SVG properties are accepted—never arbitrary HTML, scripts, SVG event handlers, or external references.

## From saved draft to publication

Save draft does not change public HTML or canonical source. Review the saved draft together, then apply approved text and SVG changes to the Markdown/JSON/component/generator sources. Regenerate title metadata, takeaway email content, figures, static exports, feeds, and derived assets as relevant. Shared promotional forms and email/share links still refer to the source article until that publication step. Verify typography, citations, desktop/phone composition, animation, and the build/tests/link checks. Publish only the reviewed release with Hardeep’s publication approval. Preserve the exported draft when reconciling or retiring it.

## Verification

Browser checks cover in-place text editing, SVG label/font/color edits, dragging, undo, save/reload persistence, and competing-tab conflict rejection. Automated tests cover schema bounds, owner authorization, same-origin writes, request size, stale revisions, and simultaneous saves against the real local R2 runtime.

## September 8 release verification

All 45 local tests passed; 18 production pages, internal links/assets, five feed entries, and sitemap exclusions verified. Live homepage and published article routes return 200 with the new editor included; the unpublished governance article returns 404. CRM inquiry and subscription readiness endpoints return `ready: true`. Both studio and draft API requests without a session redirect to Access. The repository is public, so unpublished author manuscripts, research notes, and private visual draft files are excluded from Git.
