import { readArticles, readHtmlCollection } from '../lib/content.js';
import { publicPages } from '../lib/published.js';
import { terms } from '../data/lexicon.js';
export function GET(){
 const paths=['/','/about/','/writing/','/climb/','/case-studies/','/ai-watch/','/lexicon/','/minute/','/summits/','/work/','/minute/cybernetics/',...terms.map(t=>`/lexicon/${t.slug}/`),...publicPages.map(p=>`/${p.path}/`),...readArticles(['substack/2026','linkedin/2026','owos/2026','author/2026']).filter(p=>p.status==='PUBLISHED').map(p=>`/writing/${p.slug}/`)];
 for(const [folder,path] of [['lexicon','lexicon'],['minutes/2026','minute']])for(const p of readHtmlCollection(folder).filter(p=>p.status==='PUBLISHED'))paths.push(`/${path}/${p.slug}.html`);
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(p=>`<url><loc>https://hardeepanand.com${p}</loc></url>`).join('')}</urlset>`,{headers:{'content-type':'application/xml; charset=utf-8'}});
}
