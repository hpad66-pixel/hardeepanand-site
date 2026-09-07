import {MAX_IDEA_BYTES,ideaMetadata,privateJson,ideaFromObject} from '../../../src/server/ideas.js';
export async function onRequest({request,env}) {
  if (!env.IDEAS) return privateJson({error:'Private storage is not configured yet.'},503);
  try {
    if (request.method==='GET') {
      const url=new URL(request.url);
      const result=await env.IDEAS.list({prefix:'ideas/',limit:100,cursor:url.searchParams.get('cursor') || undefined,include:['customMetadata']});
      return privateJson({items:result.objects.map(ideaFromObject),cursor:result.truncated?result.cursor:null});
    }
    if (request.method!=='POST') return privateJson({error:'Method not allowed.'},405);
    if(request.headers.get('origin')!==new URL(request.url).origin) return privateJson({error:'Please upload from your library page.'},403);
    if(!/^multipart\/form-data;/i.test(request.headers.get('content-type') || '')) return privateJson({error:'Choose an HTML file.'},400);
    if(Number(request.headers.get('content-length'))>MAX_IDEA_BYTES+16384) return privateJson({error:'The maximum file size is 5 MB.'},413);
    const bytes=await request.arrayBuffer();
    if(bytes.byteLength>MAX_IDEA_BYTES+16384) return privateJson({error:'The maximum file size is 5 MB.'},413);
    const form=await new Response(bytes,{headers:{'content-type':request.headers.get('content-type')}}).formData();
    const file=form.get('file');
    if(!file || typeof file.arrayBuffer!=='function' || !/\.html?$/i.test(file.name) || !file.size || file.size>MAX_IDEA_BYTES) return privateJson({error:'Choose a nonempty .html file up to 5 MB.'},400);
    let meta;try{meta=ideaMetadata(form);}catch(e){return privateJson({error:e.message},400);}
    const id=crypto.randomUUID();
    await env.IDEAS.put(`ideas/${id}.html`,await file.arrayBuffer(),{customMetadata:meta,httpMetadata:{contentType:'text/html; charset=utf-8'}});
    return privateJson({id},201);
  } catch { return privateJson({error:'The library could not complete that request. Please try again.'},500); }
}
