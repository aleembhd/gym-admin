import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['elitegym-logo.jpeg'],
        manifest: {
          name: 'Elite Gym Admin',
          short_name: 'Elite Gym',
          description: 'Gym owner management — members, receipts & announcements',
          theme_color: '#4f46e5',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'portrait',
          icons: [
            {
              src: '/elitegym-logo.jpeg',
              sizes: '192x192',
              type: 'image/jpeg',
            },
            {
              src: '/elitegym-logo.jpeg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          // Cache the app shell and assets for offline use
          globPatterns: ['**/*.{js,css,html,ico,png,jpeg,svg,woff2}'],
          runtimeCaching: [
            {
              // Cache Supabase API calls with network-first strategy
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
