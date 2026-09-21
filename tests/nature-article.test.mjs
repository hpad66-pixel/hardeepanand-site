import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseFragment, parse } from 'parse5';
import sharp from 'sharp';
import postcss from 'postcss';
import { readArticles, renderMarkdown, isVisible } from '../src/lib/content.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const body = read('src/assets/nature-already-has-the-math/article.html');
const manifest = JSON.parse(read('src/assets/nature-already-has-the-math/manifest.json'));
const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const normalize = value => value.replace(/\s+/g, ' ').trim();
const doc = parseFragment(body, { sourceCodeLocationInfo: true });
const nodes = walk(doc);
const article = readArticles(['substack/2026']).find(p => p.slug === 'nature-already-has-the-math');

test('Nature body is the exact approved reading fragment', () => {
  assert.equal(manifest.sourceHTML, '8f97fbb00a3ba45ec92ad2c83898cf46d286bd6728d1238088bc6ef245546af5');
  assert.equal(manifest.sourceMarkdown, '5b9fdcec176f3d2ffc285d8dd88228138877e73442d9e13c9e021855f08664b7');
  assert.equal(hash(body), manifest.bodySHA256);
  assert.equal(manifest.bodySHA256, '426a70d992d0af5fe5a52bb05b4cb544ce2ec578810916ea002c1f23ee5ee3cb');
  const original = '/Users/apas/Documents/Github/hardeepanand-site/docs/article-drafts/2026-09-21-nature-already-has-the-math-preview.html';
  if (existsSync(original)) {
    const saved = readFileSync(original, 'utf8');
    assert.equal(hash(saved), manifest.sourceHTML);
    assert.ok(saved.includes(body));
  }
});

test('Nature normal content preserves paragraphs, takeaways, links and examples behind the publication gate', () => {
  assert.equal(article.status, 'PUBLISHED');
  assert.ok(isVisible(article.status, true));
  assert.ok(!isVisible('DRAFT', true));
  assert.doesNotMatch(article.body, /<script|<svg|```mermaid|<style/);
  const markdownText = normalize(text(parseFragment(renderMarkdown(article.body))));
  for (const node of nodes.filter(n => ['p', 'li'].includes(n.tagName))) {
    assert.ok(markdownText.includes(normalize(text(node))), `Missing approved text: ${text(node)}`);
  }
  for (const heading of ['The pressure complaint', 'The plant loading spike', 'The capital plan']) assert.ok(markdownText.includes(heading));
  for (const link of nodes.filter(n => n.tagName === 'a')) assert.ok(article.body.includes(attr(link, 'href')));
  const raw = read('content/substack/2026/2026-09-21-nature-already-has-the-math.md');
  for (const field of ['topic: Water & systems', 'summary:', 'thesis:', 'takeaway:']) assert.ok(raw.includes(field));
});

test('Nature retains five anchors, ten exact SVG compositions and accessible unique IDs', () => {
  assert.deepEqual(nodes.filter(n => n.tagName === 'figure').map(n => attr(n, 'id')), ['fig-hydrologic', 'fig-storm', 'fig-algae', 'fig-ai-test', 'fig-framework']);
  const svgs = nodes.filter(n => n.tagName === 'svg');
  assert.equal(svgs.length, 10);
  const ids = nodes.map(n => attr(n, 'id')).filter(Boolean);
  assert.equal(ids.length, new Set(ids).size);
  for (const [index, svg] of svgs.entries()) {
    const loc = svg.sourceCodeLocation;
    assert.equal(hash(body.slice(loc.startOffset, loc.endOffset)), manifest.figures[index].sourceSVG);
    assert.equal(attr(svg, 'role'), 'img');
    for (const id of attr(svg, 'aria-labelledby').split(' ')) assert.ok(ids.includes(id));
  }
});

test('Nature standalone exports include styles, resolvable markers and nonblank PNGs', async () => {
  for (const figure of manifest.figures) {
    const base = 'public/images/articles/nature-already-has-the-math/';
    const svg = read(base + figure.svg);
    assert.equal(hash(svg), figure.exportSHA256);
    assert.match(svg, /<style>/);
    assert.doesNotMatch(svg, /var\(--|color-mix/);
    const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    for (const marker of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.has(marker[1]), `Missing marker ${marker[1]}`);
    const png = sharp(new URL(`../${base}${figure.png}`, import.meta.url).pathname);
    const metadata = await png.metadata();
    assert.equal(metadata.format, 'png');
    assert.ok(metadata.width >= 560 && metadata.height >= 1000);
    const stats = await png.stats();
    assert.ok(stats.channels.some(channel => channel.stdev > 20));
  }
});

test('Nature replay stays scoped and retains reduced-motion support', () => {
  const script = read('src/lib/nature-motion.js');
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /if \(reducedMotion.matches\) return/);
  assert.match(script, /duration: 650/);
  assert.match(script, /3100/);
  assert.match(script, /animation.onfinish = \(\) => trace.remove/);
  assert.match(script, /\.nature-article figure.figure/);
  assert.match(read('src/styles/nature-article.generated.css'), /prefers-reduced-motion/);
});

test('Nature style conversion cannot promote standalone shell declarations to the article root', () => {
  const css = postcss.parse(read('src/styles/nature-article.generated.css'));
  const allowed = new Set(['max-width', 'margin', 'padding', 'padding-top', 'background', 'color', 'overflow-wrap']);
  css.walkRules(rule => {
    assert.ok(rule.selectors.every(selector => selector.trim()), 'Empty selector');
    if (!rule.selectors.includes('.post.nature-article')) return;
    rule.walkDecls(decl => assert.ok(decl.prop.startsWith('--') || allowed.has(decl.prop), `Leaked root property ${decl.prop}`));
  });
});

const builtPath = new URL('../dist/writing/nature-already-has-the-math/index.html', import.meta.url);
test('Nature production route preserves exact visible reading text plus share controls', { skip: !existsSync(builtPath) }, () => {
  const built = readFileSync(builtPath, 'utf8');
  const builtNodes = walk(parse(built));
  const prose = builtNodes.find(n => hasClass(n, 'nature-prose'));
  assert.ok(prose);
  const readerText = node => {
    if (hasClass(node, 'takeaway-actions') || hasClass(node, 'takeaways-attribution')) return '';
    return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(readerText).join('');
  };
  assert.equal(normalize(readerText(prose)), normalize(text(doc)));
  assert.equal(walk(prose).filter(n => n.tagName === 'svg' && hasClass(n, 'diagram')).length, 10);
  assert.match(built, /data-print-takeaways/);
  assert.match(built, /mailto:\?subject=/);
  assert.match(built, /linkedin.com\/sharing\/share-offsite/);
  assert.doesNotMatch(built, /Local review|Unpublished|noindex|95\/100/);
});
