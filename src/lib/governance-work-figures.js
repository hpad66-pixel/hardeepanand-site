import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const figures = {
  'policy-to-work': {
    eyebrow: 'Fig. 01 / Where governance becomes real',
    title: 'The policy has to reach the decision',
    caption: 'The policy reaches the work when its requirements become usable checks at the decision.',
    note: 'Conceptual relationship, not a measured result from a utility program.',
  },
  'governance-control-path': {
    eyebrow: 'Fig. 02 / Governance in the workflow',
    title: 'Make the decision inspectable while it is being made',
    caption: 'Each control gives the next person something usable: evidence, responsibility, a quality assessment, a review, or a retained decision.',
    note: "Conceptual review path. A failed check returns work for correction or escalation under the utility's procedures.",
  },
  'data-ai-governance-meet': {
    eyebrow: 'Fig. 03 / One accountable decision',
    title: 'Data governance and AI governance meet where action is approved',
    caption: 'One maintenance decision needs both trustworthy inputs and a properly bounded use of AI. The reviewer connects those checks to an authorized action.',
    note: 'Conceptual convergence, not a sequence in which data approval automatically authorizes AI use.',
  },
  'governance-feedback-loop': {
    eyebrow: 'Fig. 04 / Test the correction',
    title: 'Check the correction, then return to the evidence',
    caption: 'A correction is not finished when the ticket closes. Check its effect in later work and use that evidence in the next review.',
    note: 'Proposed learning loop, not a measured outcome or a prescribed federal process.',
  },
};

export function inlineGovernanceWorkFigures(html) {
  for (const [id, meta] of Object.entries(figures)) {
    const read = suffix => readFileSync(resolve('public/images/articles/governance-must-live-inside-the-work', `${id}${suffix}.svg`), 'utf8');
    const markup = `<figure class="editorial-figure governance-figure" id="${id}"><div class="plate-surface"><p class="plate-eyebrow"><span>${meta.eyebrow}</span><span>The Systems Lens</span></p><h3>${meta.title}</h3><div class="diagram-stage" id="${id}-stage"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${id}-stage" aria-label="Replay ${meta.title} diagram" hidden>Replay diagram ↻</button></div><figcaption>${meta.caption}<span class="figure-note">${meta.note}</span></figcaption></figure>`;
    html = html.replace(new RegExp(`<figure class="editorial-figure governance-figure" id="${id}">[\\s\\S]*?<\\/figure>`), markup);
  }
  return html;
}
