// Renders each OneWater Minute as its full designed document, re-homed into the shell.
import { readHtmlCollection, injectChrome } from '../../lib/content.js';

const isProd = import.meta.env.PROD;

export function getStaticPaths() {
  return readHtmlCollection('minutes/2026')
    .filter((it) => (isProd ? it.status === 'PUBLISHED' : it.status !== 'ARCHIVED'))
    .map((it) => ({ params: { slug: it.slug }, props: { item: it } }));
}

export function GET({ props }) {
  const html = injectChrome(props.item.raw, '/minute/');
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
