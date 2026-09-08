import {verifyAccess} from './access.js';
import {MAX_DRAFT_BYTES,validArticlePath,draftKey,validateDraft} from '../editor/draft-schema.js';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
export async function editorDraftRequest({request,env},authorize=verifyAccess){
 if(!env.IDEAS_OWNER_EMAIL||!await authorize(request,{...env,ALLOWED_EMAIL:env.IDEAS_OWNER_EMAIL}))return json(403,{error:'Sign in to your private studio to edit.'});
 if(!env.IDEAS)return json(503,{error:'Draft storage is unavailable.'});
 const url=new URL(request.url),path=url.searchParams.get('article');
 if(!validArticlePath(path))return json(400,{error:'Invalid article path.'});
 const key=draftKey(path);
 if(request.method==='GET'){const object=await env.IDEAS.get(key);return json(200,{draft:object?await object.json():null,storage:'Private studio'});}
 if(request.method!=='PUT')return json(405,{error:'Method not allowed.'});
 if(request.headers.get('Origin')!==url.origin)return json(403,{error:'Save from this website.'});
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json(415,{error:'Expected a draft document.'});
 let input;
 try{
  const reader=request.body?.getReader();if(!reader)throw Error('Missing draft.');let size=0,chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_DRAFT_BYTES){await reader.cancel();return json(413,{error:'Draft is too large.'});}chunks.push(value);}
  const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
  input=validateDraft(JSON.parse(new TextDecoder().decode(bytes)));
 }catch(error){return json(400,{error:error.message||'Invalid draft.'});}
 if(input.articlePath!==path)return json(400,{error:'Article mismatch.'});
 const existing=await env.IDEAS.get(key),previous=existing?await existing.json():null;
 if((previous?.revision||null)!==input.revision)return json(409,{error:'A newer draft was saved elsewhere. Reload the saved draft before saving again.'});
 const record={...input,revision:crypto.randomUUID(),updatedAt:new Date().toISOString()};
 const condition=existing?{etagMatches:existing.etag}:{etagDoesNotMatch:'*'};
 const saved=await env.IDEAS.put(key,JSON.stringify(record),{onlyIf:condition,httpMetadata:{contentType:'application/json'}});
 if(!saved)return json(409,{error:'Another editor saved first. Reload the saved draft.'});
 return json(200,{draft:record,storage:'Private studio'});
}
