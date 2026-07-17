import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import node from '@astrojs/node';
import clerk from '@clerk/astro';

export default defineConfig({
  site: 'https://carcblog.com',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    clerk({
      signInUrl: '/auth/sign-in',
      signUpUrl: '/auth/sign-up',
    }),
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