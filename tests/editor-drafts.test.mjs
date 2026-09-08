import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDraft,validArticlePath,draftKey} from '../src/editor/draft-schema.js';
import {editorDraftRequest} from '../src/server/editor-drafts.js';
const sample={schema:1,articlePath:'/writing/vital-signs/',baseFingerprint:'a'.repeat(64),revision:null,changes:[{id:'t0',text:'A clearer title'},{id:'s12',text:'A clearer label',dx:10,dy:-5,scale:1.1,fill:'#174bc5',fontSize:18}]};
const request=(method='PUT',body=sample,origin='https://hardeepanand.com')=>new Request('https://hardeepanand.com/api/editor/drafts?article=%2Fwriting%2Fvital-signs%2F',{method,headers:{Origin:origin,'Content-Type':'application/json'},...(method==='PUT'?{body:JSON.stringify(body)}:{})});
function storage(){const records=new Map();let version=0;return {records,env:{IDEAS_OWNER_EMAIL:'hardeep@apas.ai',IDEAS:{get:async key=>records.has(key)?{etag:records.get(key).etag,json:async()=>JSON.parse(records.get(key).value)}:null,put:async(key,value,{onlyIf})=>{const old=records.get(key);if(onlyIf.etagDoesNotMatch==='*'&&old||onlyIf.etagMatches&&old?.etag!==onlyIf.etagMatches)return null;records.set(key,{value,etag:String(++version)});return {etag:String(version)};}}}};}
test('draft schema rejects active content, traversal, malformed transforms and duplicate targets',()=>{
 assert(validArticlePath('/climb/adapt-dont-pivot/'));assert(!validArticlePath('/writing/../../admin/'));
 assert.equal(draftKey('/climb/adapt-dont-pivot/'),'visual-drafts/v1/climb--adapt-dont-pivot.json');
 for(const change of [{id:'s0',fill:'url(https://evil.example)'},{id:'s0',scale:0},{id:'s0',fontSize:900},{id:'s0',dx:Infinity}])assert.throws(()=>validateDraft({...sample,changes:[change]}));
 assert.throws(()=>validateDraft({...sample,changes:[sample.changes[0],sample.changes[0]]}));
 assert.deepEqual(validateDraft({...sample,changes:[{id:'s0',onclick:'alert(1)',html:'<script/>',dx:5}]}).changes,[{id:'s0',dx:5}]);
 assert.equal(validateDraft({...sample,changes:[{id:'t0',text:'<script>alert(1)</script>'}]}).changes[0].text,'<script>alert(1)</script>'); // applied only as textContent
});
test('remote draft access fails closed and requires owner identity plus same-origin saves',async()=>{
 const {env,records}=storage();assert.equal((await editorDraftRequest({request:request('GET'),env})).status,403);
 assert.equal((await editorDraftRequest({request:request(),env:{...env,IDEAS_OWNER_EMAIL:undefined}},async()=>true)).status,403);
 assert.equal((await editorDraftRequest({request:request('PUT',sample,'https://evil.example'),env},async(req,options)=>{assert.equal(options.ALLOWED_EMAIL,'hardeep@apas.ai');return true;})).status,403);
 assert.equal(records.size,0);
});
test('saved text and SVG edits survive loading and stale revisions cannot overwrite them',async()=>{
 const {env}=storage(),allowed=async()=>true;
 const first=await (await editorDraftRequest({request:request(),env},allowed)).json();
 assert(first.draft.revision);assert.equal(first.draft.changes[1].dx,10);
 const read=await(await editorDraftRequest({request:request('GET'),env},allowed)).json();assert.deepEqual(read.draft,first.draft);
 assert.equal((await editorDraftRequest({request:request(),env},allowed)).status,409);
 const next=await(await editorDraftRequest({request:request('PUT',{...sample,revision:first.draft.revision,changes:[]}),env},allowed)).json();
 assert.notEqual(next.draft.revision,first.draft.revision);assert.deepEqual(next.draft.changes,[]);
});
test('mismatched paths and oversized drafts never reach storage',async()=>{
 const {env,records}=storage();const allowed=async()=>true;
 assert.equal((await editorDraftRequest({request:request('PUT',{...sample,articlePath:'/climb/adapt-dont-pivot/'}),env},allowed)).status,400);
 assert.equal((await editorDraftRequest({request:request('PUT',{...sample,changes:[{id:'t0',text:'x'.repeat(520000)}]}),env},allowed)).status,413);
 assert.equal(records.size,0);
});
test('real R2 conditional writes reject concurrent visual draft saves',async()=>{
 const {Miniflare}=await import('miniflare'),{build}=await import('esbuild');
 const bundled=await build({stdin:{contents:"import {editorDraftRequest} from './src/server/editor-drafts.js'; export default {fetch(request,env){return editorDraftRequest({request,env},async()=>true);}}",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'neutral'});
 const mf=new Miniflare({compatibilityDate:'2025-06-01',modules:true,script:bundled.outputFiles[0].text,r2Buckets:['IDEAS'],bindings:{IDEAS_OWNER_EMAIL:'owner@example.com'}});
 const dispatch=async body=>{const req=request('PUT',body);return mf.dispatchFetch(req.url,{method:req.method,headers:Object.fromEntries(req.headers),body:await req.arrayBuffer()});};
 try{
  const initial=await Promise.all([dispatch(sample),dispatch(sample)]);assert.deepEqual(initial.map(r=>r.status).sort(),[200,409]);
  const first=await initial.find(r=>r.status===200).json();
  const next={...sample,revision:first.draft.revision,changes:[{id:'t0',text:'Latest revision'}]};
  const competing=await Promise.all([dispatch(next),dispatch(next)]);assert.deepEqual(competing.map(r=>r.status).sort(),[200,409]);
  const bucket=await mf.getR2Bucket('IDEAS'),saved=await(await bucket.get(draftKey(sample.articlePath))).json();assert.equal(saved.changes[0].text,'Latest revision');
 }finally{await mf.dispose();}
});
