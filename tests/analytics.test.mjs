import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsAdminRequest, analyticsEventRequest} from '../src/server/analytics.js';

function kv() {
  const records = new Map();
  return {
    records,
    ENGAGE: {
      get: async (key, type) => {
        if (!records.has(key)) return null;
        return type === 'json' ? JSON.parse(records.get(key)) : records.get(key);
      },
      put: async (key, value) => {
        records.set(key, value);
      },
    },
  };
}

test('analytics event stores aggregate traffic without raw identity', async () => {
  const store = kv();
  const request = new Request('https://hardeepanand.com/api/analytics/event', {
    method: 'POST',
    headers: { origin: 'https://hardeepanand.com', 'content-type': 'application/json', 'user-agent': 'Mobile Safari' },
    body: JSON.stringify({ path: '/writing/live/', search: '?utm_campaign=test', referrer: 'https://www.linkedin.com/feed/', visitorId: 'visitor-1' }),
  });
  request.cf = { country: 'US', region: 'Florida' };
  const response = await analyticsEventRequest({ request, env: { ENGAGE: store.ENGAGE } });
  assert.equal(response.status, 200);
  const saved = JSON.parse([...store.records.values()][0]);
  assert.equal(saved.views, 1);
  assert.equal(saved.paths['/writing/live/'], 1);
  assert.equal(saved.countries.US, 1);
  assert.equal(saved.referrers.LinkedIn, 1);
  assert.equal(saved.campaigns.test, 1);
  assert.equal(saved.devices.Mobile, 1);
  assert.equal(Object.keys(saved.visitors).length, 1);
  assert(!JSON.stringify(saved).includes('visitor-1'));
});

test('analytics admin requires owner and returns rollups', async () => {
  const store = kv();
  const event = new Request('https://hardeepanand.com/api/analytics/event', {
    method: 'POST',
    headers: { origin: 'https://hardeepanand.com', 'content-type': 'application/json' },
    body: JSON.stringify({ path: '/writing/live/', visitorId: 'visitor-1' }),
  });
  event.cf = { country: 'CA', region: 'Ontario' };
  await analyticsEventRequest({ request: event, env: { ENGAGE: store.ENGAGE } });
  const denied = await analyticsAdminRequest({ request: new Request('https://hardeepanand.com/api/admin/analytics'), env: { IDEAS_OWNER_EMAIL: 'hardeep@apas.ai', ENGAGE: store.ENGAGE } }, async () => false);
  assert.equal(denied.status, 403);
  const data = await (await analyticsAdminRequest({ request: new Request('https://hardeepanand.com/api/admin/analytics?days=1'), env: { IDEAS_OWNER_EMAIL: 'hardeep@apas.ai', ENGAGE: store.ENGAGE } }, async () => true)).json();
  assert.equal(data.totals.views, 1);
  assert.equal(data.totals.visitors, 1);
  assert.equal(data.countries[0].label, 'CA');
  assert.equal(data.topPaths[0].label, '/writing/live/');
});
