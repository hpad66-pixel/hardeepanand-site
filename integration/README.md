# Approved public imports

This repository is a public author-site deploy mirror. It accepts only approved public release packages
from One Water OS or the Hardeep Author Studio. It never reads a source repository, raw transcript, private
wiki page, internal graph, or unpublished draft during a public build.

Use `scripts/import-release-package.mjs` to place one approved public article in the appropriate content
collection. The importer records source repository, source commit, canonical URL, status, and approval in
the Markdown frontmatter. The Writing pages render these imported collections alongside local published work.

```text
node scripts/import-release-package.mjs --package /path/to/public-release.json
```

Only `visibility: public`, `status: APPROVED|PUBLISHED`, and `content_type: article` are accepted in this
first integration pass. Other public package types will get dedicated pages after their presentation and
metadata contract is approved.
