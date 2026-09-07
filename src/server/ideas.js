export const MAX_IDEA_BYTES = 5 * 1024 * 1024;
export const validIdeaId = id => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
export function ideaMetadata(form) {
  const title = String(form.get('title') || '').trim();
  const summary = String(form.get('summary') || '').trim();
  const tags = String(form.get('tags') || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (!title || title.length > 140 || summary.length > 500 || tags.length > 12 || tags.some(t=>t.length>40)) throw new Error('Use a title up to 140 characters, a summary up to 500, and at most 12 short tags.');
  return {title,summary,tags:JSON.stringify([...new Set(tags)]),createdAt:new Date().toISOString()};
}
export const privateJson = (value,status=200) => Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
export function ideaFromObject(object) {
  const meta=object.customMetadata || {};
  let tags=[]; try {tags=JSON.parse(meta.tags || '[]');} catch {}
  return {id:object.key.slice(6,-5),title:meta.title || 'Untitled idea',summary:meta.summary || '',tags,createdAt:meta.createdAt || object.uploaded.toISOString(),size:object.size};
}
export function safeReader(response) {
  // Untrusted documents have no scripts, network, forms, frames, or navigation.
  const headers=new Headers({'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox"});
  const rewriter=new HTMLRewriter().on('script, iframe, frame, frameset, object, embed, base, link, meta, form', {element(el){el.remove();}}).on('*',{element(el){
    for (const [name,value] of [...el.attributes]) {
      if (/^on/i.test(name) || ['action','formaction','srcdoc','ping','target','download'].includes(name)) el.removeAttribute(name);
      if (['href','xlink:href'].includes(name) && !value.startsWith('#')) el.removeAttribute(name);
      if (['src','srcset','poster','background'].includes(name) && !(name==='src' && /^data:image\/(png|jpeg|gif|webp);base64,/i.test(value))) el.removeAttribute(name);
    }
  }});
  return rewriter.transform(new Response(response.body,{headers}));
}
