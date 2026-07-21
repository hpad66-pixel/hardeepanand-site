#!/usr/bin/env node
// Import one approved public article package without making the site a second source of truth.
// The source package remains canonical. This repository stores a rendered, provenance-carrying copy.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function fail(message) {
  console.error(`REFUSED: ${message}`);
  process.exit(1);
}

function quote(value) {
  return JSON.stringify(String(value ?? ''));
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled';
}

const packagePath = option('--package');
if (!packagePath) fail('usage: node scripts/import-release-package.mjs --package <release-package.json>');

const sourcePath = resolve(packagePath);
if (!existsSync(sourcePath)) fail('package file does not exist');
let pkg;
try {
  pkg = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch {
  fail('package is not valid JSON');
}

const required = ['schema_version', 'package_type', 'content_id', 'canonical_owner', 'source_repo', 'source_commit', 'title', 'visibility', 'status', 'content_type', 'generated_at', 'approved_by', 'approved_at', 'canonical_url', 'content'];
for (const key of required) if (!pkg[key]) fail(`missing ${key}`);
if (pkg.schema_version !== '1.0') fail('unsupported schema version');
if (pkg.package_type !== 'public-release') fail('only public release packages are accepted');
if (!['onewater-os', 'hardeep-author'].includes(pkg.canonical_owner)) fail('unknown canonical owner');
if (pkg.visibility !== 'public') fail('private or internal content cannot enter the public site');
if (!['APPROVED', 'PUBLISHED'].includes(pkg.status)) fail('package is not approved for public release');
if (pkg.content_type !== 'article') fail('this importer currently accepts articles only');
if (!pkg.content.body_markdown) fail('article package has no Markdown body');

const owner = pkg.canonical_owner === 'onewater-os' ? 'owos' : 'author';
const date = String(pkg.approved_at).slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('approved_at must begin with an ISO date');
const destination = join(root, 'content', owner, date.slice(0, 4), `${date}-${slugify(pkg.title)}.md`);
const rel = relative(root, destination);
if (rel.startsWith('..')) fail('destination escaped the repository');
if (existsSync(destination)) fail(`destination already exists: ${rel}`);

const frontmatter = [
  '---',
  `title: ${quote(pkg.title)}`,
  `status: ${pkg.status}`,
  'deliverable: article',
  `date: ${date}`,
  `canonical_owner: ${pkg.canonical_owner}`,
  `source_repo: ${quote(pkg.source_repo)}`,
  `source_commit: ${pkg.source_commit}`,
  `content_id: ${pkg.content_id}`,
  `canonical_url: ${quote(pkg.canonical_url)}`,
  `approved_by: ${quote(pkg.approved_by)}`,
  `approved_at: ${quote(pkg.approved_at)}`,
  `seo_description: ${quote(pkg.content.description || '')}`,
  '---',
  ''
].join('\n');

mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${frontmatter}${pkg.content.body_markdown.trim()}\n`, 'utf8');
console.log(`Imported ${pkg.content_id} to ${rel}`);
