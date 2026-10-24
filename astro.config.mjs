import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE is your public URL, e.g. https://lysander.github.io or https://yourdomain.com
// BASE is only needed for a project repo served at https://user.github.io/<repo>/
export default defineConfig({
  site: process.env.SITE ?? 'https://example.com',
  base: process.env.BASE ?? '/',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
