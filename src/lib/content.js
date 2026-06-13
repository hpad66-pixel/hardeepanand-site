// content.js. The bridge from the repo's outputs/ to the site.
// The repo is the reservoir; this reads it. It never writes a master.
//
// The firewall (principle 3): in a production build, only status: PUBLISHED ships.
// In dev, everything except ARCHIVED is shown (with a status ribbon) so we can build
// and see the site before anything is actually published.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

// Where the content lives. Works in two layouts:
//   - the monorepo: site/src/lib/content.js -> ../../../outputs/
//   - the standalone publish repo (E4): site at repo root -> ../../content/
// First existing path wins; OUTPUTS_DIR env overrides both.
function resolveOutputs() {
  const candidates = [
    process.env.OUTPUTS_DIR,
    fileURLToPath(new URL('../../../outputs/', import.meta.url)),
    fileURLToPath(new URL('../../content/', import.meta.url)),
  ].filter(Boolean);
  for (const c of candidates) {
    const dir = c.endsWith('/') ? c : c + '/';
    if (existsSync(dir)) return dir;
  }
  return candidates[candidates.length - 1];
}
const OUTPUTS = resolveOutputs();

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Lexicon', href: '/lexicon/' },
  { label: 'OneWater Minute', href: '/minute/' },
  { label: 'Writing', href: '/writing/' },
];

const STATES = ['DRAFT', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

export function normalizeStatus(raw) {
  if (!raw) return 'DRAFT';
  const first = String(raw).trim().split(/\s+/)[0].toUpperCase();
  return STATES.includes(first) ? first : 'DRAFT';
}

// The one gate every collection runs through.
export function isVisible(status, isProd) {
  if (isProd) return status === 'PUBLISHED';
  return status !== 'ARCHIVED';
}

function statusFromHtml(html) {
  if (/\bPUBLISHED\b/.test(html)) return 'PUBLISHED';
  if (/\bAPPROVED\b/.test(html)) return 'APPROVED';
  return 'DRAFT';
}

function titleFromHtml(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) return t[1].split('·')[0].trim();
  return 'Untitled';
}

function slugify(filename) {
  return filename.replace(/\.html?$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

// Read a folder of standalone designed HTML documents (the Lexicon, the Minute).
export function readHtmlCollection(subdir) {
  const dir = OUTPUTS + subdir;
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!/\.html?$/i.test(f)) continue;
    const raw = readFileSync(dir + '/' + f, 'utf8');
    out.push({
      file: f,
      slug: slugify(f),
      title: titleFromHtml(raw),
      status: statusFromHtml(raw),
      raw,
    });
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

// ---- markdown (the Writing blog: The Systems Lens long-form) ----

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = val;
  }
  return { data, body: m[2] };
}

function resolveTitle(data, body, filename) {
  if (data.title) return data.title;
  if (data.seo_title) return data.seo_title.split('|')[0].trim();
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return filename.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');
}

export function renderMarkdown(body) {
  return marked.parse(body, { async: false });
}

// Read long-form articles for the blog. The Systems Lens is essays only: exclude post
// packs, welcome sequences, and emails, which live in the same folders.
export function readArticles(subdirs) {
  const out = [];
  for (const subdir of subdirs) {
    const dir = OUTPUTS + subdir;
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!/\.md$/i.test(f)) continue;
      const raw = readFileSync(dir + '/' + f, 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const deliverable = data.deliverable || '';
      if (!/article/i.test(deliverable)) continue;
      if (/\b(pack|sequence|email)\b/i.test(deliverable)) continue;
      const dateMatch = f.match(/(\d{4}-\d{2}-\d{2})/);
      out.push({
        file: f,
        slug: f.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
        title: resolveTitle(data, body, f),
        date: dateMatch ? dateMatch[1] : '',
        status: normalizeStatus(data.status),
        description: data.seo_description || '',
        body,
      });
    }
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

// Build the site nav as an HTML string (used when injecting into standalone docs).
export function navHtml(activeHref) {
  const links = NAV.map(
    (n) => `<a href="${n.href}"${activeHref === n.href ? ' aria-current="page"' : ''}>${n.label}</a>`
  ).join('');
  return `<nav class="ha-nav"><a class="ha-brand" href="/">Hardeep Anand</a><div class="ha-links">${links}</div></nav>`;
}

// Self-contained nav styling with unique class names, so it cannot collide with the
// designed page's own CSS. This is how we re-home a standalone page into the shell
// (decision 6) without touching its internal design.
const HA_NAV_CSS = `<style>
.ha-nav{position:sticky;top:0;z-index:99999;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:13px 28px;background:#030303;border-bottom:1px solid #D4A017;font-family:Inter,system-ui,sans-serif}
.ha-nav .ha-brand{color:#F0BC2E;font-weight:700;text-decoration:none;letter-spacing:.04em;font-size:15px}
.ha-nav .ha-links{display:flex;gap:18px;flex-wrap:wrap}
.ha-nav .ha-links a{color:#EDE7D8;text-decoration:none;font-size:13px;letter-spacing:.03em}
.ha-nav .ha-links a:hover,.ha-nav .ha-links a[aria-current=page]{color:#F0BC2E}
</style>`;

// Inject the site nav into a standalone designed document, right after <body>.
export function injectChrome(raw, activeHref) {
  const chrome = HA_NAV_CSS + navHtml(activeHref);
  if (/<body[^>]*>/i.test(raw)) {
    return raw.replace(/(<body[^>]*>)/i, `$1\n${chrome}\n`);
  }
  return chrome + raw;
}
