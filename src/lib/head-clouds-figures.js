import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = 'public/images/articles/head-in-the-clouds-is-not-an-insult';

const figures = {
  'head-clouds-ground-sketch': {
    eyebrow: 'Fig. 01 / Vision under test',
    title: 'Vision has to come back to the ground',
    caption: 'The insult only becomes useful when vision returns to evidence, people, authority, records, and an owned decision.',
    note: 'Conceptual utility scene, not a documented meeting or facility.',
    replay: 'Replay vision-to-ground diagram',
  },
  'disruptor-proof-test': {
    eyebrow: 'Fig. 02 / Burden of proof',
    title: 'Disruption earns credit only when it can show what improves',
    caption: 'The question is not whether disruption feels polite. The question is whether it makes a decision clearer, a risk visible, or human work easier to do well.',
    note: 'Conceptual editorial test, not a measured score or political rating.',
    replay: 'Replay burden-of-proof diagram',
  },
  'utility-disruption-path': {
    eyebrow: 'Fig. 03 / Utility test',
    title: 'Follow one decision back to its sources',
    caption: 'Useful disruption respects the people doing the work and changes the structure around the decision.',
    note: 'Illustrative operating path, not a documented utility procedure.',
    replay: 'Replay utility decision path',
  },
  'adaptation-loop': {
    eyebrow: 'Fig. 04 / Adaptation loop',
    title: 'Adaptation is repeated practice, not a speech about change',
    caption: 'Responsible adaptation loops through discomfort, sources, practice, correction, and modeled learning.',
    note: 'Conceptual learning loop, not a measured training outcome.',
    replay: 'Replay adaptation loop',
  },
};

export function inlineHeadCloudsFigures(html) {
  for (const [id, meta] of Object.entries(figures)) {
    const read = suffix => readFileSync(resolve(base, `${id}${suffix}.svg`), 'utf8');
    const stageId = `${id}-stage`;
    const markup = `<figure class="editorial-figure head-clouds-figure" id="${id}"><div class="plate-surface"><p class="plate-eyebrow"><span>${meta.eyebrow}</span><span>The Systems Lens</span></p><h3>${meta.title}</h3><div class="diagram-stage" id="${stageId}"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${stageId}" aria-label="${meta.replay}" hidden>Replay diagram ↻</button></div><figcaption>${meta.caption}<span class="figure-note">${meta.note}</span></figcaption></figure>`;
    html = html.replace(new RegExp(`<figure class="editorial-figure head-clouds-figure" id="${id}">[\\s\\S]*?<\\/figure>`), markup);
  }
  return html;
}
