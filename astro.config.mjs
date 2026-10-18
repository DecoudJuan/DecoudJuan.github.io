import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// User site: served from the root of decoudjuan.github.io, so no `base`.
export default defineConfig({
  site: 'https://decoudjuan.github.io',
  integrations: [react()],
});
