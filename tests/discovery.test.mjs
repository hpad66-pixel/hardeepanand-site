import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {readingLibrary} from '../src/lib/reading-library.js';
import {startHere,relatedReadings,visualIndex,selectDiscovery,discoveryView,readDiscoveryState,writeDiscoveryState} from '../src/lib/discovery.js';

test('all discovery routes and relationships resolve only inside the supplied public catalog',()=>{
 const posts=readingLibrary(true),allowed=new Set(posts.map(p=>p.href));
 assert(posts.length>=5);
 assert(posts.every(p=>p.status==='PUBLISHED'));
 for(const route of startHere(posts))assert(allowed.has(route.post.href));
 for(const post of posts)for(const related of relatedReadings(posts,post.slug)){
  assert(allowed.has(related.post.href));assert.notEqual(related.post.slug,post.slug);assert(related.reason.length>30);
 }
 assert.deepEqual(startHere([]),[]);assert.deepEqual(visualIndex([]),[]);assert.deepEqual(relatedReadings(posts,'private-slug'),[]);
 const trimmed=posts.filter(p=>p.slug!=='data-governance');
 assert(!startHere(trimmed).some(row=>row.post.slug==='data-governance'));
 assert(!relatedReadings(trimmed,'vital-signs').some(row=>row.post.slug==='data-governance'));
});
test('curated routes resolve current titles and takeaways, including incoming Nature',()=>{
 const post={slug:'nature-already-has-the-math',title:'Current source title',takeaway:'Current source takeaway',href:'/writing/nature-already-has-the-math/',topic:'Water & systems'};
 assert.equal(startHere([post])[0].post,post);
 assert.equal(startHere([post])[0].post.title,'Current source title');
});
test('visual index points to existing assets and exact authored or transformed figure anchors',()=>{
 const rows=visualIndex(readingLibrary(true));
 assert(rows.length>=4);
 for(const row of rows){
  assert(existsSync(new URL(`../public${row.image}`,import.meta.url)),row.image);
  if(row.mobileImage)assert(existsSync(new URL(`../public${row.mobileImage}`,import.meta.url)));
  assert.equal(row.href,`${row.post.href}#${row.anchor}`);
  if(row.post.slug==='data-governance'){
   const renderer=readFileSync(new URL('../src/lib/companion-articles.js',import.meta.url),'utf8');
   assert(renderer.includes('id="figure-${i}"'));assert.equal(row.anchor,'figure-1');
  }else if(row.post.slug==='nature-already-has-the-math'){
   const html=readFileSync(new URL('../src/assets/nature-already-has-the-math/article.html',import.meta.url),'utf8');
   assert(html.includes(`id="${row.anchor}"`));
  }else assert(row.post.body.includes(`id="${row.anchor}"`));
  assert(row.caption.length>30);
 }
});
test('future figures join from source metadata without invented assets or captions',()=>{
 const post={slug:'future',href:'/writing/future/',body:'<figure id="fig-feedback"><h3>Feedback</h3><img src="/images/feedback.png" alt="A loop"><figcaption>A conceptual feedback loop.</figcaption></figure>'};
 assert.equal(visualIndex([post])[0].href,'/writing/future/#fig-feedback');
 assert.equal(visualIndex([{...post,body:post.body.replace(/<figcaption>.*?<\/figcaption>/,'')}]).length,0);
 assert.equal(visualIndex([{...post,body:post.body.replace('/images/feedback.png','//external.test/feedback.png')}]).length,0);
});
test('hundreds of entries combine mode, topic, multiword search, clear, and progressive six',()=>{
 const entries=Array.from({length:203},(_,i)=>({id:`essay-${i}`,view:'all',topic:i%2?'Life & learning':'Water & systems',searchText:i%2?'Experience and learning':'Operating water curves'}));
 entries.push({id:'visual',view:'visual-index',topic:'Water & systems',searchText:'Operating water curves'});
 assert.equal(selectDiscovery(entries).total,203);
 assert.equal(selectDiscovery(entries).ids.length,6);
 assert.equal(selectDiscovery(entries,{limit:12}).ids.length,12);
 assert.equal(selectDiscovery(entries,{limit:210}).hasMore,false);
 assert.equal(selectDiscovery(entries,{topic:'Water & systems',query:'  WATER  CURVES  '}).total,102);
 assert.equal(selectDiscovery(entries,{topic:'Life & learning',query:'water'}).total,0);
 assert.equal(selectDiscovery(entries,{query:'unmatched'}).hasMore,false);
 assert.deepEqual(selectDiscovery(entries,{view:'visual-index'}).ids,['visual']);
 assert.equal(selectDiscovery(entries,{topic:'',query:''}).total,203);
 assert.deepEqual(selectDiscovery([]),{ids:[],total:0,hasMore:false});
});
test('mode URLs accept only supported modes',()=>{
 assert.equal(discoveryView('start-here'),'start-here');assert.equal(discoveryView('visual-index'),'visual-index');assert.equal(discoveryView('essays'),'all');assert.equal(discoveryView(null),'all');
});

test('discovery URL round-trips filters and expansion while validating external state',()=>{
 const topics=['AI & governance','Water & systems'];
 const state={view:'visual-index',topic:'AI & governance',query:'trace records',limit:12};
 const url=writeDiscoveryState(new URL('https://example.test/writing/?keep=yes#visual-index'),state);
 assert.deepEqual(readDiscoveryState(url,topics,20),state);
 assert.equal(url.searchParams.get('keep'),'yes');
 assert.equal(url.hash,'#visual-index');
 assert.deepEqual(readDiscoveryState(new URL('https://example.test/?topic=private&limit=Infinity&view=unknown'),topics),{view:'all',topic:'',query:'',limit:6});
 for(const limit of ['-1','1.5','nope','0'])assert.equal(readDiscoveryState(new URL(`https://example.test/?limit=${limit}`),topics).limit,6);
 assert.equal(readDiscoveryState(new URL('https://example.test/?limit=999999'),topics,9).limit,12);
 assert.equal(readDiscoveryState(new URL('https://example.test/?view=visual-index#start-here'),topics).view,'start-here');
 const cleared=writeDiscoveryState(url,{view:'all',topic:'',query:'',limit:6});
 for(const key of ['view','topic','q','limit'])assert.equal(cleared.searchParams.has(key),false);
});

test('legacy published pages build connected reading with public destinations and rationales', {
 skip: !existsSync(new URL('../dist/index.html',import.meta.url)) && 'Run npm run build to verify generated pages',
},()=>{
 const posts=readingLibrary(true);
 const paths=['writing/data-governance','writing/fifty-steps-back','climb/adapt-dont-pivot','climb/in-your-head'];
 for(const path of paths){
  const html=readFileSync(new URL(`../dist/${path}/index.html`,import.meta.url),'utf8');
  const section=html.match(/<aside\b[^>]*aria-label="Connected reading"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
  assert(section,`Missing related reading on /${path}/`);
  const expected=relatedReadings(posts,path.split('/').at(-1));
  assert(expected.length>0);
  for(const {post,reason} of expected){
   assert(section.includes(`href="${post.href}"`),post.href);
   assert(section.includes(reason),`Missing rationale on /${path}/`);
  }
  for(const [,href] of section.matchAll(/href="([^"]+)"/g))assert(posts.some(post=>post.href===href),href);
 }
});
