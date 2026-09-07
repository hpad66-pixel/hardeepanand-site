import {validIdeaId,privateJson,safeReader} from '../../../src/server/ideas.js';
export async function onRequest({request,env,params}) {
 if(!['GET','HEAD'].includes(request.method))return privateJson({error:'Method not allowed.'},405);
 if(!validIdeaId(params.id))return privateJson({error:'Idea not found.'},404);
 if(!env.IDEAS)return privateJson({error:'Private storage is not configured yet.'},503);
 const object=await env.IDEAS.get(`ideas/${params.id}.html`);
 if(!object)return privateJson({error:'Idea not found.'},404);
 if(new URL(request.url).searchParams.get('download')==='1')return new Response(request.method==='HEAD'?null:object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="idea-${params.id}.html"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
 return safeReader(new Response(request.method==='HEAD'?null:object.body));
}
