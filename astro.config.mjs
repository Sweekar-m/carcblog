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