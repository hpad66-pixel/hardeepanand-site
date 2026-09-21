import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('phone figure labels retain the 16-unit floor needed at 320px', () => {
  const folders = ['data-governance','fifty-steps-back','adapt-dont-pivot','in-your-head','vital-signs/v3'];
  let checked = 0;
  for (const folder of folders) {
    const directory = path.join('public/images/articles',folder);
    for (const file of fs.readdirSync(directory).filter(file=>file.endsWith('-mobile.svg'))) {
      const source = fs.readFileSync(path.join(directory,file),'utf8');
      for (const [,size] of source.matchAll(/font-size="([\d.]+)"/g)) assert.ok(Number(size)>=16,`${folder}/${file}: ${size}`);
      checked++;
    }
  }
  assert.equal(checked,19);
});

test('case-studies redirects require a descendant and cannot redirect the index to itself', () => {
  const redirects = fs.readFileSync('public/_redirects','utf8');
  assert.doesNotMatch(redirects,/^\/case-studies\/\*\s+\/case-studies\//m);
  assert.match(redirects,/^\/case-studies\/:slug\s+\/case-studies\/\s+302$/m);
  assert.match(redirects,/^\/case-studies\/:slug\/\*\s+\/case-studies\/\s+302$/m);
});
