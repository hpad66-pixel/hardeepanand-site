import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { addTakeawayActions } from './takeaway-actions.js';
const essays = {
 'climb/adapt-dont-pivot': {
  figures:[
   ['carry-the-map','Your experience comes with you.','Drop what you were. Become someone else.','A new direction can build on the route you have already travelled. The earlier climb stays on the map.'],
   ['old-judgment-new-tools','Weave what you know into what you learn.','The useful result matters more than the number of tools involved.','Experience guides the question. Learning helps you connect the tools. Practice shows what works and what you need to learn next.']
  ],
  takeaways:[['Start with your experience.','Choose a task or decision you already understand well enough to judge the result. Your judgment is the starting point.'],['Learn the foundations.','Understand what an AI tool can do, where it can fail, and how to check its output before relying on it.'],['Build one connected workflow.','Link a few useful steps around a real task. Define the input, the handoff between tools, and the point where you make the decision.'],['Practice and review.','Try a small example, compare the result with your expectations, and record what needs to improve.'],['Keep a learning rhythm.','Set aside regular time to learn and apply something. Use the gaps you discover to choose your next lesson or ask the academy for guidance.']],
  question:'What do I already know—and what could I learn next to put it to work in a new way?'
 },
 'climb/in-your-head': {
  figures:[
   ['leave-the-loop','Give the thought a way out.','transacting with your own fear.','A thought can circle without changing the situation. Choose a next step within your control; when you need support, asking for it is an action too.'],
   ['open-the-gate','A list is a start. Closing the loop is the work.','now you are living in your head on that one thing, indefinitely.','Define what completion means. Do the task, make a clear handoff, or consciously release what is outside your responsibility.']
  ],
  takeaways:[['Give the thought a name.','Describe the specific question or task instead of carrying a vague collection of worries.'],['Choose a manageable next step.','Decide what you can do, who can help, and when you will revisit the issue.'],['Define a stopping point.','Make it clear what would count as done, handed over, or deliberately set aside. A longer list is not the same as progress.']],
  question:'What is one thing I can move forward—or ask for help with—today?'
 }
};
export function illustrateSecondClimb(post){
 const config=essays[post.path];if(!config)return post.body;
 const slug=post.path.split('/')[1];let html=post.body;
 config.figures.forEach(([name,title,anchor,caption],i)=>{
  const start=html.indexOf(anchor);if(start<0)throw new Error(`Missing editorial anchor: ${post.path}/${name}`);
  const end=html.indexOf('</p>',start)+4;
  const read=suffix=>readFileSync(resolve(`public/images/articles/${slug}/${name}${suffix}.svg`),'utf8');
  const id=`${slug}-${name}`;
  const figure=`<figure class="editorial-figure climb-illustration" id="figure-${i+1}"><div class="plate-surface"><div class="plate-eyebrow">The Systems Lens · ${String(i+1).padStart(2,'0')}</div><h3>${title}</h3><div class="diagram-stage" id="${id}"><div class="diagram-wide">${read('')}</div><div class="diagram-mobile">${read('-mobile')}</div></div><button class="figure-replay" type="button" aria-controls="${id}" hidden>Replay illustration ↻</button></div><figcaption>${caption}</figcaption></figure>`;
  html=html.slice(0,end)+figure+html.slice(end);
 });
 html=html.replaceAll('<blockquote class="pullquote">','<blockquote class="pullquote"><span class="pq-mark" aria-hidden="true">“</span>').replaceAll('<cite class="pq-cite">Hardeep Anand</cite>','<cite class="pq-cite"><span class="pq-name">Hardeep Anand</span><span class="pq-publication">The Systems Lens</span></cite>');
 html+=`<section class="article-takeaways" id="takeaways" aria-labelledby="takeaways-title"><h2 id="takeaways-title">A few things to put into practice</h2><p class="takeaways-intro">A few things to carry into the week.</p><ol class="takeaways-list">${config.takeaways.map(([h,p])=>`<li><strong>${h}</strong> ${p}</li>`).join('')}</ol><p class="takeaways-question"><strong>A question to carry:</strong> ${config.question}</p></section>`;
 return addTakeawayActions(html,post.title,`https://hardeepanand.com/${post.path}/`,'The Systems Lens');
}
