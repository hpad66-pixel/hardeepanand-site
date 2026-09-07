import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('companion SVGs retain accessible static readings and unique responsive identities', () => {
  const ids=new Set();
  for(const slug of ['data-governance','fifty-steps-back']) {
    for(let i=1;i<=5;i++) for(const suffix of ['', '-mobile']) {
      const svg=fs.readFileSync(`public/images/articles/${slug}/${i}${suffix}.svg`,'utf8');
      const local=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      for(const id of local){assert.ok(!ids.has(id),`duplicate ${id}`);ids.add(id);}
      const labelled=svg.match(/aria-labelledby="([^"]+)"/)[1].split(' ');
      labelled.forEach(id=>assert.ok(local.includes(id)));
      assert.match(svg,/prefers-reduced-motion:reduce/);
      assert.match(svg,/class="vs-motion sl-(?:flow|reveal)"/);
      assert.doesNotMatch(svg,/fill="#[0-9a-fA-F]+"/);
      assert.doesNotMatch(svg,/infinite/);
    }
  }
});
