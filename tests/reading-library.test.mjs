import test from 'node:test';
import assert from 'node:assert/strict';
import {isVisible} from '../src/lib/content.js';
import { readingLibrary } from '../src/lib/reading-library.js';
import { GET as rss } from '../src/pages/rss.xml.js';

test('one library preserves existing URLs and includes the preview draft without publishing it',()=>{
 const preview=readingLibrary(false),production=readingLibrary(true);
 assert.equal(new Set(preview.map(p=>p.href)).size,preview.length);
 for(const href of ['/climb/adapt-dont-pivot/','/climb/in-your-head/','/writing/vital-signs/','/writing/data-governance/','/writing/fifty-steps-back/'])assert(production.some(p=>p.href===href));
 assert.equal(isVisible('DRAFT',false),true);
 assert.equal(isVisible('DRAFT',true),false);
 assert.equal(isVisible('APPROVED',true),false);
 assert(!production.some(p=>p.status!=='PUBLISHED'));
 assert(!production.some(p=>p.slug==='governance-at-operating-speed'));
 for(const p of preview){assert(p.takeaway);assert(p.readMin>0);}
});
test('RSS includes the formerly separate personal essays and excludes drafts',async()=>{
 const xml=await rss({site:new URL('https://hardeepanand.com/')}).text();
 for(const p of readingLibrary(true))assert(xml.includes(`<link>https://hardeepanand.com${p.href}</link>`));
 assert(!xml.includes('governance-at-operating-speed'));
 assert(!xml.includes('The Second Climb'));
});

import {selectReadings} from '../src/lib/reading-selection.js';
test('reading room handles an empty archive and a large growing archive',()=>{
 assert.deepEqual(selectReadings([]),{ids:[],total:0,hasMore:false});
 const entries=Array.from({length:103},(_,i)=>({id:String(i),topic:i%2?'Life & learning':'Water & systems',searchText:`Essay ${i} ${i%2?'continuous learning':'water infrastructure'}`}));
 assert.deepEqual(selectReadings(entries).ids,['0','1','2','3','4','5']);
 assert.equal(selectReadings(entries).hasMore,true);
 assert.equal(selectReadings(entries,{limit:108}).ids.length,103);
 assert.equal(selectReadings(entries,{limit:108}).hasMore,false);
 assert.equal(selectReadings(entries,{topic:'Life & learning',query:'continuous learning',limit:100}).total,51);
 assert.equal(selectReadings(entries,{topic:'Water & systems',query:'continuous'}).total,0);
 assert.equal(selectReadings(entries,{query:'  WATER   infrastructure '}).total,52);
 assert.equal(selectReadings(entries,{query:'nonexistent'}).hasMore,false);
});
