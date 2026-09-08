import test from 'node:test';
import assert from 'node:assert/strict';
import {listComments,postComment,readerIdentity} from '../src/server/comments.js';
test('public discussion recognizes all five published essays and excludes drafts',async()=>{
 const queried=[];
 const env={COMMENTS_ACCESS_AUD:'reader-only',ENGAGE:{list:async({prefix})=>{queried.push(prefix);return {keys:[],list_complete:true};}}};
 for(const slug of ['vital-signs','data-governance','fifty-steps-back','adapt-dont-pivot','in-your-head']){
  const response=await listComments({request:new Request(`https://hardeepanand.com/api/comments?article=${slug}`),env});
  assert.equal(response.status,200);assert(queried.includes(`comments/v1/${slug}/`));
 }
 assert.equal((await listComments({request:new Request('https://hardeepanand.com/api/comments?article=governance-at-operating-speed'),env})).status,404);
});
test('expanded comments retain the verified-reader boundary',async()=>{
 const env={COMMENTS_ACCESS_AUD:'reader-only',ACCESS_AUD:'private-studio',ENGAGE:{put:()=>{throw Error('Must not write');}}};
 const request=new Request('https://hardeepanand.com/community/comments',{method:'POST',headers:{Origin:'https://hardeepanand.com','Content-Type':'application/json'},body:JSON.stringify({article:'adapt-dont-pivot',name:'Reader',body:'Hello'})});
 assert.equal((await postComment({request,env})).status,401);
 assert.equal(await readerIdentity(request,{ACCESS_AUD:'private-studio'}),null);
});
