import {readFileSync} from 'node:fs';
const recovered = JSON.parse(readFileSync(new URL('../../content/published-pages.json',import.meta.url),'utf8'));
import { readArticles, isVisible } from './content.js';
export const articleFolders = ['substack/2026','linkedin/2026','owos/2026','author/2026'];
const editorial = {
 'governance-at-operating-speed': { topic:'AI & governance', visual:'governance', takeaway:'Connect one exposure to its owner, funding, and a verified result.', summary:'How we can connect cyber exposure, budgets, and shared responsibility—and build the capability to act together.' },
 'governance-must-live-inside-the-work': { topic:'AI & governance', visual:'governance', takeaway:'Make one recurring decision inspectable before writing another policy.', summary:'How governance becomes real when sources, owners, checks, judgment, and approval records live inside daily work.' },
 'head-in-the-clouds-is-not-an-insult': { topic:'Ideas & practice', visual:'clouds', takeaway:'Use discomfort to test whether vision is becoming useful work.', summary:'A personal Systems Lens essay on disruption, comfort, AI adaptation, and the discipline of bringing vision back to the ground.' },
 'vital-signs': { topic:'Water & systems', visual:'curve', takeaway:'Follow the operating curve before and after the investment.', summary:'A capital plan tells us what we spent. The operating curve helps us ask what changed for the system.' },
 'data-governance': { topic:'AI & governance', visual:'connections', takeaway:'Give each critical record an identity, an owner, and a traceable history.', summary:'From knowledge held by a few people to evidence the whole utility can find, understand, and use.' },
 'fifty-steps-back': { topic:'AI & governance', visual:'steps', takeaway:'Choose one decision. Understand its data before introducing AI.', summary:'A practical case for understanding the foundations before accelerating—and making every step forward count.' },
 'adapt-dont-pivot': { topic:'Life & learning', visual:'weave', takeaway:'Weave your experience and new tools into one useful workflow.', summary:'Our experience comes with us. Continuous learning helps us put it to work in new ways.' },
 'in-your-head': { topic:'Life & learning', visual:'loop', takeaway:'Name the thought, choose a manageable action, and define what done means.', summary:'A personal reflection on moving from a circling thought to a next step we can take—or ask for help with.' },
};
export function readingLibrary(prod = false) {
 const candidates=[...readArticles(articleFolders).map(p=>({...p,path:`writing/${p.slug}`})),...recovered];
 const unique=new Map();
 for(const p of candidates){
  if(!isVisible(p.status,prod)||! /^(writing|climb)\//.test(p.path))continue;
  const slug=p.path.split('/').at(-1);
  const words=p.body.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;
  const defaults=editorial[slug]||{};
  unique.set(p.path,{...p,slug,href:`/${p.path}/`,readMin:Math.max(1,Math.round(words/220)),
   topic:p.topic||defaults.topic||'Ideas & practice',
   visual:p.visual||defaults.visual||'connections',
   takeaway:p.takeaway||defaults.takeaway||'Explore the practical questions and next steps in this essay.',
   summary:p.summary||defaults.summary||p.description});
 }
 return [...unique.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
}
