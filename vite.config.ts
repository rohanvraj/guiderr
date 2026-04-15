import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';

// All public-facing routes for sitemap.xml
// Admin, stats, and thank-you pages are intentionally excluded.
const sitemapRoutes = [
  '/',
  '/guides',
  '/guides/2026-03-09-welcome-to-guiderr-guides',
  '/motorcycles',
  '/finance',
  '/travel',
  '/children',
  '/parenting',
  '/art',
  '/contactus',
  '/terms',
  '/shipping',
  '/refunds',
  '/privacy-policy',
];

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.guiderr.in',
      dynamicRoutes: sitemapRoutes,
      // Exclude the CMS admin and any auto-discovered non-public paths
      exclude: ['/cms', '/cms/**'],
    }),
  ],
  build: {
    // ESBuild minification is Vite's default — declared explicitly for CI clarity.
    // Shrinks JS/CSS with near-zero build-time overhead (no terser install needed).
    minify: 'esbuild',
  },
  // Strip console.* and debugger from production bundles.
  // Uses esbuild (built into Vite) — no extra dependencies needed.
  // Only active during `vite build`; console.log works normally in `vite dev`.
  ...(command === 'build' ? {
    esbuild: {
      drop: ['console', 'debugger'],
    },
  } : {}),
  optimizeDeps: {},
}));
