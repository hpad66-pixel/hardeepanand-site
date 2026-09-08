import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {readArticles,isVisible,renderMarkdown} from '../src/lib/content.js';
import {addTakeawayActions} from '../src/lib/takeaway-actions.js';
test('governance evidence uses distinct severity series and revised comparisons',()=>{
 const rows=readFileSync('public/images/articles/governance-at-operating-speed/disclosures.csv','utf8').trim().split('\n').slice(1).map(line=>{const [month,c,h]=line.split(',');return {month,c:+c,h:+h};});
 assert.equal(rows.length,55);assert.equal(rows.at(-1).month,'2026-07');
 assert.equal(rows.at(-1).c,606);assert.equal(rows.at(-1).h,1906);
 assert.equal(rows.at(-2).c+rows.at(-2).h,1549);
 const record=Math.max(...rows.filter(r=>r.month<'2026-04').map(r=>r.c+r.h));
 assert.equal(record,494);assert.equal(((rows.at(-2).c+rows.at(-2).h)/record).toFixed(1),'3.1');
 for(const variant of ['','-mobile']){
  const svg=readFileSync(`public/images/articles/governance-at-operating-speed/disclosures${variant}.svg`,'utf8');
  const lines=[...svg.matchAll(/<polyline points="([^"]+)"/g)];assert.equal(lines.length,2);
  for(const line of lines)assert.equal(line[1].split(' ').length,rows.length);
 }
});
test('new article remains draft-only and its takeaway export preserves action and urgency',{skip:!existsSync('content/author/2026/2026-09-07-governance-at-operating-speed.md')?'Private manuscript is kept outside the public repository':false},()=>{
 const post=readArticles(['author/2026']).find(p=>p.slug==='governance-at-operating-speed');assert(post);
 assert.equal(post.status,'DRAFT');assert.equal(isVisible(post.status,true),false);
 const body=addTakeawayActions(renderMarkdown(post.body),post.title,'https://hardeepanand.com/writing/governance-at-operating-speed/');
 const email=decodeURIComponent(body.match(/href="(mailto:\?subject=[^"]+)"/)[1]);
 assert.match(email,/Escalate active incidents immediately/);assert.match(email,/One Water AI Academy/);assert.match(email,/6\. Turn learning into something the team can use/);
});
