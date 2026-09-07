import fs from 'node:fs';
import path from 'node:path';
import figures from '../data/companion-figures.json';
import { addTakeawayActions } from './takeaway-actions.js';
const takeaways = {
 'data-governance': [
 ['Start with a decision that matters.', 'Choose one operational or reporting use case and identify the datasets it depends on.'],
 ['Make ownership visible.', 'Record what each dataset means, who maintains it, and how an authorized colleague can access it.'],
 ['Trace the critical path.', 'Follow the data from its source through transformations to the report or model that uses it.'],
 ['Keep the record current.', 'Use change detection where practical and assign someone to review exceptions.'],
 ['Check the foundation before expanding AI.', 'Test whether the data and its controls are adequate for the intended decision.']
 ],
 'fifty-steps-back': [
 ['Choose one useful step back.', 'Start with a concrete problem such as inconsistent asset names instead of an organization-wide transformation.'],
 ['Keep each asset identifiable.', 'Give each physical asset a unique identity and connect its local names to that record.'],
 ['Capture the reasoning people carry.', 'Ask experienced operators to document what changed, why they acted, and what happened next.'],
 ['Learn through a supervised pilot.', 'Let staff compare AI outputs with operating reality while retaining control of consequential decisions.'],
 ['Measure before expanding.', 'Agree on a baseline and a useful result, then use the evidence to decide what to do next.']
 ]
};
export function illustrateCompanion(post) {
 const slug=post.path.split('/')[1], rows=figures[slug];if(!rows)return post.body;
 let i=0;
 let html=post.body.replace(/<p><img\b[\s\S]*?<\/p>/g,()=>{
  const row=rows[i++];if(!row)return '';
  const read=s=>fs.readFileSync(path.resolve(`public/images/articles/${slug}/${i}${s}.svg`),'utf8');
  return `<figure class="editorial-figure" id="figure-${i}"><div class="plate-surface"><div class="plate-eyebrow">Figure ${String(i).padStart(2,'0')}</div><h3>${row[0]}</h3><div class="diagram-stage" id="${slug}-stage-${i}"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${slug}-stage-${i}" hidden>Replay diagram ↻</button></div><figcaption>${row[3]}</figcaption></figure>`;
 });
 html=html.replaceAll('<blockquote class="pullquote">','<blockquote class="pullquote"><span class="pq-mark" aria-hidden="true">“</span>').replaceAll('<cite class="pq-cite">Hardeep Anand</cite>','<cite class="pq-cite"><span class="pq-name">Hardeep Anand</span><span class="pq-publication">The Systems Lens</span></cite>');
 html+=`<section class="article-takeaways" id="takeaways" aria-labelledby="takeaways-title"><h2 id="takeaways-title">What to take into your next meeting</h2><p class="takeaways-intro">Practical steps you can begin with the team you already have.</p><ol class="takeaways-list">${takeaways[slug].map(([h,p])=>`<li><strong>${h}</strong> ${p}</li>`).join('')}</ol><p class="takeaways-question"><strong>One question to ask:</strong> Which decision could we improve by understanding our existing records better?</p></section>`;
 return addTakeawayActions(html,post.title,`https://hardeepanand.com/${post.path}/`);
}
