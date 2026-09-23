import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { inlineHeadCloudsFigures } from '../src/lib/head-clouds-figures.js';

const articlePath = 'content/substack/2026/2026-09-21-head-in-the-clouds-is-not-an-insult.md';
const cssPath = 'src/styles/illustrated-essay.css';
const exportDir = 'public/images/articles/head-in-the-clouds-is-not-an-insult';

const figureIds = [
  'head-clouds-ground-sketch',
  'disruptor-proof-test',
  'utility-disruption-path',
  'adaptation-loop',
];

const files = figureIds.flatMap(id => [`${id}.svg`, `${id}-mobile.svg`]);

function attrs(source) {
  return Object.fromEntries(
    [...source.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])
  );
}

function stripTags(source) {
  return source.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
}

function estimateTextBoxes(source) {
  const boxes = [];
  const groups = [...source.matchAll(/<g class="vs-motion hc-reveal"[^>]*>([\s\S]*?)<\/g>/g)];
  for (const [groupIndex, [, group]] of groups.entries()) {
    const rectMatch = group.match(/<rect([^>]*)\/>/);
    if (!rectMatch) continue;
    const rect = attrs(rectMatch[1]);
    const bounds = {
      x: Number(rect.x),
      y: Number(rect.y),
      w: Number(rect.width),
      h: Number(rect.height),
    };
    const textMatches = [...group.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)];
    for (const [, attrSource, inner] of textMatches) {
      const attr = attrs(attrSource);
      const size = Number(attr['font-size'] || 16);
      const x = Number(attr.x);
      let y = Number(attr.y);
      const anchor = attr['text-anchor'] || 'start';
      const first = stripTags(inner.split('<tspan')[0]);
      const rows = first ? [{ value: first, y }] : [];
      for (const [, tspanAttrSource, tspanInner] of inner.matchAll(/<tspan([^>]*)>([\s\S]*?)<\/tspan>/g)) {
        const tspanAttr = attrs(tspanAttrSource);
        y += Number(tspanAttr.dy || Math.round(size * 1.25));
        rows.push({ value: stripTags(tspanInner), y });
      }
      for (const row of rows.filter(item => item.value)) {
        const width = row.value.length * size * 0.58;
        const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
        boxes.push({
          groupIndex,
          text: row.value,
          left,
          right: left + width,
          top: row.y - size * 0.72,
          bottom: row.y + size * 0.22,
          rect: bounds,
        });
      }
    }
  }
  return boxes;
}

test('head-in-the-clouds article keeps generated placeholders and an editorial pull quote', () => {
  const article = fs.readFileSync(articlePath, 'utf8');
  assert.equal((article.match(/class="editorial-figure head-clouds-figure"/g) || []).length, 4);
  assert.equal((article.match(/class="pullquote pullquote-dark"/g) || []).length, 1);
  assert.doesNotMatch(article, /<svg class="systems-graphic"/);
});

test('head-in-the-clouds generated figures inline with replay, motion and unique arrows', () => {
  const article = fs.readFileSync(articlePath, 'utf8');
  const rendered = inlineHeadCloudsFigures(article);
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.equal((rendered.match(/class="figure-replay"/g) || []).length, 4);
  assert.equal((rendered.match(/class="diagram-stage"/g) || []).length, 4);
  assert.match(rendered, /class="vs-motion hc-draw/);
  assert.match(rendered, /class="vs-motion hc-reveal/);
  assert.match(rendered, /class="vs-motion hc-pulse/);
  assert.doesNotMatch(css, /marker-end:\s*url\(#arrow\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);

  const markers = [...rendered.matchAll(/<marker id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(markers).size, markers.length);
  assert.ok(markers.length >= 8);
});

test('head-in-the-clouds generated SVGs are standalone and avoid overlong labels', () => {
  for (const file of files) {
    const svg = fs.readFileSync(`${exportDir}/${file}`, 'utf8');
    assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /<svg id="hc-/);
    assert.match(svg, /<title id="/);
    assert.match(svg, /<desc id="/);
    assert.match(svg, /<style>/);
    assert.match(svg, /@media\(prefers-reduced-motion:reduce\)/);
    assert.doesNotMatch(svg, /:root\s*\{/);
    if (svg.includes('var(--figure-deep')) {
      assert.match(svg, /var\(--figure-on-deep,#f5f3ed\)/);
      assert.match(svg, /var\(--figure-soft-on-deep,#bed0dc\)/);
    }

    const lines = [
      ...[...svg.matchAll(/<text[^>]*>([^<]*)/g)].map(match => match[1]),
      ...[...svg.matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map(match => match[1]),
    ].map(line => line.replace(/&amp;/g, '&').trim()).filter(Boolean);

    for (const line of lines) {
      assert.ok(line.length <= 38, `${file} has an overlong label line: ${line}`);
    }
  }
});

test('head-in-the-clouds desktop and mobile SVG labels stay inside their own boxes', () => {
  for (const file of files) {
    const svg = fs.readFileSync(`${exportDir}/${file}`, 'utf8');
    const failures = estimateTextBoxes(svg).filter(box => {
      const pad = file.endsWith('-mobile.svg') ? 5 : 7;
      return box.left < box.rect.x + pad
        || box.right > box.rect.x + box.rect.w - pad
        || box.top < box.rect.y + pad
        || box.bottom > box.rect.y + box.rect.h - pad;
    });
    assert.deepEqual(failures, [], `${file} has labels outside their own boxes`);

    const overlaps = [];
    const boxes = estimateTextBoxes(svg);
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.groupIndex !== b.groupIndex) continue;
        const horizontalOverlap = a.left < b.right - 2 && b.left < a.right - 2;
        const verticalOverlap = a.top < b.bottom + 2 && b.top < a.bottom + 2;
        if (horizontalOverlap && verticalOverlap) {
          overlaps.push([a.text, b.text]);
        }
      }
    }
    assert.deepEqual(overlaps, [], `${file} has overlapping label rows`);
  }
});

test('head-in-the-clouds figure CSS exposes dark-mode and reduced-motion contracts', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /--figure-deep:/);
  assert.match(css, /--figure-on-deep:/);
  assert.match(css, /--figure-soft-on-deep:/);
  assert.match(css, /\[data-theme='obsidian'\] \.illustrated-essay \.editorial-figure/);
  assert.match(css, /--figure-accent: #91b3ff/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.figure-replay \{ display: none; \}/);
});
