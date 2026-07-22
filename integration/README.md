# Approved public imports

This repository is a public author-site deploy mirror. It accepts only approved public release packages
from One Water OS or the Hardeep Author Studio. It never reads a source repository, raw transcript, private
wiki page, internal graph, or unpublished draft during a public build.

Use `scripts/import-release-package.mjs` to place one approved public Water or Bubble article in the appropriate content
collection. The importer records source repository, source commit, canonical URL, status, and approval in
the Markdown frontmatter. The Writing pages render these imported collections alongside local published work.

```text
node scripts/import-release-package.mjs --package /path/to/public-release.json
```

Only `visibility: public`, `status: APPROVED|PUBLISHED`, and `content_type: article` are accepted in this
first integration pass. Other public package types will get dedicated pages after their presentation and
metadata contract is approved.

## Automated OWOS intake

One Water OS sends an approved article only after Hardeep explicitly chooses **Send to public-site review**.
The `owos_public_release` repository dispatch starts `.github/workflows/owos-public-release-intake.yml`.
That workflow validates the package, imports the article, builds the site, and opens a pull request. It never
merges or publishes the article automatically.

The Cloudflare secret used by OWOS must be a fine-grained GitHub token restricted to these repositories:

- `hpad66-pixel/2-brain`
- `hpad66-pixel/hardeep-soul`
- `hpad66-pixel/hardeepanand-site`

The token needs only **Contents: Read and write**. The workflow uses its own short-lived GitHub Actions token
to create the publication pull request.
