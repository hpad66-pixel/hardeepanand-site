// Renders each Lexicon term as its full designed document, re-homed into the shell
// with the site nav injected at the top. Preserves the page's internal design exactly.
import { readHtmlCollection, injectChrome } from '../../lib/content.js';

const isProd = import.meta.env.PROD;

export function getStaticPaths() {
  return readHtmlCollection('lexicon')
    .filter((it) => (isProd ? it.status === 'PUBLISHED' : it.status !== 'ARCHIVED'))
    .map((it) => ({ params: { slug: it.slug }, props: { item: it } }));
}

export function GET({ props }) {
  const html = injectChrome(props.item.raw, '/lexicon/');
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
