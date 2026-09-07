import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addTakeawayActions } from '../src/lib/takeaway-actions.js';

test('email contains the actual five takeaways and shares the public article URL', () => {
  const source = readFileSync(new URL('../content/substack/2026/2026-06-07-vital-signs.md', import.meta.url), 'utf8');
  const canonical = 'https://hardeepanand.com/writing/vital-signs/';
  const html = addTakeawayActions(source, 'Your Capital Plan Needs a Glucose Monitor', canonical);
  const email = html.match(/href="mailto:([^\"]+)"/)[1].replaceAll('&amp;', '&');
  const params = new URLSearchParams(email.slice(email.indexOf('?') + 1));
  const body = params.get('body');
  assert.ok(body.includes('1. Ask what improved'));
  assert.ok(body.includes('5. Start with the records'));
  assert.ok(body.includes('One question to ask:'));
  assert.ok(body.includes(canonical));
  assert.ok(!body.includes('<strong>'));
  assert.ok(!body.includes('127.0.0.1'));
  assert.ok(html.includes('data-print-takeaways'));
  const share = html.match(/href="(https:\/\/www.linkedin.com\/sharing\/[^\"]+)"/)[1];
  assert.equal(new URL(share).searchParams.get('url'), canonical);
});
