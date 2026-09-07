import { verifyAccess } from '../src/server/access.js';
export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
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
  if (/^\/(?:admin(?:\/|$)|api\/save(?:\/|$))/.test(path)) {
    if (!await verifyAccess(context.request, context.env)) {
      return new Response('Sign in through the protected studio at https://hardeepanand.com/admin/.', {status:403,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    }
  }
  return context.next();
}
