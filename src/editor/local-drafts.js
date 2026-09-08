import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {MAX_DRAFT_BYTES,validArticlePath,validateDraft} from './draft-schema.js';
export function localDrafts(){return {name:'systems-lens-local-drafts',configureServer(server){
 server.watcher.unwatch(resolve('content/editor-drafts'));
 server.middlewares.use('/api/editor/drafts',async(req,res)=>{
  const respond=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  // This development-only route is never included in the Cloudflare deployment.
  const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(host))return respond(403,{error:'Local editing is available only on this computer.'});
  const url=new URL(req.url,'http://'+host),path=url.searchParams.get('article');
  if(!validArticlePath(path))return respond(400,{error:'Invalid article path.'});
  const dir=resolve('content/editor-drafts'),file=resolve(dir,path.slice(1,-1).replaceAll('/','--')+'.json');
  const read=()=>existsSync(file)?JSON.parse(readFileSync(file,'utf8')):null;
  try{
   if(req.method==='GET')return respond(200,{draft:read(),storage:'Project draft file'});
   if(req.method!=='PUT')return respond(405,{error:'Method not allowed.'});
   if(req.headers.origin!=='http://'+host)return respond(403,{error:'Save from this preview.'});
   if(!req.headers['content-type']?.startsWith('application/json'))return respond(415,{error:'Expected a draft document.'});
   let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>MAX_DRAFT_BYTES)return respond(413,{error:'Draft is too large.'});chunks.push(chunk);}
   const input=validateDraft(JSON.parse(Buffer.concat(chunks).toString('utf8')));
   if(input.articlePath!==path)return respond(400,{error:'Article mismatch.'});
   const previous=read();if((previous?.revision||null)!==input.revision)return respond(409,{error:'A newer draft exists. Reload the saved draft before saving again.'});
   const record={...input,revision:randomUUID(),updatedAt:new Date().toISOString()};
   mkdirSync(dir,{recursive:true});const temp=file+'.tmp';writeFileSync(temp,JSON.stringify(record,null,2)+'\n',{mode:0o600});renameSync(temp,file);
   return respond(200,{draft:record,storage:'Project draft file'});
  }catch(error){return respond(400,{error:error.message||'Unable to save the draft.'});}
 });
}};}
