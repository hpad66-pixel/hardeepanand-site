const CONTENT_PATH = /^(writing|climb)\/[a-z0-9-]+$/;

export const DEFAULT_EVERGREEN_PATH = 'writing/data-governance';

const FALLBACK_VISUALS = {
  'head-in-the-clouds-is-not-an-insult': {
    title: 'Cloud thinking grounded in operational reality',
    image: '/images/articles/head-in-the-clouds-is-not-an-insult/head-clouds-ground-sketch.svg',
    mobileImage: '/images/articles/head-in-the-clouds-is-not-an-insult/head-clouds-ground-sketch-mobile.svg',
  },
  'adapt-dont-pivot': {
    title: 'Carry the map, not the theater of change',
    image: '/images/articles/adapt-dont-pivot/carry-the-map.svg',
    mobileImage: '/images/articles/adapt-dont-pivot/carry-the-map-mobile.svg',
  },
  'data-governance': {
    title: 'Data governance as a working operating system',
    image: '/images/articles/data-governance/1.svg',
    mobileImage: '/images/articles/data-governance/1-mobile.svg',
  },
};

export function normalizeHomepageSettings(input = {}) {
  const evergreenPath = CONTENT_PATH.test(String(input.evergreenPath || ''))
    ? String(input.evergreenPath)
    : DEFAULT_EVERGREEN_PATH;
  return {
    mode: input.mode === 'editor' ? 'editor' : 'latest',
    evergreenPath,
  };
}

export function selectHomepageStories(posts, input = {}) {
  const settings = normalizeHomepageSettings(input);
  const catalog = [...(posts || [])].filter((post) => post?.href && post?.title);
  const sorted = catalog.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
  const evergreen = sorted.find((post) => post.path === settings.evergreenPath) || sorted.find((post) => post.path === DEFAULT_EVERGREEN_PATH) || null;
  const lead = sorted.find((post) => post.path !== evergreen?.path) || sorted[0] || null;
  const supporting = sorted
    .filter((post) => post.path !== lead?.path && post.path !== evergreen?.path)
    .slice(0, 2);
  return {
    settings,
    lead,
    supporting,
    evergreen: evergreen && evergreen.path !== lead?.path ? evergreen : null,
  };
}

export function visualForPost(post, figures = []) {
  const figure = figures.find((row) => row.post?.slug === post?.slug);
  if (figure) return figure;
  const fallback = FALLBACK_VISUALS[post?.slug] || {};
  return {
    title: fallback.title || post?.title || 'Article visual',
    caption: post?.takeaway || post?.summary || '',
    href: post?.href || '#',
    image: fallback.image || '',
    mobileImage: fallback.mobileImage || '',
  };
}
