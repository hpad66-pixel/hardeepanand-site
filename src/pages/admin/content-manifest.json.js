import { readingLibrary } from '../../lib/reading-library.js';

export function GET() {
  const items = readingLibrary(false).map((post) => ({
    path: post.path,
    href: post.href,
    slug: post.slug,
    title: post.title,
    topic: post.topic,
    summary: post.summary || post.description || '',
    takeaway: post.takeaway || '',
    date: post.date || '',
    readMin: post.readMin,
    sourceStatus: post.status,
    source: post.path.startsWith('climb/') ? 'Recovered public page' : 'Markdown article',
    channel: 'The Systems Lens',
  }));
  return Response.json({ schema: 1, generatedAt: new Date().toISOString(), items }, {
    headers: { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}
