import { readArticles, readHtmlCollection, renderMarkdown } from '../lib/content.js';
import { publicPages } from '../lib/published.js';
import { terms } from '../data/lexicon.js';
export function GET(context) {
 const site=context.site?.href || 'https://hardeepanand.com/';
 const posts=readArticles(['substack/2026','linkedin/2026','owos/2026','author/2026']).filter(p=>p.status==='PUBLISHED');
 const items=posts.map(p=>({id:`${site}writing/${p.slug}/`,url:`${site}writing/${p.slug}/`,title:p.title,summary:p.description,content_html:renderMarkdown(p.body),date_published:p.date?`${p.date}T00:00:00Z`:undefined,tags:['The Systems Lens']}));
 for(const p of publicPages)items.push({id:`${site}${p.path}/`,url:`${site}${p.path}/`,title:p.title,content_html:p.body,summary:p.description,date_published:`${p.date}T00:00:00Z`,tags:[p.path.startsWith('climb/')?'The Second Climb':'The Systems Lens']});
 for(const t of terms)items.push({id:`${site}lexicon/${t.slug}/`,url:`${site}lexicon/${t.slug}/`,title:t.title,content_text:t.definition,summary:t.description,tags:['OneWater Lexicon']});
 items.push({id:`${site}minute/cybernetics/`,url:`${site}minute/cybernetics/`,title:'A reading is only the beginning.',content_text:'A sensor gives you a reading. A feedback loop helps you decide what to do next.',tags:['OneWater Minute']});
 for(const [folder,path,tag] of [['lexicon','lexicon','OneWater Lexicon'],['minutes/2026','minute','OneWater Minute']])for(const p of readHtmlCollection(folder).filter(p=>p.status==='PUBLISHED'))items.push({id:`${site}${path}/${p.slug}.html`,url:`${site}${path}/${p.slug}.html`,title:p.title,content_text:p.title,tags:[tag]});
 return Response.json({version:'https://jsonfeed.org/version/1.1',title:'Hardeep Anand',home_page_url:site,feed_url:`${site}feed.json`,description:'Water, infrastructure, and the intelligence that connects them.',items},{headers:{'content-type':'application/feed+json; charset=utf-8'}});
}
