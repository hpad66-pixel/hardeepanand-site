import fs from 'node:fs';

const out = 'public/images/articles/head-in-the-clouds-is-not-an-insult';
fs.mkdirSync(out, { recursive: true });

const C = {
  bg: 'var(--bg,#f5f3ed)',
  paper: 'var(--surface,#f5f3ed)',
  ink: 'var(--text,#092b3e)',
  muted: 'var(--text-dim,#52616a)',
  line: 'var(--line,#d4d9d7)',
  blue: 'var(--figure-accent,#174bc5)',
  deep: 'var(--figure-deep,var(--deep,#092b3e))',
  onDeep: 'var(--figure-on-deep,#f5f3ed)',
  softOnDeep: 'var(--figure-soft-on-deep,#bed0dc)',
};

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const font = serif => `font-family:var(${serif ? "--font-display,'Newsreader',Georgia,serif" : "--font-body,'Inter',Arial,sans-serif"})`;
const text = (x, y, rows, {
  size = 16,
  color = C.ink,
  anchor = 'middle',
  serif = false,
  weight = 400,
  gap = 1.25,
  cls = '',
} = {}) => {
  const list = Array.isArray(rows) ? rows : [rows];
  const [first, ...rest] = list;
  return `<text${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" style="${font(serif)};letter-spacing:0">${esc(first)}${rest.map(row => `<tspan x="${x}" dy="${Math.round(size * gap)}">${esc(row)}</tspan>`).join('')}</text>`;
};
const box = (x, y, w, h, { fill = C.paper, stroke = C.line, rx = 14, cls = '' } = {}) =>
  `<rect${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const line = (d, { color = C.blue, width = 2.6, arrow = '', delay = 0, soft = false } = {}) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="vs-motion hc-draw${soft ? ' hc-soft' : ''}" style="animation-delay:${delay}s"${arrow ? ` marker-end="url(#${arrow})"` : ''}/>`;
const reveal = (body, delay = 0) => `<g class="vs-motion hc-reveal" style="animation-delay:${delay}s">${body}</g>`;
const pulse = (body, delay = 0) => `<g class="vs-motion hc-pulse" style="animation-delay:${delay}s">${body}</g>`;
const arrow = id => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="${C.blue}"/></marker>`;

const style = `<style>
.hc-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:hc-draw 3.4s ease both}
.hc-reveal{opacity:1;animation:hc-reveal .9s ease both;transform-box:fill-box;transform-origin:center}
.hc-pulse{animation:hc-pulse 3.8s ease both;transform-box:fill-box;transform-origin:center}
.hc-soft{stroke:var(--line,#d4d9d7)}
@keyframes hc-draw{0%,12%{stroke-dashoffset:1}82%,100%{stroke-dashoffset:0}}
@keyframes hc-reveal{0%{opacity:.08;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes hc-pulse{0%{opacity:.45;transform:scale(.98)}35%,100%{opacity:1;transform:scale(1)}}
@media(prefers-reduced-motion:reduce){.vs-motion{animation:none!important}}
</style>`;

function svg({ id, width, height, title, desc, body }) {
  return `<svg id="${id}" class="systems-graphic head-clouds-graphic" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" style="font-family:var(--font-body,Inter,Arial,sans-serif)">${style}<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc><defs>${arrow(`${id}-arrow`)}</defs>${body}</svg>`;
}

function cloudsGround(mobile = false) {
  const w = mobile ? 380 : 820;
  const h = mobile ? 630 : 410;
  const id = `hc-ground-${mobile ? 'm' : 'w'}`;
  let b = '';
  if (mobile) {
    b += reveal(`<path d="M75 86 C50 56 91 30 126 50 C145 14 205 26 208 67 C250 58 282 96 258 126 H80 C48 126 48 98 75 86 Z" fill="color-mix(in srgb, ${C.blue} 13%, transparent)" stroke="${C.blue}" stroke-width="2.4"/>${text(168, 82, 'Vision', { size: 32, color: C.blue, serif: true, weight: 500 })}${text(168, 112, 'what the system could become', { size: 13, color: C.muted })}`, 0);
    b += line('M168 132 V168', { arrow: `${id}-arrow`, delay: .35 });
    b += reveal(box(50, 172, 280, 134, { stroke: C.blue }) + text(190, 207, ['Ground test', 'evidence · people', 'authority'], { size: 22, serif: true, gap: 1.17 }) + text(190, 291, 'not just a speech', { size: 13, color: C.muted }), .6);
    const cards = [['Records', 'what can be traced'], ['People', 'who carries judgment'], ['Decision', 'what someone owns']];
    cards.forEach(([head, sub], i) => {
      const y = 352 + i * 98;
      const previousBottom = i === 0 ? 306 : 352 + (i - 1) * 98 + 70;
      b += line(`M190 ${previousBottom + 8} V${y - 10}`, { arrow: `${id}-arrow`, delay: 1 + i * .25 });
      b += reveal(box(48, y, 284, 70, { fill: 'color-mix(in srgb, var(--bg,#f5f3ed) 88%, var(--figure-accent,#174bc5) 12%)' }) + text(190, y + 30, head, { size: 20, weight: 700 }) + text(190, y + 54, sub, { size: 13, color: C.muted }), 1.25 + i * .25);
    });
  } else {
    b += `<path d="M0 330 C112 300 212 340 322 318 C462 292 553 352 690 314 C760 294 790 304 820 292 L820 410 L0 410 Z" fill="color-mix(in srgb, ${C.blue} 8%, transparent)"/>`;
    b += reveal(`<path d="M88 110 C52 70 110 35 158 62 C183 12 264 29 266 86 C326 76 365 130 329 168 H92 C50 168 50 124 88 110 Z" fill="color-mix(in srgb, ${C.blue} 13%, transparent)" stroke="${C.blue}" stroke-width="2.5"/>${text(208, 102, 'Vision', { size: 36, color: C.blue, serif: true, weight: 500 })}${text(208, 136, 'what the system could become', { size: 14, color: C.muted })}`, 0);
    b += line('M335 136 C390 138 430 130 492 128', { arrow: `${id}-arrow`, delay: .35 });
    b += reveal(box(480, 64, 262, 160, { fill: C.deep, stroke: C.deep, rx: 18 }) + text(611, 102, ['Ground test', 'evidence', 'people', 'authority'], { size: 26, color: C.onDeep, serif: true, gap: 1.05 }) + text(611, 204, 'not just a speech', { size: 13, color: C.softOnDeep }), .55);
    const cards = [[92, 260, 'Records', 'what can be traced'], [306, 260, 'People', 'who carries judgment'], [520, 260, 'Decision', 'what someone owns']];
    cards.forEach(([x, y, head, sub], i) => {
      b += reveal(box(x, y, 178, 86, { fill: 'color-mix(in srgb, var(--bg,#f5f3ed) 88%, var(--figure-accent,#174bc5) 12%)' }) + text(x + 89, y + 36, head, { size: 21, weight: 700 }) + text(x + 89, y + 64, sub, { size: 13, color: C.muted }), 1.05 + i * .25);
      if (i > 0) b += line(`M${x - 36} ${y + 43} H${x - 6}`, { arrow: `${id}-arrow`, delay: 1.05 + i * .25 });
    });
    b += line('M611 224 C610 240 623 252 645 260', { arrow: `${id}-arrow`, delay: .9 });
  }
  return svg({ id, width: w, height: h, title: 'Vision returning to ground-level utility work', desc: 'Conceptual illustration showing vision tested by evidence, people, authority, records, and an owned decision.', body: b });
}

function proofTest(mobile = false) {
  const w = mobile ? 380 : 820;
  const h = mobile ? 640 : 430;
  const id = `hc-proof-${mobile ? 'm' : 'w'}`;
  let b = '';
  if (mobile) {
    const stages = [
      [46, 28, 288, 76, C.deep, C.deep, ['Disruptive move', 'pressure enters the room'], C.onDeep],
      [46, 148, 288, 86, 'color-mix(in srgb, var(--figure-accent,#174bc5) 12%, transparent)', C.blue, ['Burden of proof', 'what improves, who owns it'], C.ink],
      [46, 282, 288, 104, C.paper, C.line, ['If it cannot answer', 'noise, heat, reaction'], C.ink],
      [46, 434, 288, 128, 'color-mix(in srgb, var(--figure-accent,#174bc5) 14%, var(--bg,#f5f3ed))', C.blue, ['If it can answer', 'clearer decision · visible risk', 'better human work'], C.ink],
    ];
    stages.forEach(([x, y, bw, bh, fill, stroke, rows, color], i) => {
      b += reveal(box(x, y, bw, bh, { fill, stroke, rx: 16 }) + text(190, y + 34, rows[0], { size: 21, color, weight: 700 }) + text(190, y + 61, rows.slice(1), { size: 14, color: color === C.onDeep ? C.softOnDeep : C.muted }), i * .55);
      if (i < stages.length - 1) b += line(`M190 ${y + bh + 4} V${stages[i + 1][1] - 6}`, { arrow: `${id}-arrow`, delay: .25 + i * .55 });
    });
  } else {
    b += reveal(box(286, 36, 248, 80, { fill: C.deep, stroke: C.deep, rx: 18 }) + text(410, 69, 'Disruptive move', { size: 22, color: C.onDeep, weight: 700 }) + text(410, 96, 'pressure enters the room', { size: 14, color: C.softOnDeep }), 0);
    b += line('M410 118 V158', { arrow: `${id}-arrow`, delay: .35 });
    b += reveal(box(226, 156, 368, 92, { fill: 'color-mix(in srgb, var(--figure-accent,#174bc5) 12%, transparent)', stroke: C.blue, rx: 17 }) + text(410, 194, ['Can it carry', 'a burden of proof?'], { size: 23, weight: 700, gap: 1.08 }), .7);
    b += line('M226 202 H132 V270', { arrow: `${id}-arrow`, delay: 1.05 });
    b += line('M594 202 H688 V270', { arrow: `${id}-arrow`, delay: 1.05 });
    b += reveal(box(36, 270, 192, 112, { fill: C.paper, stroke: C.line }) + text(132, 312, 'No', { size: 24, weight: 700 }) + text(132, 342, ['heat without', 'a better decision'], { size: 14, color: C.muted }), 1.5);
    b += reveal(box(592, 270, 192, 112, { fill: 'color-mix(in srgb, var(--figure-accent,#174bc5) 14%, var(--bg,#f5f3ed))', stroke: C.blue }) + text(688, 312, 'Yes', { size: 24, weight: 700 }) + text(688, 342, ['evidence, ownership', 'and follow-through'], { size: 14, color: C.muted }), 1.7);
    b += reveal(box(292, 264, 236, 124, { fill: C.paper, stroke: C.line }) + text(410, 298, 'Five checks', { size: 16, color: C.blue, weight: 700 }) + text(410, 324, ['What gets fixed?', 'What evidence improves?', 'Who can act?', 'What risk becomes visible?'], { size: 13, color: C.muted, gap: 1.2 }), 2.05);
  }
  return svg({ id, width: w, height: h, title: 'Burden-of-proof test for useful disruption', desc: 'A conceptual diagram showing how disruption becomes noise when it cannot answer what improves, and useful movement when it creates evidence, ownership, and follow-through.', body: b });
}

function utilityPath(mobile = false) {
  const w = mobile ? 380 : 820;
  const h = mobile ? 690 : 430;
  const id = `hc-utility-${mobile ? 'm' : 'w'}`;
  let b = '';
  if (mobile) {
    const steps = [['Scattered records', 'work orders · notes · capital plan'], ['Source packet', 'what is missing and who owns it'], ['Authority check', 'who can act and explain why'], ['Better decision', 'clear enough for someone to own']];
    steps.forEach(([head, sub], i) => {
      const y = 34 + i * 150;
      const dark = i === 3;
      b += reveal(box(42, y, 296, i === 3 ? 108 : 96, { fill: dark ? C.deep : i === 1 ? 'color-mix(in srgb, var(--figure-accent,#174bc5) 12%, transparent)' : C.paper, stroke: dark ? C.deep : i === 1 ? C.blue : C.line, rx: 17 }) + text(190, y + 41, head, { size: 22, color: dark ? C.onDeep : C.ink, weight: 700 }) + text(190, y + 70, sub, { size: 14, color: dark ? C.softOnDeep : C.muted }), i * .55);
      if (i < steps.length - 1) b += line(`M190 ${y + (i === 3 ? 108 : 96) + 6} V${y + 144}`, { arrow: `${id}-arrow`, delay: .35 + i * .55 });
    });
  } else {
    const sources = [[36, 48, 'Work orders', 'what was done'], [36, 164, 'Operator notes', 'what was seen'], [36, 280, 'Capital plan', 'what is funded']];
    sources.forEach(([x, y, head, sub], i) => {
      b += reveal(box(x, y, 178, 82, { fill: C.paper }) + text(x + 89, y + 34, head, { size: 18, weight: 700 }) + text(x + 89, y + 58, sub, { size: 13, color: C.muted }), i * .15);
      b += line(`M214 ${y + 41} C252 ${y + 41} 278 104 318 116`, { arrow: `${id}-arrow`, delay: .55 + i * .15 });
    });
    b += reveal(box(318, 70, 224, 118, { fill: 'color-mix(in srgb, var(--figure-accent,#174bc5) 12%, transparent)', stroke: C.blue, rx: 18 }) + text(430, 112, 'Source packet', { size: 24, weight: 700 }) + text(430, 142, ['missing record', 'owner · risk', 'next action'], { size: 14, color: C.muted, gap: 1.2 }), 1.05);
    b += line('M430 190 V254', { arrow: `${id}-arrow`, delay: 1.45 });
    b += reveal(box(318, 256, 224, 104, { fill: C.paper, stroke: C.line, rx: 18 }) + text(430, 292, 'Authority check', { size: 23, weight: 700 }) + text(430, 322, ['who can act', 'and explain why'], { size: 14, color: C.muted, gap: 1.2 }), 1.85);
    b += line('M542 308 C600 296 626 252 664 228', { arrow: `${id}-arrow`, delay: 2.25 });
    b += reveal(box(664, 148, 132, 168, { fill: C.deep, stroke: C.deep, rx: 20 }) + text(730, 204, ['Better', 'decision'], { size: 24, color: C.onDeep, serif: true, gap: 1.05 }) + text(730, 260, ['clear enough', 'to own'], { size: 13, color: C.softOnDeep }), 2.75);
  }
  return svg({ id, width: w, height: h, title: 'Utility source-to-decision path', desc: 'A conceptual utility diagram following scattered records into a source packet, authority check, and owned pump-station decision.', body: b });
}

function adaptationLoop(mobile = false) {
  const w = mobile ? 380 : 820;
  const h = mobile ? 690 : 430;
  const id = `hc-adapt-${mobile ? 'm' : 'w'}`;
  let b = '';
  if (mobile) {
    const steps = [['Discomfort', 'the old way strains'], ['Check sources', 'no source, no trust'], ['Practice', 'use the tool carefully'], ['Correct', 'change the workflow'], ['Model learning', 'before asking for it']];
    steps.forEach(([head, sub], i) => {
      const y = 30 + i * 124;
      const dark = i === 4;
      b += reveal(box(48, y, 284, 82, { fill: dark ? C.deep : C.paper, stroke: dark ? C.deep : C.line, rx: 16 }) + text(190, y + 34, head, { size: 21, color: dark ? C.onDeep : C.ink, weight: 700 }) + text(190, y + 60, sub, { size: 14, color: dark ? C.softOnDeep : C.muted }), i * .45);
      if (i < steps.length - 1) b += line(`M190 ${y + 84} V${y + 120}`, { arrow: `${id}-arrow`, delay: .25 + i * .45 });
    });
  } else {
    const steps = [[72, 74, 'Discomfort', 'the old way strains'], [548, 74, 'Check sources', 'no source, no trust'], [548, 276, 'Practice', 'use the tool carefully'], [72, 276, 'Correct', 'change the workflow']];
    b += pulse(`<circle cx="410" cy="216" r="92" fill="color-mix(in srgb, ${C.blue} 10%, transparent)" stroke="${C.blue}" stroke-width="2"/>${text(410, 208, 'Adaptation', { size: 25, weight: 700 })}${text(410, 236, 'practice with judgment', { size: 14, color: C.muted })}`, 1.15);
    steps.forEach(([x, y, head, sub], i) => {
      b += reveal(box(x, y, 200, 86, { fill: C.paper, stroke: C.line }) + text(x + 100, y + 35, head, { size: 20, weight: 700 }) + text(x + 100, y + 61, sub, { size: 14, color: C.muted }), i * .55);
    });
    b += line('M272 117 C340 84 480 84 548 117', { arrow: `${id}-arrow`, delay: .35 });
    b += line('M648 160 C710 204 710 248 648 276', { arrow: `${id}-arrow`, delay: .9 });
    b += line('M548 319 C480 352 340 352 272 319', { arrow: `${id}-arrow`, delay: 1.45 });
    b += line('M172 276 C110 238 110 197 172 160', { arrow: `${id}-arrow`, delay: 2 });
  }
  return svg({ id, width: w, height: h, title: 'Responsible adaptation loop', desc: 'A conceptual feedback loop showing discomfort, source checking, practice, correction, and modeled learning.', body: b });
}

const figures = [
  ['head-clouds-ground-sketch', cloudsGround],
  ['disruptor-proof-test', proofTest],
  ['utility-disruption-path', utilityPath],
  ['adaptation-loop', adaptationLoop],
];

for (const [name, fn] of figures) {
  fs.writeFileSync(`${out}/${name}.svg`, `${fn(false)}\n`);
  fs.writeFileSync(`${out}/${name}-mobile.svg`, `${fn(true)}\n`);
}

console.log(`Built ${figures.length} head-in-the-clouds figure families.`);
