// Curate questions and relationships; article metadata always comes from the gated catalog.
const routes = [
 {id:'operating-evidence',question:'How do we know an investment actually helped?',slug:'vital-signs',reason:'Connect capital decisions to the operating curve and the evidence behind it.'},
 {id:'trusted-data',question:'Can our team trace the data behind a decision?',slug:'data-governance',reason:'Follow the route from a shared record to its meaning, owner, and history.'},
 {id:'ai-readiness',question:'Where should we begin with AI?',slug:'fifty-steps-back',reason:'Start with the identities and operating knowledge a useful pilot needs.'},
 {id:'natural-systems',question:'What can water teach us about connected systems?',slug:'nature-already-has-the-math',reason:'Follow connections across water, living systems, and the questions we bring to AI.'},
 {id:'continuous-learning',question:'How can we grow without discarding our experience?',slug:'adapt-dont-pivot',reason:'Bring lived experience and new tools into the same working practice.'},
 {id:'next-step',question:'How do we turn a circling thought into action?',slug:'in-your-head',reason:'Find a manageable next step and a clear sense of done.'},
];
const connections = [
 ['vital-signs','data-governance','An operating curve is only useful when we can trace the records behind it.'],
 ['data-governance','fifty-steps-back','Shared meaning and verified asset identities give an AI pilot a foundation to test.'],
 ['fifty-steps-back','adapt-dont-pivot','Learning new tools works better when it builds on the knowledge people already carry.'],
 ['adapt-dont-pivot','in-your-head','Continuous learning becomes practical through a manageable next action.'],
 ['nature-already-has-the-math','vital-signs','Follow the systems argument into operating feedback and the question of what changed.'],
 ['nature-already-has-the-math','data-governance','Connected systems need records whose meaning, ownership, and history remain visible.'],
];
export function startHere(posts) {
 return routes.flatMap(route=>{const post=posts.find(p=>p.slug===route.slug);return post?[{...route,post}]:[];});
}
export function relatedReadings(posts,slug,limit=2) {
 const current=posts.find(p=>p.slug===slug);
 if(!current)return [];
 const related=connections.flatMap(([a,b,reason])=>{
  const other=a===slug?b:b===slug?a:null;
  const post=other&&posts.find(p=>p.slug===other);
  return post?[{post,reason}]:[];
 });
 for(const post of posts){
  if(post.slug!==slug&&post.topic===current.topic&&!related.some(r=>r.post.slug===post.slug))
   related.push({post,reason:`Another perspective on ${current.topic.toLowerCase()}: ${post.takeaway}`});
 }
 return related.slice(0,limit);
}
const visualSeeds = [
 {slug:'vital-signs',anchor:'figure-1',title:'From snapshot to operating curve',image:'/images/articles/vital-signs/v3/01-snapshot-to-curve.png',caption:'Conceptual comparison: a snapshot shows a moment; a curve shows how conditions change.'},
 {slug:'vital-signs',anchor:'figure-2',title:'Close the operating feedback loop',image:'/images/articles/vital-signs/v3/02-feedback-loop.png',caption:'Conceptual feedback loop linking observation, decisions, action, and learning.'},
 {slug:'vital-signs',anchor:'figure-3',title:'Test what changed after the investment',image:'/images/articles/vital-signs/v3/03-curve-test.png',caption:'Illustrative curves, not measured outcomes. A change after an intervention does not establish its cause.'},
 {slug:'data-governance',anchor:'figure-1',title:'Make knowledge discoverable',image:'/images/articles/data-governance/1.svg',mobileImage:'/images/articles/data-governance/1-mobile.svg',caption:'A conceptual route from a question to a shared catalog and an accountable owner.'},
 ...[
  ['fig-hydrologic','The water cycle is already a connected system','A simplified cycle, not a complete flow model; actual sources and return pathways vary.'],
  ['fig-storm','One storm becomes many utility consequences','Conceptual pathways. Runoff can enter combined sewers or sanitary sewers through inflow defects; separate storm drains do not normally flow to the wastewater plant.'],
  ['fig-algae','A fish kill can be the visible end of a longer chain','Possible pathways, not a diagnosis of a particular bloom or fish kill.'],
  ['fig-ai-test','The answer is not trusted until the relationships survive','An evaluation framework, not a measured comparison of AI products. Sources need validation, and people retain the decision.'],
  ['fig-framework','The Systems Lens for utility AI','A conceptual loop of responsibilities and feedback, not automatic causation or guaranteed trust.'],
 ].map(([anchor,title,caption])=>({slug:'nature-already-has-the-math',anchor,title,caption,image:`/images/articles/nature-already-has-the-math/${anchor}.png`,mobileImage:`/images/articles/nature-already-has-the-math/${anchor}-mobile.png`})),
];
export function visualIndex(posts) {
 const rows=visualSeeds.flatMap(row=>{const post=posts.find(p=>p.slug===row.slug);return post?[{...row,post,href:`${post.href}#${row.anchor}`}]:[];});
 // New authored figures join through their own id, image, and caption. Inline-only
 // figures remain in the essay until an index preview asset is supplied.
 for(const post of posts){
  if(visualSeeds.some(row=>row.slug===post.slug))continue;
  for(const match of (post.body||'').matchAll(/<figure\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/figure>/gi)){
   const [,anchor,body]=match;
   if(rows.some(row=>row.post.slug===post.slug&&row.anchor===anchor))continue;
   const image=body.match(/<img\b[^>]*\bsrc=["'](\/[^"']+\.(?:png|webp|jpg|svg))["']/i)?.[1];
   const caption=plainText(body.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]||'');
   const title=plainText(body.match(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/i)?.[1]||body.match(/<img\b[^>]*\balt=["']([^"']+)["']/i)?.[1]||'');
   if(image&&!image.startsWith('//')&&caption&&title)rows.push({slug:post.slug,anchor,title,image,caption,post,href:`${post.href}#${anchor}`});
  }
 }
 return rows;
}
export function plainText(value) {return String(value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
export function selectDiscovery(entries,{view='all',topic='',query='',limit=6}={}) {
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matched=entries.filter(entry=>entry.view===view&&(!topic||entry.topic===topic)&&words.every(word=>entry.searchText.toLocaleLowerCase().includes(word)));
 const count=Math.max(1,Math.floor(Number(limit))||6);
 return {ids:matched.slice(0,count).map(entry=>entry.id),total:matched.length,hasMore:matched.length>count};
}
export function discoveryView(value) {return ['start-here','visual-index'].includes(value)?value:'all';}

export function readDiscoveryState(url,topics,maxEntries=600) {
 const params=url.searchParams;
 const requested=Number(params.get('limit'));
 const ceiling=Math.max(6,Math.ceil(maxEntries/6)*6);
 return {
  view:discoveryView(['#essays','#start-here','#visual-index'].includes(url.hash)?url.hash.slice(1):params.get('view')),
  topic:topics.includes(params.get('topic'))?params.get('topic'):'',
  query:(params.get('q')||'').slice(0,300),
  limit:Number.isSafeInteger(requested)&&requested>=6?Math.min(ceiling,Math.ceil(requested/6)*6):6,
 };
}
export function writeDiscoveryState(url,state) {
 const next=new URL(url);
 for(const [key,value] of [['view',state.view==='all'?'':state.view],['topic',state.topic],['q',state.query],['limit',state.limit>6?String(state.limit):'']]){
  if(value)next.searchParams.set(key,value);else next.searchParams.delete(key);
 }
 return next;
}
