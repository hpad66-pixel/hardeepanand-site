import { verifyAccess } from './access.js';

export const CMS_STATUSES = ['DRAFT', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];
export const CMS_OVERRIDES_KEY = 'cms/status-overrides/v1.json';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

export function normalizeCmsStatus(value) {
  const status = String(value || '').trim().toUpperCase();
  return CMS_STATUSES.includes(status) ? status : '';
}

export function cleanContentPath(value) {
  const path = String(value || '').trim();
  if (!/^(writing|climb)\/[a-z0-9-]+$/.test(path)) return '';
  return path;
}

export function pathFromRequestPath(pathname) {
  const match = String(pathname || '').match(/^\/(writing|climb)\/([a-z0-9-]+)\/?$/);
  return match ? `${match[1]}/${match[2]}` : '';
}

export async function authorizeOwner(request, env, authorize = verifyAccess) {
  if (!env.IDEAS_OWNER_EMAIL) return false;
  return authorize(request, { ...env, ALLOWED_EMAIL: env.IDEAS_OWNER_EMAIL });
}

export async function loadContentManifest(request, env) {
  if (!env.ASSETS) return { items: [] };
  const url = new URL('/admin/content-manifest.json', request.url);
  const response = await env.ASSETS.fetch(new Request(url, { headers: { accept: 'application/json' } }));
  if (!response.ok) return { items: [] };
  try {
    const manifest = await response.json();
    return { ...manifest, items: Array.isArray(manifest.items) ? manifest.items : [] };
  } catch {
    return { items: [] };
  }
}

export async function loadContentOverrides(env) {
  if (!env.IDEAS) return { items: {}, updatedAt: null };
  const object = await env.IDEAS.get(CMS_OVERRIDES_KEY);
  if (!object) return { items: {}, updatedAt: null };
  try {
    const record = await object.json();
    return {
      updatedAt: record.updatedAt || null,
      items: record.items && typeof record.items === 'object' ? record.items : {},
    };
  } catch {
    return { items: {}, updatedAt: null };
  }
}

export function mergeContentState(manifest, controls) {
  const overrides = controls?.items || {};
  return (manifest.items || []).map((item) => {
    const override = overrides[item.path] || null;
    const effectiveStatus = normalizeCmsStatus(override?.status) || item.sourceStatus || item.status || 'DRAFT';
    const routeBuilt = item.sourceStatus === 'PUBLISHED';
    return {
      ...item,
      sourceStatus: item.sourceStatus || item.status || 'DRAFT',
      effectiveStatus,
      override,
      routeBuilt,
      liveNow: routeBuilt && effectiveStatus === 'PUBLISHED',
      requiresDeploy: effectiveStatus === 'PUBLISHED' && !routeBuilt,
    };
  });
}

export async function saveContentOverride(env, path, status, note = '', actor = '') {
  if (!env.IDEAS) return { ok: false, error: 'Private studio storage is unavailable.' };
  const current = await loadContentOverrides(env);
  const now = new Date().toISOString();
  const items = { ...current.items };
  items[path] = {
    status,
    note: String(note || '').slice(0, 600),
    actor: String(actor || '').slice(0, 160),
    updatedAt: now,
  };
  const record = { schema: 1, updatedAt: now, items };
  await env.IDEAS.put(CMS_OVERRIDES_KEY, JSON.stringify(record), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });
  if (env.IDEAS.put) {
    const id = crypto.randomUUID();
    await env.IDEAS.put(`cms/audit/v1/${now}-${id}.json`, JSON.stringify({ schema: 1, path, status, note, actor, at: now }), {
      httpMetadata: { contentType: 'application/json; charset=utf-8' },
    }).catch(() => {});
  }
  return { ok: true, record };
}

export async function contentAdminRequest({ request, env }, authorize = verifyAccess) {
  if (!await authorizeOwner(request, env, authorize)) return json({ error: 'Owner sign-in required.' }, 403);
  if (request.method === 'GET') {
    const manifest = await loadContentManifest(request, env);
    const controls = await loadContentOverrides(env);
    return json({ generatedAt: manifest.generatedAt || null, controlsUpdatedAt: controls.updatedAt, items: mergeContentState(manifest, controls) });
  }
  if (request.method !== 'PUT' && request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Save from this website.' }, 403);
  let input;
  try { input = await request.json(); } catch { return json({ error: 'Expected JSON.' }, 400); }
  const path = cleanContentPath(input?.path);
  const status = normalizeCmsStatus(input?.status);
  if (!path || !status) return json({ error: 'Choose a valid article and status.' }, 400);
  const result = await saveContentOverride(env, path, status, input?.note, request.headers.get('Cf-Access-Authenticated-User-Email') || '');
  if (!result.ok) return json({ error: result.error }, 503);
  const manifest = await loadContentManifest(request, env);
  const controls = await loadContentOverrides(env);
  return json({ ok: true, items: mergeContentState(manifest, controls) });
}

export async function publicContentHidden(path, env) {
  const contentPath = cleanContentPath(path);
  if (!contentPath || !env.IDEAS) return false;
  const controls = await loadContentOverrides(env);
  const override = controls.items?.[contentPath];
  const status = normalizeCmsStatus(override?.status);
  return !!status && status !== 'PUBLISHED';
}

export async function hiddenPublicPaths(env) {
  const controls = await loadContentOverrides(env);
  return Object.entries(controls.items || {})
    .filter(([, override]) => normalizeCmsStatus(override?.status) && normalizeCmsStatus(override.status) !== 'PUBLISHED')
    .map(([path]) => `/${path}/`);
}
