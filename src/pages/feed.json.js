// Site-wide JSON Feed (1.1). Published content across Writing, the Lexicon, and the
// Minute, so other sites can syndicate or embed. Published only.
import { readArticles, readHtmlCollection } from '../lib/content.js';

export function GET(context) {
  const site = context.site?.href || 'https://hardeepanand.com/';
  const pub = (it) => it.status === 'PUBLISHED';
  const items = [];

  for (const p of readArticles(['substack/2026', 'linkedin/2026']).filter(pub)) {
    items.push({
      id: `${site}writing/${p.slug}/`,
      url: `${site}writing/${p.slug}/`,
      title: p.title,
      summary: p.description || undefined,
      date_published: p.date ? `${p.date}T00:00:00Z` : undefined,
      tags: ['The Systems Lens'],
    });
  }
  for (const t of readHtmlCollection('lexicon').filter(pub)) {
    items.push({ id: `${site}lexicon/${t.slug}.html`, url: `${site}lexicon/${t.slug}.html`, title: `${t.title} · OneWater Lexicon`, tags: ['OneWater Lexicon'] });
  }
  for (const m of readHtmlCollection('minutes/2026').filter(pub)) {
    items.push({ id: `${site}minute/${m.slug}.html`, url: `${site}minute/${m.slug}.html`, title: `${m.title} · OneWater Minute`, tags: ['OneWater Minute'] });
  }

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Hardeep Anand',
    home_page_url: site,
    feed_url: `${site}feed.json`,
    description: 'The work, the writing, and the teaching of Hardeep Anand. Every claim sourced.',
    items,
  };
  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'content-type': 'application/feed+json; charset=utf-8' },
  });
}
