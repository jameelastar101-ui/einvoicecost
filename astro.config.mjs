import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://einvoicecost.ae',
  // Extensionless URLs (/tally) served from tally.html on Netlify, matching the live site.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
