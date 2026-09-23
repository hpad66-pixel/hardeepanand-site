import test from 'node:test';
import assert from 'node:assert/strict';
import {contentAdminRequest, hiddenPublicPaths, publicContentHidden, HOMEPAGE_SETTINGS_KEY} from '../src/server/cms.js';

function bucket() {
  const records = new Map();
  return {
    records,
    IDEAS: {
      get: async key => records.has(key) ? { json: async () => JSON.parse(records.get(key)) } : null,
      put: async (key, value) => {
        records.set(key, value);
        return {};
      },
    },
  };
}

function assets(items) {
  return {
    fetch: async () => Response.json({ schema: 1, generatedAt: '2026-09-23T00:00:00Z', items }),
  };
}

const manifestItems = [
  { path: 'writing/live', href: '/writing/live/', title: 'Live', sourceStatus: 'PUBLISHED', topic: 'Ideas', readMin: 3 },
  { path: 'writing/draft', href: '/writing/draft/', title: 'Draft', sourceStatus: 'DRAFT', topic: 'Ideas', readMin: 2 },
];

test('content admin requires owner access and merges status overrides', async () => {
  const store = bucket();
  const env = { IDEAS_OWNER_EMAIL: 'hardeep@apas.ai', IDEAS: store.IDEAS, ASSETS: assets(manifestItems) };
  const denied = await contentAdminRequest({ request: new Request('https://hardeepanand.com/api/admin/content'), env }, async () => false);
  assert.equal(denied.status, 403);

  const save = await contentAdminRequest({
    request: new Request('https://hardeepanand.com/api/admin/content', {
      method: 'PUT',
      headers: { origin: 'https://hardeepanand.com', 'content-type': 'application/json' },
      body: JSON.stringify({ path: 'writing/live', status: 'ARCHIVED', note: 'take down' }),
    }),
    env,
  }, async () => true);
  assert.equal(save.status, 200);

  const read = await (await contentAdminRequest({ request: new Request('https://hardeepanand.com/api/admin/content'), env }, async () => true)).json();
  const live = read.items.find(item => item.path === 'writing/live');
  const draft = read.items.find(item => item.path === 'writing/draft');
  assert.equal(live.effectiveStatus, 'ARCHIVED');
  assert.equal(live.liveNow, false);
  assert.equal(draft.effectiveStatus, 'DRAFT');
});

test('public content overrides hide built routes and advertise hidden paths', async () => {
  const store = bucket();
  const env = { IDEAS: store.IDEAS };
  await store.IDEAS.put('cms/status-overrides/v1.json', JSON.stringify({
    schema: 1,
    items: { 'writing/live': { status: 'ARCHIVED' }, 'writing/ok': { status: 'PUBLISHED' } },
  }));
  assert.equal(await publicContentHidden('writing/live', env), true);
  assert.equal(await publicContentHidden('writing/ok', env), false);
  assert.deepEqual(await hiddenPublicPaths(env), ['/writing/live/']);
});

test('content admin stores validated homepage settings for release planning', async () => {
  const store = bucket();
  const env = { IDEAS_OWNER_EMAIL: 'hardeep@apas.ai', IDEAS: store.IDEAS, ASSETS: assets(manifestItems) };
  const save = await contentAdminRequest({
    request: new Request('https://hardeepanand.com/api/admin/content', {
      method: 'POST',
      headers: { origin: 'https://hardeepanand.com', 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'homepage-settings', settings: { mode: 'editor', evergreenPath: 'writing/live' } }),
    }),
    env,
  }, async () => true);
  assert.equal(save.status, 200);
  assert(store.records.has(HOMEPAGE_SETTINGS_KEY));
  const read = await (await contentAdminRequest({ request: new Request('https://hardeepanand.com/api/admin/content'), env }, async () => true)).json();
  assert.equal(read.homepageSettings.mode, 'editor');
  assert.equal(read.homepageSettings.evergreenPath, 'writing/live');
});
