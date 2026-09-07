import {MAX_IDEA_BYTES, ideaMetadata, privateJson} from './ideas.js';

export async function sha256(value) {
  const bytes=typeof value==='string'?new TextEncoder().encode(value):value;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function verifyPushToken(request, expectedHash) {
  if (!/^[a-f0-9]{64}$/.test(expectedHash || '')) return false;
  const authorization=request.headers.get('Authorization') || '';
  if (!/^Bearer ha_push_[A-Za-z0-9_-]{43}$/.test(authorization)) return false;
  const actual=await sha256(authorization.slice(7));
  let difference=0;
  for(let i=0;i<64;i++)difference|=actual.charCodeAt(i)^expectedHash.charCodeAt(i);
  return difference===0;
}

async function boundedBody(request,limit) {
  if(!request.body)throw new Error('empty');
  const reader=request.body.getReader();const chunks=[];let length=0;
  try {while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new Error('large');}chunks.push(value);}}
  finally {reader.releaseLock();}
  const result=new Uint8Array(length);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}return result;
}

// Identical bytes get one stable object ID. Changed HTML creates a new version.
export function idFromHash(hash) {
  const value=hash.slice(0,12)+'4'+hash.slice(13,16)+((parseInt(hash[16],16)&3)|8).toString(16)+hash.slice(17,32);
  return `${value.slice(0,8)}-${value.slice(8,12)}-${value.slice(12,16)}-${value.slice(16,20)}-${value.slice(20)}`;
}

export async function handleLibraryPush({request,env}) {
  if(request.method!=='POST')return privateJson({error:'Use POST to upload HTML.'},405);
  if(!env.LIBRARY_PUSH_TOKEN_SHA256 || !env.IDEAS || !env.IDEAS_OWNER_EMAIL)return privateJson({error:'The upload connection is not configured.'},503);
  if(!await verifyPushToken(request,env.LIBRARY_PUSH_TOKEN_SHA256))return privateJson({error:'Invalid upload credential.'},401);
  if(request.headers.has('Origin'))return privateJson({error:'Use the private library page for browser uploads.'},403);
  const type=request.headers.get('content-type') || '';
  if(!/^multipart\/form-data;/i.test(type))return privateJson({error:'Send an HTML file using multipart/form-data.'},400);
  const limit=MAX_IDEA_BYTES+16384;
  if(Number(request.headers.get('content-length'))>limit)return privateJson({error:'The maximum HTML file size is 5 MB.'},413);
  let body;try{body=await boundedBody(request,limit);}catch{return privateJson({error:'The request is empty or exceeds the 5 MB file limit.'},413);}
  let form;try{form=await new Response(body,{headers:{'content-type':type}}).formData();}catch{return privateJson({error:'Invalid upload form.'},400);}
  const file=form.get('file');
  if(!file || typeof file.arrayBuffer!=='function' || !/\.html?$/i.test(file.name) || !file.size || file.size>MAX_IDEA_BYTES)return privateJson({error:'Choose a nonempty .html file up to 5 MB.'},400);
  let metadata;try{metadata=ideaMetadata(form);}catch(e){return privateJson({error:e.message},400);}
  try {
    const bytes=await file.arrayBuffer();
    const digest=await sha256(bytes);const id=idFromHash(digest);const key=`ideas/${id}.html`;
    const result={id,url:`https://hardeepanand.com/admin/ideas/${id}`,libraryUrl:'https://hardeepanand.com/admin/ideas/',sha256:digest};
    const existing=await env.IDEAS.head(key);
    if(existing){if(existing.customMetadata?.sha256!==digest)return privateJson({error:'Document identifier conflict.'},409);return privateJson({...result,duplicate:true},200);}
    const stored=await env.IDEAS.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{...metadata,sha256:digest,source:'telegram-hermes'},httpMetadata:{contentType:'text/html; charset=utf-8'}});
    if(!stored){const winner=await env.IDEAS.head(key);if(winner?.customMetadata?.sha256!==digest)return privateJson({error:'Document identifier conflict.'},409);return privateJson({...result,duplicate:true},200);}
    return privateJson({...result,duplicate:false},201);
  }catch{return privateJson({error:'Upload failed. Retrying the same file is safe.'},500);}
}
