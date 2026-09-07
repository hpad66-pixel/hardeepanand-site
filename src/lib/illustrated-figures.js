import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Only these checked-in SVGs may be inlined. Article uploads never enter this path.
const figures = [
  '01-snapshot-to-curve', '02-feedback-loop', '03-curve-test',
  '04-severed-loop', '05-connected-records',
];

export function inlineVitalSignsFigures(html) {
  for (const name of figures) {
    const read = (suffix) => readFileSync(resolve('public/images/articles/vital-signs/v3', `${name}${suffix}.svg`), 'utf8');
    const pattern = new RegExp(`<picture>\\s*<source[^>]*>\\s*<img[^>]*src="/images/articles/vital-signs/v3/${name}\\.svg"[^>]*>\\s*</picture>`);
    const stageId = `diagram-${name}`;
    const markup = `<div class="diagram-stage" id="${stageId}"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${stageId}" aria-label="Replay figure ${Number(name.slice(0,2))} animation" hidden>Replay diagram ↻</button>`;
    html = html.replace(pattern, markup);
  }
  return html;
}
