import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_EVERGREEN_PATH, normalizeHomepageSettings, selectHomepageStories, visualForPost } from '../src/lib/homepage.js';

const posts = [
  { path: 'writing/newest', slug: 'newest', title: 'Newest', href: '/writing/newest/', date: '2026-09-23', takeaway: 'Newest takeaway' },
  { path: 'writing/second', slug: 'second', title: 'Second', href: '/writing/second/', date: '2026-09-22' },
  { path: 'writing/third', slug: 'third', title: 'Third', href: '/writing/third/', date: '2026-09-21' },
  { path: DEFAULT_EVERGREEN_PATH, slug: 'data-governance', title: 'Evergreen', href: '/writing/data-governance/', date: '2026-06-01' },
];

test('homepage settings keep the latest-first default and validate evergreen paths', () => {
  assert.deepEqual(normalizeHomepageSettings({ mode: 'editor', evergreenPath: 'climb/adapt-dont-pivot' }), {
    mode: 'editor',
    evergreenPath: 'climb/adapt-dont-pivot',
  });
  assert.deepEqual(normalizeHomepageSettings({ mode: 'social', evergreenPath: 'https://evil.test' }), {
    mode: 'latest',
    evergreenPath: DEFAULT_EVERGREEN_PATH,
  });
});

test('homepage story selection keeps newest first with a separate evergreen slot', () => {
  const selected = selectHomepageStories(posts);
  assert.equal(selected.lead.title, 'Newest');
  assert.deepEqual(selected.supporting.map((post) => post.title), ['Second', 'Third']);
  assert.equal(selected.evergreen.title, 'Evergreen');
});

test('homepage story selection never duplicates the lead and evergreen', () => {
  const selected = selectHomepageStories(posts, { evergreenPath: 'writing/newest' });
  assert.equal(selected.lead.title, 'Second');
  assert.deepEqual(selected.supporting.map((post) => post.title), ['Third', 'Evergreen']);
  assert.equal(selected.evergreen.title, 'Newest');
});

test('homepage visuals prefer real figure metadata and fall back to article metadata', () => {
  assert.equal(visualForPost(posts[0], [{ post: { slug: 'newest' }, image: '/x.png', title: 'Figure' }]).image, '/x.png');
  assert.equal(visualForPost(posts[0], []).caption, 'Newest takeaway');
});

test('homepage visuals use article graphics for known visual essays', () => {
  const visual = visualForPost({
    slug: 'head-in-the-clouds-is-not-an-insult',
    title: 'Head in the Clouds Is Not an Insult',
    href: '/writing/head-in-the-clouds-is-not-an-insult/',
  }, []);
  assert.match(visual.image, /head-clouds-ground-sketch\.svg$/);
  assert.match(visual.mobileImage, /head-clouds-ground-sketch-mobile\.svg$/);
});
