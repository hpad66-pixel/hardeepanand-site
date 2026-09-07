const endpoint = 'https://apascrm.com/api/v1/partner/contact-candidates';
const json = (status, data) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export const configured = env => !!(env.IDEAS && env.ENGAGE && env.APAS_CRM_API_KEY && env.APAS_ORGANIZATION_ID && env.APAS_SITE_ID && env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET);
export function inquiryStatus({env}) { return json(200,{ready:configured(env)}); }
export async function submitInquiry({request,env}, fetcher=fetch) {
  if(!configured(env)) return json(503,{error:'The contact form is not connected yet. Please use the email link below.'});
  if(request.headers.get('Origin')!==new URL(request.url).origin) return json(403,{error:'Please submit from this website.'});
  if(!request.headers.get('Content-Type')?.startsWith('application/json')) return json(415,{error:'Invalid submission format.'});
  const reader=request.body?.getReader(); if(!reader)return json(400,{error:'Missing note.'});
  let size=0,chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();return json(413,{error:'Please shorten your note.'});}chunks.push(value);}
  let input;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}input=JSON.parse(new TextDecoder().decode(bytes));}catch{return json(400,{error:'Invalid submission.'});}
  if(!input || typeof input!=='object' || Array.isArray(input))return json(400,{error:'Invalid submission.'});
  if(input.website)return json(400,{error:'Unable to accept this submission.'});
  const clean=(v,max)=>typeof v==='string'&&v.trim().length<=max?v.trim():null;
  const name=clean(input.name,100),email=clean(input.email,254),company=clean(input.company||'',150),message=clean(input.message,4000),articlePath=clean(input.articlePath,200);
  if(!name||!email||!/^\S+@\S+\.\S+$/.test(email)||company===null||!message||input.consent!==true||!/^\/(writing|climb)\/[a-z0-9-]+\/$/.test(articlePath||'')||!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/i.test(input.id||'')) return json(400,{error:'Please provide your name, email, note, and permission to respond.'});
  const submission={id:input.id,name,email,company,message,articlePath,consent:true};
  const key=`website-inquiries/v1/${input.id}.json`;
  const existing=await env.IDEAS.get(key);let record=existing?await existing.json():null;
  if(record && JSON.stringify(record.submission)!==JSON.stringify(submission)) return json(409,{error:'This note changed. Please reload before submitting it again.'});
  if(record?.receipt)return json(202,{accepted:true});
  if(!record){
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip)))).map(x=>x.toString(16).padStart(2,'0')).join('');
    const rateKey=`inquiry-rate/${hash}`;const count=Number(await env.ENGAGE.get(rateKey)||0);
    if(count>=5)return json(429,{error:'Please wait a little before sending another note.'});
    await env.ENGAGE.put(rateKey,String(count+1),{expirationTtl:600});
    record={submission,createdAt:new Date().toISOString(),status:'pending'};
    const inserted=await env.IDEAS.put(key,JSON.stringify(record),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
    if(!inserted){const winner=await env.IDEAS.get(key);record=winner?await winner.json():null;if(!record)return json(503,{error:'Unable to save the note. Please retry.'});if(JSON.stringify(record.submission)!==JSON.stringify(submission))return json(409,{error:'This submission changed. Please reload before retrying.'});if(record.receipt)return json(202,{accepted:true});}
  }
  let response;
  try{response=await fetcher(endpoint,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.APAS_CRM_API_KEY}`,'X-APAS-Organization-ID':env.APAS_ORGANIZATION_ID,'CF-Access-Client-Id':env.CF_ACCESS_CLIENT_ID,'CF-Access-Client-Secret':env.CF_ACCESS_CLIENT_SECRET},body:JSON.stringify({externalId:submission.id,source:'website',person:{displayName:name,email,...(company?{companyName:company}:{})},context:{siteId:env.APAS_SITE_ID,...(env.APAS_PROJECT_ID?{projectId:env.APAS_PROJECT_ID}:{}),campaign:articlePath},consent:{recorded:true,reference:'Website inquiry: permission for APAS to store this note and respond; '+record.createdAt},metadata:{message,form:'systems-lens-article',articleUrl:`https://hardeepanand.com${articlePath}`}})});}catch{return json(502,{error:'Your note is saved, but CRM delivery is delayed. Retry to send the same note without creating a duplicate.'});}
  const result=await response.json().catch(()=>({}));
  if(response.status!==202||!result.data?.candidateId)return json(502,{error:'Your note is saved, but CRM delivery is not confirmed. You can retry or contact us by email.'});
  await env.IDEAS.put(key,JSON.stringify({...record,status:'accepted',receipt:{candidateId:result.data.candidateId,acceptedAt:new Date().toISOString()}}),{httpMetadata:{contentType:'application/json'}});
  return json(202,{accepted:true});
}
