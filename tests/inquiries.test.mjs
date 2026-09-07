import test from 'node:test';
import assert from 'node:assert/strict';
import {submitInquiry,inquiryStatus} from '../src/server/inquiries.js';
const data={id:'21a073c6-8ecb-4d91-96ca-526bf0891ffb',name:'Integration test',email:'test@example.com',company:'Example',message:'A test inquiry',consent:true,articlePath:'/writing/fifty-steps-back/'};
function setup(){const stored=new Map(),kv=new Map();return {stored,env:{IDEAS:{get:async k=>stored.has(k)?{json:async()=>JSON.parse(stored.get(k))}:null,put:async(k,v,o)=>{if(o?.onlyIf&&stored.has(k))return null;stored.set(k,v);return {etag:'test'};}},ENGAGE:{get:async k=>kv.get(k),put:async(k,v)=>kv.set(k,v)},APAS_CRM_API_KEY:'server-secret',APAS_ORGANIZATION_ID:'org-test',APAS_SITE_ID:'site-test',CF_ACCESS_CLIENT_ID:'access-id',CF_ACCESS_CLIENT_SECRET:'access-secret'}};}
const req=(body=data,origin='https://hardeepanand.com')=>new Request('https://hardeepanand.com/api/inquiries',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('unconfigured form and invalid submissions cannot reach CRM',async()=>{
 assert.equal((await inquiryStatus({env:{}}).json()).ready,false);
 const {env,stored}=setup();let called=0;const fetcher=()=>{called++;throw Error();};
 for(const [body,origin,status] of [[data,'https://evil.example',403],[{...data,consent:false},undefined,400],[null,undefined,400],[{...data,message:'x'.repeat(17000)},undefined,413]])assert.equal((await submitInquiry({request:req(body,origin),env},fetcher)).status,status);
 assert.equal(called,0);assert.equal(stored.size,0);
});
test('inquiries are saved before delivery, retain source and consent, and replay safely',async()=>{
 const {env,stored}=setup();let calls=0;
 const fetcher=async(url,options)=>{calls++;assert.equal(stored.size,1);assert.equal(url,'https://apascrm.com/api/v1/partner/contact-candidates');assert.equal(options.redirect,'manual');const body=JSON.parse(options.body);assert.equal(body.context.siteId,'site-test');assert.equal(body.metadata.articleUrl,'https://hardeepanand.com/writing/fifty-steps-back/');assert.equal(body.consent.recorded,true);return new Response(JSON.stringify({data:{candidateId:'candidate-test'}}),{status:202});};
 assert.equal((await submitInquiry({env,request:req()},fetcher)).status,202);
 assert.equal((await submitInquiry({env,request:req()},fetcher)).status,202);assert.equal(calls,1);
 assert.equal((await submitInquiry({env,request:req({...data,message:'changed'})},fetcher)).status,409);
});
test('CRM redirects do not produce success and saved notes can retry',async()=>{
 const {env,stored}=setup();assert.equal((await submitInquiry({env,request:req()},async()=>new Response(null,{status:302}))).status,502);assert.equal(stored.size,1);
 assert.equal((await submitInquiry({env,request:req()},async()=>new Response(JSON.stringify({data:{candidateId:'receipt'}}),{status:202}))).status,202);
});
