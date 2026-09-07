import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {build} from 'esbuild';
import {handleLibraryPush,sha256,verifyPushToken} from '../src/server/library-push.js';
const token='ha_push_'+'a'.repeat(43);
const hash=await sha256(token);
const origin='https://hardeepanand.com/integrations/library/push';
function request(html='<h1>A synthetic test</h1>',title='Synthetic test',headers={}){
 const body=new FormData();body.set('title',title);body.set('file',new Blob([html],{type:'text/html'}),'test.html');
 return new Request(origin,{method:'POST',body,headers:{Authorization:`Bearer ${token}`,...headers}});
}
test('upload token rejects missing and wrong credentials without accessing storage',async()=>{
 const env={LIBRARY_PUSH_TOKEN_SHA256:hash,IDEAS_OWNER_EMAIL:'owner@example.com',IDEAS:{head(){throw Error('must not read');}}};
 for(const Authorization of ['',`Bearer ha_push_${'b'.repeat(43)}`])assert.equal((await handleLibraryPush({request:request(undefined,undefined,{Authorization}),env})).status,401);
 assert.equal(await verifyPushToken(request(),undefined),false);
});
test('machine token cannot list, delete, or issue browser uploads',async()=>{
 const env={LIBRARY_PUSH_TOKEN_SHA256:hash,IDEAS_OWNER_EMAIL:'owner@example.com',IDEAS:{}};
 for(const method of ['GET','DELETE','PUT'])assert.equal((await handleLibraryPush({request:new Request(origin,{method,headers:{Authorization:`Bearer ${token}`}}),env})).status,405);
 assert.equal((await handleLibraryPush({request:request(undefined,undefined,{Origin:'https://other.example'}),env})).status,403);
});
test('upload configuration fails closed',async()=>{
 assert.equal((await handleLibraryPush({request:request(),env:{}})).status,503);
});
test('oversized requests and invalid metadata are rejected',async()=>{
 const env={LIBRARY_PUSH_TOKEN_SHA256:hash,IDEAS_OWNER_EMAIL:'owner@example.com',IDEAS:{}};
 assert.equal((await handleLibraryPush({request:request(undefined,undefined,{'Content-Length':String(6*1024*1024)}),env})).status,413);
 assert.equal((await handleLibraryPush({request:request(undefined,''),env})).status,400);
});
test('real R2 runtime stores originals, deduplicates concurrent retries, and versions changed HTML',async()=>{
 const bundled=await build({stdin:{contents:"import {handleLibraryPush} from './src/server/library-push.js'; export default {fetch(request,env){return handleLibraryPush({request,env});}}",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'neutral'});
 const mf=new Miniflare({compatibilityDate:'2025-06-01',modules:true,script:bundled.outputFiles[0].text,r2Buckets:['IDEAS'],bindings:{LIBRARY_PUSH_TOKEN_SHA256:hash,IDEAS_OWNER_EMAIL:'owner@example.com'}});
 const dispatch=async req=>mf.dispatchFetch(req.url,{method:req.method,headers:Object.fromEntries(req.headers),body:await req.arrayBuffer()});
 try {
  const responses=await Promise.all([dispatch(request()),dispatch(request())]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,201],JSON.stringify(await Promise.all(responses.map(r=>r.clone().json()))));
  const data=await Promise.all(responses.map(r=>r.json()));assert.equal(data[0].id,data[1].id);
  const bucket=await mf.getR2Bucket('IDEAS');const list=await bucket.list();assert.equal(list.objects.length,1);
  assert.equal(await (await bucket.get(list.objects[0].key)).text(),'<h1>A synthetic test</h1>');
  const retry=await dispatch(request(undefined,'Changed metadata'));assert.equal((await retry.json()).duplicate,true);
  const object=await bucket.head(list.objects[0].key);assert.equal(object.customMetadata.title,'Synthetic test');
  const changed=await dispatch(request('<h1>Revised test</h1>'));assert.equal(changed.status,201);assert.equal((await bucket.list()).objects.length,2);
 } finally {await mf.dispose();}
});
