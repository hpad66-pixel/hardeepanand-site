import { verifyAccess } from '../../src/server/access.js';
import { copy as currentCopy } from '../../src/data/copy.js';
// Save named copy fields to the existing source repository. Publication is a
// separate verified deployment; saving must never claim the site is already live.
export function mergeCopySource(source, updates) {
  const match = source.match(/export const copy\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) throw new Error('Unrecognized copy source');
  const latest = JSON.parse(match[1]);
  if (!latest || Array.isArray(latest)) throw new Error('Invalid copy source');
  return '// Editable site copy.\nexport const copy = ' + JSON.stringify({ ...latest, ...updates }, null, 2) + ';\n';
}

export async function onRequestPost({ request, env }) {
  if (!await verifyAccess(request, env)) return json({ error: 'Sign in through Cloudflare Access.' }, 403);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin.' }, 403);
  // 2. Parse the request.
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const { action, payload } = body || {};
  if (!env.GITHUB_TOKEN) {
    return json({ error: 'GitHub publishing access is not configured.' }, 501);
  }

  // 3. Route the action.
  if (action === 'copy') {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return json({ error: 'Invalid copy payload.' }, 400);
    if (Object.keys(payload).length > 200) return json({ error: 'Too many edits.' }, 400);
    for (const [key, value] of Object.entries(payload)) {
      if (!Object.hasOwn(currentCopy, key) || typeof value !== 'string' || value.length > 20000) {
        return json({ error: 'Only named site copy can be saved here. Export article edits for review.' }, 400);
      }
    }
    const path = env.COPY_PATH || 'src/data/copy.js';
    const r = await commitFile(env, path, payload, 'Edit site copy (admin editor)');
    return r.ok ? json({ ok: true, commit: r.commit }) : json({ error: r.error }, 502);
  }

  return json({ error: 'Unsupported action. Export theme, profile, or article changes.' }, 501);
}

async function commitFile(env, path, updates, message) {
  const repo = env.GITHUB_REPO || 'hpad66-pixel/hardeepanand-site';
  const branch = env.GITHUB_BRANCH || 'main';
  const base = `https://api.github.com/repos/${repo}/contents/${encodeURI(path)}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hardeepanand-admin',
  };
  const get = await fetch(`${base}?ref=${branch}`, { headers });
  if (!get.ok) return { ok: false, error: 'Could not read the existing copy. No changes were saved.' };
  const existing = await get.json();
  const sha = existing.sha;
  let content;
  try {
    const raw = new TextDecoder().decode(Uint8Array.from(atob(existing.content.replace(/\s/g, '')), c => c.charCodeAt(0)));
    content = mergeCopySource(raw, updates);
  } catch { return {ok:false,error:'The copy source has changed format. No changes were saved.'}; }

  const put = await fetch(base, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: b64utf8(content), sha, branch }),
  });
  if (put.status === 200 || put.status === 201) {
    return { ok: true, commit: (await put.json()).commit?.sha };
  }
  return { ok: false, error: `The source update failed (${put.status}). Retry after checking repository access.` };
}

function b64utf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
