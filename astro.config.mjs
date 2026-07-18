import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';
import clerk from '@clerk/astro';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://carcblog.com',
  output: 'hybrid',
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
      external: ['cloudflare:workers']
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