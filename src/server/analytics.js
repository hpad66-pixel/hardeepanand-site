import { verifyAccess } from './access.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const KNOWN_CHANNELS = [
  ['linkedin.', 'LinkedIn'],
  ['substack.', 'Substack'],
  ['google.', 'Google'],
  ['bing.', 'Bing'],
  ['duckduckgo.', 'DuckDuckGo'],
  ['facebook.', 'Facebook'],
  ['instagram.', 'Instagram'],
  ['x.com', 'X'],
  ['twitter.', 'X'],
];

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function blankDay(day = dayKey()) {
  return { schema: 1, day, views: 0, visitors: {}, paths: {}, countries: {}, regions: {}, referrers: {}, campaigns: {}, devices: {}, updatedAt: null };
}

function add(map, key, by = 1) {
  const safe = String(key || 'Unknown').slice(0, 120) || 'Unknown';
  map[safe] = (map[safe] || 0) + by;
}

function cleanPath(value) {
  const path = String(value || '/').trim().split('?')[0];
  if (!path.startsWith('/') || path.includes('..') || path.length > 180) return '/';
  if (path.startsWith('/admin') || path.startsWith('/api/')) return '';
  return path;
}

function deviceFromUA(ua = '') {
  if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function referrerSource(value = '') {
  if (!value) return 'Direct';
  try {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    const known = KNOWN_CHANNELS.find(([needle]) => host.includes(needle));
    return known ? known[1] : host;
  } catch {
    return 'Direct';
  }
}

function campaignFromSearch(search = '') {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    return params.get('utm_campaign') || params.get('utm_source') || '';
  } catch {
    return '';
  }
}

async function visitorHash(visitorId = '', day = '') {
  const raw = `${day}:${String(visitorId || '').slice(0, 80)}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest)).slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function analyticsEventRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!env.ENGAGE) return json({ ok: true, stored: false });
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  if (origin && origin !== url.origin) return json({ error: 'Invalid origin.' }, 403);
  let input = {};
  try { input = await request.json(); } catch {}
  const path = cleanPath(input.path);
  if (!path) return json({ ok: true, ignored: true });
  const day = dayKey();
  const key = `analytics:v1:day:${day}`;
  const current = await env.ENGAGE.get(key, 'json').catch(() => null) || blankDay(day);
  current.views = (current.views || 0) + 1;
  current.updatedAt = new Date().toISOString();
  current.visitors ||= {};
  current.paths ||= {};
  current.countries ||= {};
  current.regions ||= {};
  current.referrers ||= {};
  current.campaigns ||= {};
  current.devices ||= {};
  add(current.paths, path);
  add(current.countries, request.cf?.country || 'Unknown');
  add(current.regions, [request.cf?.country, request.cf?.region].filter(Boolean).join(' / ') || request.cf?.country || 'Unknown');
  add(current.referrers, referrerSource(input.referrer));
  const campaign = campaignFromSearch(input.search);
  if (campaign) add(current.campaigns, campaign);
  add(current.devices, deviceFromUA(request.headers.get('user-agent') || ''));
  if (input.visitorId) current.visitors[await visitorHash(input.visitorId, day)] = 1;
  await env.ENGAGE.put(key, JSON.stringify(current), { expirationTtl: 60 * 60 * 24 * 400 });
  return json({ ok: true });
}

function mergeMap(target, source = {}) {
  for (const [key, value] of Object.entries(source)) add(target, key, Number(value) || 0);
}

function top(map, limit = 12) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

export async function analyticsAdminRequest({ request, env }, authorize = verifyAccess) {
  if (!env.IDEAS_OWNER_EMAIL || !await authorize(request, { ...env, ALLOWED_EMAIL: env.IDEAS_OWNER_EMAIL })) return json({ error: 'Owner sign-in required.' }, 403);
  if (!env.ENGAGE) return json({ days: [], totals: { views: 0, visitors: 0 }, topPaths: [], countries: [], referrers: [], campaigns: [], devices: [], regions: [] });
  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 30));
  const records = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = dayKey(new Date(Date.now() - index * DAY_MS));
    const record = await env.ENGAGE.get(`analytics:v1:day:${day}`, 'json').catch(() => null) || blankDay(day);
    records.push(record);
  }
  const aggregate = { views: 0, visitors: {}, paths: {}, countries: {}, regions: {}, referrers: {}, campaigns: {}, devices: {} };
  for (const record of records) {
    aggregate.views += record.views || 0;
    Object.assign(aggregate.visitors, record.visitors || {});
    mergeMap(aggregate.paths, record.paths);
    mergeMap(aggregate.countries, record.countries);
    mergeMap(aggregate.regions, record.regions);
    mergeMap(aggregate.referrers, record.referrers);
    mergeMap(aggregate.campaigns, record.campaigns);
    mergeMap(aggregate.devices, record.devices);
  }
  return json({
    days: records.map((record) => ({ day: record.day, views: record.views || 0, visitors: Object.keys(record.visitors || {}).length })),
    totals: { views: aggregate.views, visitors: Object.keys(aggregate.visitors).length },
    topPaths: top(aggregate.paths),
    countries: top(aggregate.countries, 20),
    regions: top(aggregate.regions, 20),
    referrers: top(aggregate.referrers),
    campaigns: top(aggregate.campaigns),
    devices: top(aggregate.devices),
  });
}
