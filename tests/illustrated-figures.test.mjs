import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inlineVitalSignsFigures } from '../src/lib/illustrated-figures.js';

test('all five article figures inline responsive, theme-aware SVGs with unique references', () => {
  const article = readFileSync(new URL('../content/substack/2026/2026-06-07-vital-signs.md', import.meta.url), 'utf8');
  const html = inlineVitalSignsFigures(article);
  assert.equal((html.match(/class="vital-graphic"/g) || []).length, 10);
  assert.equal((html.match(/class="figure-replay"/g) || []).length, 5);
  assert.equal((html.match(/<picture>/g) || []).length, 0);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'SVG definitions must not collide between figures or breakpoints');
  for (const [, id] of html.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(id), `Missing marker ${id}`);
  for (const [, value] of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    for (const id of value.split(' ')) assert.ok(ids.includes(id), `Missing accessible label ${id}`);
  }
  assert.ok(html.includes('var(--bg, #f5f3ed)'));
  assert.ok(html.includes('var(--font-display,'));
  assert.ok(html.includes('var(--font-body,'));
  assert.ok(!html.includes('#EDF0F1'));
  assert.ok(html.includes('prefers-reduced-motion:reduce'));
  assert.ok(!html.includes('infinite'), 'Editorial animations should finish');
});

test('inlining leaves unrelated article and uploaded image markup untouched', () => {
  const other = '<picture><img src="/uploads/untrusted.svg" /></picture>';
  assert.equal(inlineVitalSignsFigures(other), other);
});
