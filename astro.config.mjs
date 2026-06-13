// @ts-check
import { defineConfig } from 'astro/config';

// hardeepanand.com. The public face of Hardeep's MyOS.
// Static build; deployed to Cloudflare Pages (Direct Upload at launch).
export default defineConfig({
  site: 'https://hardeepanand.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
