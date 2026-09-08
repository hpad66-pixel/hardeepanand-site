import { verifyAccess } from './access.js';

const articlePaths = { 'vital-signs':'/writing/vital-signs/', 'data-governance':'/writing/data-governance/', 'fifty-steps-back':'/writing/fifty-steps-back/', 'adapt-dont-pivot':'/climb/adapt-dont-pivot/', 'in-your-head':'/climb/in-your-head/' };
const articles = new Set(Object.keys(articlePaths));
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const publicComment = ({id, name, body, createdAt}) => ({id, name, body, createdAt});
const configured = env => Boolean(env.ENGAGE && env.COMMENTS_ACCESS_AUD);

export async function readerIdentity(request, env, fetcher = fetch) {
  // Reader tokens must never fall back to the owner/studio audience.
  if (!env.COMMENTS_ACCESS_AUD) return null;
  const valid = await verifyAccess(request, {
    ACCESS_AUD: env.COMMENTS_ACCESS_AUD,
    ACCESS_TEAM_DOMAIN: env.ACCESS_TEAM_DOMAIN,
  }, fetcher);
  if (!valid) return null;
  const payload = request.headers.get('Cf-Access-Jwt-Assertion').split('.')[1];
  const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
  const email = claims.email.toLowerCase();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
  return { id: [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join(''), email };
}

export async function listComments({ request, env }) {
  if (!configured(env)) return json({ error: 'Discussion is not open yet.', configured: false }, 503);
  const url = new URL(request.url);
  const article = url.searchParams.get('article');
  if (!articles.has(article)) return json({ error: 'Article not found.' }, 404);
  const cursor = url.searchParams.get('cursor') || undefined;
  if (cursor && cursor.length > 1024) return json({ error: 'Invalid page.' }, 400);
  const page = await env.ENGAGE.list({ prefix: `comments/v1/${article}/`, limit: 30, cursor });
  const records = await Promise.all(page.keys.map(key => env.ENGAGE.get(key.name, 'json')));
  return json({ comments: records.filter(Boolean).map(publicComment), cursor: page.list_complete ? null : page.cursor });
}

export async function readerSession({ request, env }, fetcher = fetch) {
  if (!configured(env)) return json({ error: 'Reader sign-in is not configured.' }, 503);
  const identity = await readerIdentity(request, env, fetcher);
  return identity ? json({ authenticated: true }) : json({ authenticated: false }, 401);
}

export async function readerLogin(context, fetcher = fetch) {
  const response = await readerSession(context, fetcher);
  if (!response.ok) return response;
  const article = new URL(context.request.url).searchParams.get('article');
  if (!articles.has(article)) return json({ error: 'Article not found.' }, 404);
  return new Response(null, { status: 303, headers: { Location: `${articlePaths[article]}#comments`, 'Cache-Control': 'no-store' } });
}

export async function postComment({ request, env }, fetcher = fetch) {
  if (!configured(env)) return json({ error: 'Discussion is not open yet.' }, 503);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Please post from this website.' }, 403);
  const identity = await readerIdentity(request, env, fetcher);
  if (!identity) return json({ error: 'Sign in to leave a comment.' }, 401);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Use a JSON request.' }, 415);
  if (Number(request.headers.get('Content-Length')) > 12000) return json({ error: 'Comment is too long.' }, 413);
  // Enforce the limit on actual bytes, including chunked requests.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'Add a comment.' }, 400);
  let size = 0; const chunks = [];
  for (;;) {
    const {value, done} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 12000) { await reader.cancel(); return json({ error: 'Comment is too long.' }, 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let input;
  try { input = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({error: 'Invalid comment.'}, 400); }
  const article = input?.article;
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const body = typeof input?.body === 'string' ? input.body.trim() : '';
  if (!articles.has(article)) return json({ error: 'Article not found.' }, 404);
  if (!name || name.length > 60 || /[\r\n\x00-\x1f]/.test(name) || !body || body.length > 2000) return json({ error: 'Use a display name up to 60 characters and a comment up to 2,000 characters.' }, 400);
  const id = `${String(9999999999999-Date.now()).padStart(13, '0')}-${crypto.randomUUID()}`;
  const comment = { id, name, body, createdAt: new Date().toISOString(), author: identity.id };
  await env.ENGAGE.put(`comments/v1/${article}/${id}`, JSON.stringify(comment));
  return json({ comment: publicComment(comment) }, 201);
}
