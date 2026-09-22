import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const figures = {
  'first-door-map': {
    eyebrow: 'Fig. 01 / The first door',
    title: 'The barrier comes before the appointment',
    caption: 'Cost, delay, stigma, timing, and pride can close the first door before a person reaches help.',
    note: 'Conceptual access map. It is not therapy, medical, legal, or crisis advice.',
  },
  'access-ledger': {
    eyebrow: 'Fig. 02 / The access ledger',
    title: 'The AI balance sheet has two sides',
    caption: 'A serious balance sheet counts job disruption and unmet need together: what changes for workers, and what help people were already not getting.',
    note: 'Conceptual comparison, not a measured offset or a claim that benefits cancel harms. The value claim depends on boundaries, quality, and human authority.',
  },
  'expert-knowledge-layer': {
    eyebrow: 'Fig. 03 / Expert judgment',
    title: 'Expert knowledge becomes a bounded first layer',
    caption: 'The responsible layer carries patterns, sources, limits, and handoffs into preparation. The human still carries judgment.',
    note: 'Conceptual workflow. It does not replace licensed or accountable professional work.',
  },
  'quality-floor': {
    eyebrow: 'Fig. 04 / The quality floor',
    title: 'A wider front door still needs rules',
    caption: 'Source grounding, consent, privacy, ownership, and escalation decide whether access becomes help or exposure.',
    note: 'Conceptual guardrail model. Applicable duties vary by setting and must be reviewed locally.',
  },
  'utility-knowledge-bridge': {
    eyebrow: 'Fig. 05 / Utility knowledge',
    title: 'Turn scattered memory into a decision packet',
    caption: 'The utility version of access is a source packet: SCADA trend, work order, permit condition, field note, capital history, and expert memory tied to authority.',
    note: 'Conceptual utility workflow. AI does not operate assets, replace SCADA, bypass escalation, or make final decisions.',
  },
  'learning-loop': {
    eyebrow: 'Fig. 06 / Workforce learning',
    title: 'Learning is a practice loop around real decisions',
    caption: 'OneWater Learn becomes useful when a recurring decision is rehearsed: build the case, organize sources and gaps, challenge it with humans, practice the handoff, and keep the record.',
    note: 'OneWater Learn is framed as a practice posture, not a credential, course claim, or enrollment promise.',
  },
};

export function inlineAiAccessFigures(html) {
  for (const [id, meta] of Object.entries(figures)) {
    const read = suffix => readFileSync(resolve('public/images/articles/the-question-missing-from-the-ai-jobs-debate', `${id}${suffix}.svg`), 'utf8');
    const markup = `<figure class="editorial-figure ai-access-figure" id="${id}"><div class="plate-surface"><p class="plate-eyebrow"><span>${meta.eyebrow}</span><span>The Systems Lens</span></p><h3>${meta.title}</h3><div class="diagram-stage" id="${id}-stage"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${id}-stage" aria-label="Replay ${meta.title} diagram" hidden>Replay diagram ↻</button></div><figcaption>${meta.caption}<span class="figure-note">${meta.note}</span></figcaption></figure>`;
    html = html.replace(new RegExp(`<figure class="editorial-figure ai-access-figure" id="${id}">[\\s\\S]*?<\\/figure>`), markup);
  }
  return html;
}
