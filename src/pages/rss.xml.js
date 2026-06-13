// The Systems Lens RSS feed. Published essays only, always (a feed is a published-content
// concept, so it ignores the dev preview and lists only status: PUBLISHED).
import { readArticles } from '../lib/content.js';

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rfc822(d) {
  if (!d) return '';
  return new Date(`${d}T00:00:00Z`).toUTCString();
}

export function GET(context) {
  const site = context.site?.href || 'https://hardeepanand.com/';
  const posts = readArticles(['substack/2026', 'linkedin/2026']).filter((p) => p.status === 'PUBLISHED');
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site}writing/${p.slug}/</link>
      <guid isPermaLink="true">${site}writing/${p.slug}/</guid>
      ${p.date ? `<pubDate>${rfc822(p.date)}</pubDate>` : ''}
      <description>${esc(p.description)}</description>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Systems Lens · Hardeep Anand</title>
    <link>${site}writing/</link>
    <atom:link href="${site}rss.xml" rel="self" type="application/rss+xml" />
    <description>Essays on reading infrastructure like a living system. Every claim sourced.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
