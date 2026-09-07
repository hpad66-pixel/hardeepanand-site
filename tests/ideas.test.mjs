import test from 'node:test';
import assert from 'node:assert/strict';
import {ideaMetadata,validIdeaId} from '../src/server/ideas.js';
import {onRequest as gate} from '../functions/_middleware.js';
import {onRequest as api} from '../functions/admin/ideas/api.js';
test('private library and its file endpoints deny unauthenticated requests',async()=>{
 for(const path of ['/admin/ideas/','/admin/ideas/api','/admin/ideas/9762e47a-bc46-4985-a612-239fbcd60583?download=1']){
  let called=false;const result=await gate({request:new Request('https://hardeepanand.com'+path),env:{IDEAS_OWNER_EMAIL:'hardeep@apas.ai'},next(){called=true;}});
  assert.equal(result.status,403);assert.equal(called,false);assert.match(result.headers.get('cache-control'),/no-store/);
 }
});
test('missing owner configuration fails closed',async()=>assert.equal((await gate({request:new Request('https://hardeepanand.com/admin/ideas/'),env:{},next(){throw Error('must not open');}})).status,403));
test('metadata is bounded and duplicate tags are normalized',()=>{const form=new FormData();form.set('title','My idea');form.set('tags','water, water, AI');assert.deepEqual(JSON.parse(ideaMetadata(form).tags),['water','AI']);form.set('title','a'.repeat(141));assert.throws(()=>ideaMetadata(form));});
test('only UUID object IDs can reach storage',()=>{assert.equal(validIdeaId('../secrets'),false);assert.equal(validIdeaId('9762e47a-bc46-4985-a612-239fbcd60583'),true);});
test('cross-origin upload cannot write storage',async()=>{const result=await api({request:new Request('https://hardeepanand.com/admin/ideas/api',{method:'POST',headers:{origin:'https://other.example'}}),env:{IDEAS:{put(){throw Error('must not write');}}}});assert.equal(result.status,403);});
test('upload stores original HTML privately and creates separate metadata',async()=>{const form=new FormData();form.set('title','Test idea');form.set('file',new Blob(['<!doctype html><h1>Private test</h1>'],{type:'text/html'}),'test.html');let stored;
 const result=await api({request:new Request('https://hardeepanand.com/admin/ideas/api',{method:'POST',headers:{origin:'https://hardeepanand.com'},body:form}),env:{IDEAS:{async put(...args){stored=args;}}}});assert.equal(result.status,201);assert.match(stored[0],/^ideas\/[0-9a-f-]+\.html$/);assert.equal(stored[2].customMetadata.title,'Test idea');assert.match(new TextDecoder().decode(stored[1]),/Private test/);});
