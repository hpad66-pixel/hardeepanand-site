import { verifyAccess } from '../src/server/access.js';
import { hiddenPublicPaths, pathFromRequestPath, publicContentHidden } from '../src/server/cms.js';

function notFound() {
  return new Response('Not found', {status:404,headers:{'cache-control':'no-store','content-type':'text/plain; charset=utf-8','x-robots-tag':'noindex, nofollow'}});
}

async function filterCollectionHtml(response, env) {
  if (typeof HTMLRewriter === 'undefined') return response;
  const hidden = new Set(await hiddenPublicPaths(env));
  if (!hidden.size) return response;
  return new HTMLRewriter()
    .on('[data-content-path]', {
      element(element) {
        const path = element.getAttribute('data-content-path');
        if (hidden.has(path)) element.remove();
      },
    })
    .transform(response);
}

async function filterFeedResponse(response, env, pathname) {
  const hidden = await hiddenPublicPaths(env);
  if (!hidden.length) return response;
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  if (pathname === '/feed.json') {
    try {
      const feed = await response.clone().json();
      feed.items = (feed.items || []).filter((item) => {
        const path = new URL(item.url || item.id || '/', 'https://hardeepanand.com').pathname;
        return !hidden.includes(path);
      });
      return new Response(JSON.stringify(feed), { status: response.status, headers });
    } catch {
      return response;
    }
  }
  const text = await response.text();
  const escaped = hidden.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  let next = text;
  for (const path of escaped) {
    next = next
      .replace(new RegExp(`\\s*<item>[\\s\\S]*?<link>https?:\\/\\/[^<]+${path}[\\s\\S]*?<\\/item>`, 'g'), '')
      .replace(new RegExp(`\\s*<url>[\\s\\S]*?<loc>https?:\\/\\/[^<]+${path}[\\s\\S]*?<\\/url>`, 'g'), '');
  }
  return new Response(next, { status: response.status, headers });
}

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  const contentPath = pathFromRequestPath(path);
  if (contentPath && await publicContentHidden(contentPath, context.env)) return notFound();
  if (/^\/admin\/ideas(?:\/|$)/.test(path)) {
    if (!context.env.IDEAS_OWNER_EMAIL || !await verifyAccess(context.request, {...context.env, ALLOWED_EMAIL:context.env.IDEAS_OWNER_EMAIL})) {
      return new Response('Owner sign-in required. Open https://hardeepanand.com/admin/ideas/ to sign in.', {status:403,headers:{'cache-control':'no-store','content-type':'text/plain; charset=utf-8'}});
    }
    const response = await context.next();
    const protectedResponse = new Response(response.body,response);
    protectedResponse.headers.set('Cache-Control','private, no-store');
    protectedResponse.headers.set('X-Robots-Tag','noindex, nofollow');
    return protectedResponse;
  }
  if (/^\/(?:admin(?:\/|$)|api\/save(?:\/|$)|api\/admin(?:\/|$))/.test(path)) {
    if (!await verifyAccess(context.request, context.env)) {
      return new Response('Sign in through the protected studio at https://hardeepanand.com/admin/.', {status:403,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    }
  }
  const response = await context.next();
  if (/^\/(?:writing|climb)\/?$/.test(path)) return filterCollectionHtml(response, context.env);
  if (/^\/(?:rss\.xml|feed\.json|sitemap\.xml)$/.test(path)) return filterFeedResponse(response, context.env, path);
  return response;
}
