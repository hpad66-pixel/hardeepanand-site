// @ts-check
import { defineConfig } from 'astro/config';
import { localDrafts } from './src/editor/local-drafts.js';

// hardeepanand.com. The public face of Hardeep's MyOS.
// Static build; deployed to Cloudflare Pages (Direct Upload at launch).
export default defineConfig({
  site: 'https://hardeepanand.com',
  vite: { plugins: [localDrafts()] },
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
