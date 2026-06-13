# hardeepanand-site

Public deploy mirror for **hardeepanand.com**. Holds only the buildable site and
PUBLISHED public-lane content. Never corpus, bible, drafts, or anything internal.

- The inline editor (behind Cloudflare Access) commits copy/content edits here via `/api/save`.
- On every push, GitHub Actions builds and deploys to the existing `hardeepanand`
  Cloudflare Pages project, so the custom domain is never disturbed.
