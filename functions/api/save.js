// save.js. The admin write API (E4 backend), as a Cloudflare Pages Function.
//
// It is the bridge that makes the visual editor and the Theme Studio permanent for every
// visitor: the browser POSTs a change, this commits it to the publish repo via the GitHub
// API, and the repo's deploy (Action or Pages Git integration) rebuilds the live site.
//
// SAFETY (fail-safe by design):
//   - It refuses to act unless a Cloudflare Access JWT is present on the request. So even if
//     it is deployed before Access is configured, it returns 403 to everyone. It is never open.
//   - If env.ALLOWED_EMAIL is set, the Access identity must match it.
//   - If the GitHub secrets are not set, it returns 501 (not configured) rather than failing open.
//
// Secrets to set at activation (Cloudflare Pages project settings, or `wrangler pages secret put`):
//   GITHUB_TOKEN   fine-grained PAT with contents:write on the publish repo
//   GITHUB_REPO    "owner/name" of the publish repo (e.g. hpad66-pixel/hardeepanand-site)
//   GITHUB_BRANCH  defaults to "main"
//   ALLOWED_EMAIL  your email (defense in depth; Access already restricts the path)
//   COPY_PATH      defaults to "src/data/copy.js" (path within the publish repo)

export async function onRequestPost({ request, env }) {
  // 1. Require Cloudflare Access. No JWT -> never act.
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return json({ error: 'forbidden: Cloudflare Access required' }, 403);
  const email = (request.headers.get('Cf-Access-Authenticated-User-Email') || '').toLowerCase();
  if (env.ALLOWED_EMAIL && email && email !== env.ALLOWED_EMAIL.toLowerCase()) {
    return json({ error: 'forbidden: not the owner' }, 403);
  }

  // 2. Parse the request.
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const { action, payload } = body || {};
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return json({ error: 'backend not configured (set GITHUB_TOKEN + GITHUB_REPO)' }, 501);
  }

  // 3. Route the action.
  if (action === 'copy') {
    if (!payload || typeof payload !== 'object') return json({ error: 'missing copy payload' }, 400);
    const content =
      '// copy.js. All editable site copy. Edited via the admin visual editor.\n' +
      'export const copy = ' + JSON.stringify(payload, null, 2) + ';\n';
    const path = env.COPY_PATH || 'src/data/copy.js';
    const r = await commitFile(env, path, content, 'Edit site copy (admin editor)');
    return r.ok ? json({ ok: true, commit: r.commit }) : json({ error: r.error }, 502);
  }

  // theme / profile / status follow the same commitFile pattern; wired at activation
  // once we can test against the live deployed Function.
  return json({ error: `action '${action}' is not wired yet` }, 501);
}

async function commitFile(env, path, content, message) {
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || 'main';
  const base = `https://api.github.com/repos/${repo}/contents/${encodeURI(path)}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hardeepanand-admin',
  };
  let sha;
  const get = await fetch(`${base}?ref=${branch}`, { headers });
  if (get.status === 200) sha = (await get.json()).sha;
  const put = await fetch(base, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: b64utf8(content), sha, branch }),
  });
  if (put.status === 200 || put.status === 201) {
    return { ok: true, commit: (await put.json()).commit?.sha };
  }
  return { ok: false, error: `github ${put.status}: ${await put.text()}` };
}

function b64utf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
