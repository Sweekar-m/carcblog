import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import clerk from '@clerk/astro';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://carcblog-kappa.vercel.app/',
  output: 'server',
  adapter: vercel(),
  devToolbar: {
    enabled: false
  },
  integrations: [
    clerk({
      signInUrl: '/auth/sign-in',
      signUpUrl: '/auth/sign-up',
    }),
    react(),
  ],
  vite: {
    plugins: [
      tailwind()
    ],
    ssr: {
      external: ['cloudflare:workers'],
      noExternal: [
        '@blocknote/core',
        '@blocknote/react',
        '@blocknote/mantine',
        '@mantine/core',
        '@mantine/hooks',
        'nanostores',
        '@nanostores/react',
      ],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@blocknote/core',
        '@blocknote/react',
        '@blocknote/mantine',
        '@mantine/core',
        '@mantine/hooks',
        'nanostores',
        '@nanostores/react',
      ],
    },
    build: {
      rollupOptions: {
        external: ['cloudflare:workers']
      }
    },
    resolve: {
      // Force a single shared React instance across all islands and dependencies.
      // Without this, packages like @blocknote/* and @mantine/* that bundle their
      // own copy of react can end up with a *different* React module reference than
      // the one Astro's React integration registers — causing "Cannot read properties
      // of null (reading 'useRef')" at runtime because React hooks are called against
      // a null/unregistered React context.
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
      alias: {
        '@': '/src'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  },
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});