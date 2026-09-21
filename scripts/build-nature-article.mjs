import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import postcss from 'postcss';
import sharp from 'sharp';

// Import only the owner-approved originals. Refuse a different source revision.
const stylesOnly = process.argv.includes('--styles-only');
const source = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || '/Users/apas/Documents/Github/hardeepanand-site');
const stem = '2026-09-21-nature-already-has-the-math';
const hash = value => createHash('sha256').update(value).digest('hex');
const expected = {
  html: '8f97fbb00a3ba45ec92ad2c83898cf46d286bd6728d1238088bc6ef245546af5',
  markdown: '5b9fdcec176f3d2ffc285d8dd88228138877e73442d9e13c9e021855f08664b7',
};
const html = readFileSync(resolve(source, `docs/article-drafts/${stem}-preview.html`), 'utf8');
const markdown = readFileSync(resolve(source, `docs/article-drafts/${stem}.md`), 'utf8');
if (hash(html) !== expected.html || hash(markdown) !== expected.markdown) throw new Error('Approved source hash mismatch');
if (resolve('.') === source) throw new Error('Run only in the isolated release worktree');
const write = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); };
const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value;
const doc = parse(html, { sourceCodeLocationInfo: true });
const nodes = walk(doc);
const exact = node => html.slice(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset);
const prose = nodes.find(n => n.tagName === 'section' && attr(n, 'class') === 'prose');
const body = html.slice(prose.sourceCodeLocation.startTag.endOffset, prose.sourceCodeLocation.endTag.startOffset);
if (!stylesOnly) write('src/assets/nature-already-has-the-math/article.html', body);

const style = nodes.find(n => n.tagName === 'style').childNodes[0].value;
const css = postcss.parse(style);
css.walkAtRules('import', rule => rule.remove());
css.walkRules(rule => {
  // PostCSS serializes [] as an empty selector that reads back as [''].
  // Remove shell-only rules before assigning the filtered selector list.
  const selectors = rule.selectors.map(s => s.trim()).filter(s => s && !/masthead|brand|draft-ribbon|avatar|byline|\.dek|\.kicker/.test(s) && !['body', 'html', '*'].includes(s));
  if (!selectors.length) { rule.remove(); return; }
  rule.selectors = selectors.map(s => {
    if (s === ':root') return '.post.nature-article';
    s = s.replaceAll('.prose', '.nature-prose');
    return s.includes('.article') ? s.replaceAll('.article', '.post.nature-article') : `.post.nature-article ${s}`;
  });
  for (const [index, selector] of rule.selectors.entries()) {
    if (selector.trim() === '.post.nature-article' && ![':root', '.article'].includes(selectors[index])) {
      throw new Error(`Unexpected article-root selector from ${selectors[index]}`);
    }
  }
});
css.walkDecls('letter-spacing', decl => { decl.value = '0'; });
const rootProperties = new Set(['max-width', 'margin', 'padding', 'padding-top', 'overflow-wrap']);
css.walkRules(rule => {
  if (!rule.selectors.includes('.post.nature-article')) return;
  rule.walkDecls(decl => {
    if (!decl.prop.startsWith('--') && !rootProperties.has(decl.prop)) {
      throw new Error(`Standalone shell declaration leaked to article root: ${decl.prop}`);
    }
  });
});
write('src/styles/nature-article.generated.css', css.toString());
if (stylesOnly) {
  console.log('Regenerated Nature styles only; article-root scoping guards passed.');
  process.exit(0);
}

// Normal Markdown stays available to the existing discovery/feed reader.
// Mermaid authoring diagrams belong to the saved original, not the public body.
const normalBody = markdown.replace(/^# Nature Already Has the Math\n\n_[^\n]+_\n\nHardeep Anand \| September 21, 2026\n\n/, '').replace(/```mermaid\n[\s\S]*?```\n\n/g, '');
const thesis = 'Utilities do not manage isolated assets. They manage relationships inside the water cycle.';
const takeaway = 'Ask the Feynman question: if this explanation is true, what else should also be true?';
write(`content/substack/2026/${stem}.md`, `---\ntitle: Nature Already Has the Math\ndeliverable: article\nstatus: PUBLISHED\npresentation: illustrated\nsubtitle: ${thesis}\nseo_description: ${thesis}\ntopic: Water & systems\nsummary: ${thesis}\nthesis: ${thesis}\ntakeaway: ${takeaway}\n---\n\n${normalBody}`);

const script = nodes.find(n => n.tagName === 'script').childNodes[0].value;
write('src/lib/nature-motion.js', script.replace("document.querySelectorAll('figure.figure')", "document.querySelectorAll('.nature-article figure.figure')").replace("document.querySelectorAll('.flow-trace')", "document.querySelectorAll('.nature-article .flow-trace')").replace("const paths = [...svg", "if (!svg) return;\n        const paths = [...svg"));

// SVG exports carry their own original palette and shape styles. Each export
// includes the shared marker definitions, since later desktop SVGs use them.
const originalCSS = postcss.parse(style);
const variables = {};
originalCSS.walkRules(':root', rule => rule.walkDecls(decl => { variables[decl.prop] = decl.value; }));
const shapes = [];
const shapeSelectors = new Set(['.node', '.node-strong', '.node-dark', '.node-warm', '.node-risk', '.label', '.small', '.tiny', '.on-dark', '.connector', '.connector-soft', '.connector-risk', '.water-band', '.ring']);
originalCSS.walkRules(rule => { if (rule.selectors.some(s => shapeSelectors.has(s))) shapes.push(rule.toString()); });
const sharedDefs = exact(nodes.find(n => n.tagName === 'defs'));
let standaloneStyle = shapes.join('\n').replace(/var\((--[\w-]+)\)/g, (_, key) => variables[key]);
standaloneStyle = standaloneStyle.replace('color-mix(in srgb, #f5f3ed 84%, #174bc5 16%)', '#d1d8e7').replace('color-mix(in srgb, #174bc5 13%, white 87%)', '#e1e8f7');
const assets = 'public/images/articles/nature-already-has-the-math';
const figures = nodes.filter(n => n.tagName === 'figure');
const manifest = { sourceHTML: expected.html, sourceMarkdown: expected.markdown, bodySHA256: hash(body), figures: [] };
for (const figure of figures) {
  const id = attr(figure, 'id');
  for (const svg of walk(figure).filter(n => n.tagName === 'svg')) {
    const mobile = attr(svg, 'class').includes('diagram-mobile');
    const name = `${id}${mobile ? '-mobile' : ''}`;
    const raw = exact(svg);
    let standalone = raw.replace(/^<svg\b[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${attr(svg, 'viewBox')}" role="img" aria-labelledby="${attr(svg, 'aria-labelledby')}">`);
    standalone = standalone.replace('>', `><style>${standaloneStyle}</style>${raw.includes('id="arrow"') ? '' : sharedDefs}`);
    standalone = standalone.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, key, fallback) => variables[key] || fallback);
    write(`${assets}/${name}.svg`, standalone);
    await sharp(Buffer.from(standalone), { density: 144 }).png().toFile(`${assets}/${name}.png`);
    manifest.figures.push({ id, composition: mobile ? 'phone' : 'desktop', sourceSVG: hash(raw), svg: `${name}.svg`, png: `${name}.png`, exportSHA256: hash(standalone) });
  }
}
write('src/assets/nature-already-has-the-math/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported exact approved body; exported ${manifest.figures.length} editable SVGs and PNGs.`);
