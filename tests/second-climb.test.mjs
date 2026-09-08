import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { illustrateSecondClimb } from '../src/lib/second-climb.js';
const posts=JSON.parse(fs.readFileSync('content/published-pages.json','utf8'));
test('Second Climb illustrations preserve prose, retain unique SVG IDs, and share the right publication',()=>{
 for(const post of posts.filter(p=>p.path.startsWith('climb/'))){
  const html=illustrateSecondClimb(post);
  assert.equal((html.match(/class="diagram-stage"/g)||[]).length,2);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  const retained=html.replace(/<figure\b[\s\S]*?<\/figure>/g,'').replace(/<section class="article-takeaways"[\s\S]*?<\/section>/,'').replaceAll('<span class="pq-mark" aria-hidden="true">“</span>','').replaceAll('<span class="pq-name">Hardeep Anand</span><span class="pq-publication">The Systems Lens</span>','Hardeep Anand');
  assert.equal(retained,post.body);
  const mail=decodeURIComponent(html.match(/href="(mailto:[^"]+)"/)[1]);assert.match(mail,/The Systems Lens/);assert.doesNotMatch(mail,/The Second Climb/);
 }
});
