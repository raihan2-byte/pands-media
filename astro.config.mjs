// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://pandsmedia.id',

  integrations: [
    react(),
    sitemap({
      // Demo adalah mockup. Hanya situs induk yang boleh masuk sitemap.
      filter: (page) => !page.includes('/porto/'),
    }),
  ],

  // Katalog ke demo diklik terus. Pramuat saat kursor mendekat.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
