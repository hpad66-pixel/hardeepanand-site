import { readArticles, readHtmlCollection, renderMarkdown } from '../lib/content.js';
import { publicPages } from '../lib/published.js';
export function GET(context) {
 const site=context.site?.href || 'https://hardeepanand.com/';
 const posts=readArticles(['substack/2026','linkedin/2026','owos/2026','author/2026']).filter(p=>p.status==='PUBLISHED');
 const items=posts.map(p=>({id:`${site}writing/${p.slug}/`,url:`${site}writing/${p.slug}/`,title:p.title,summary:p.description,content_html:renderMarkdown(p.body),date_published:p.date?`${p.date}T00:00:00Z`:undefined,tags:['The Systems Lens']}));
 for(const p of publicPages)items.push({id:`${site}${p.path}/`,url:`${site}${p.path}/`,title:p.title,content_html:p.body,summary:p.description,date_published:`${p.date}T00:00:00Z`,tags:[p.path.startsWith('climb/')?'The Second Climb':'The Systems Lens']});
 return Response.json({version:'https://jsonfeed.org/version/1.1',title:'Hardeep Anand',home_page_url:site,feed_url:`${site}feed.json`,description:'Water, infrastructure, and the intelligence that connects them.',items},{headers:{'content-type':'application/feed+json; charset=utf-8'}});
}
