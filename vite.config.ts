import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import fs from 'fs';
import path from 'path';

// ── Helpers ───────────────────────────────────────────────────────────────────
// Reads a content directory, filters out drafts, and maps files to URL routes.
// status field is optional — missing status defaults to published.
function getPublishedRoutes(contentDir: string, urlPrefix: string): string[] {
  const dir = path.resolve(__dirname, contentDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const statusMatch = raw.match(/^status:\s*["']?(\w+)["']?\s*$/m);
      const status = statusMatch ? statusMatch[1] : 'published';
      if (status === 'draft') return [];
      return [`${urlPrefix}${file.replace('.md', '')}`];
    });
}

// ── Route lists ───────────────────────────────────────────────────────────────
// Priority 1.0 — Critical entry points
const criticalRoutes = ['/', '/start-here'];

// Priority 0.9 — Revenue / high-value pages
const revenueRoutes = [
  '/library',
  '/top-picks',
  '/top-picks/tech',
  '/top-picks/riding-gear',
  '/top-picks/lifestyle',
  '/top-picks/investing',
  '/top-picks/personal-finance',
  '/top-picks/credit-cards',
];

// Priority 0.8 — Authority hubs and content indexes
const hubRoutes = [
  '/guides',
  '/featured',
  '/get-featured',
  '/about',
  '/investing',
  // CategoryPage hubs
  '/personal-finance',
  '/automotive',
  '/travel',
  '/tech',
  '/lifestyle',
  '/business',
  // Library category hubs
  '/library/investing',
  '/library/motorcycles',
  '/library/ai-lab',
  '/library/personal-finance',
];

// Priority 0.4 — Legal / low-signal
const legalRoutes = [
  '/contactus',
  '/affiliate-disclosure',
  '/terms',
  '/shipping',
  '/refunds',
  '/privacy-policy',
];

// Dynamic: blog guides (0.8) and featured stories (0.9)
const blogRoutes     = getPublishedRoutes('src/content/blog',     '/guides/');
const featuredRoutes = getPublishedRoutes('src/content/featured', '/featured/');

const allRoutes = [
  ...criticalRoutes,
  ...revenueRoutes,
  ...hubRoutes,
  ...legalRoutes,
  ...featuredRoutes,
  ...blogRoutes,
];

// ── Per-route priority map ────────────────────────────────────────────────────
// vite-plugin-sitemap accepts a Record<route, value> with '*' as fallback.
function buildPriorityMap(): Record<string, number> {
  const map: Record<string, number> = {};
  criticalRoutes.forEach((r) => (map[r] = 1.0));
  revenueRoutes.forEach((r) => (map[r] = 0.9));
  featuredRoutes.forEach((r) => (map[r] = 0.9));
  hubRoutes.forEach((r) => (map[r] = 0.8));
  blogRoutes.forEach((r) => (map[r] = 0.8));
  legalRoutes.forEach((r) => (map[r] = 0.4));
  map['*'] = 0.7; // safe fallback for any auto-discovered HTML routes
  return map;
}

function buildChangefreqMap(): Record<string, string> {
  const map: Record<string, string> = {};
  criticalRoutes.forEach((r) => (map[r] = 'weekly'));
  revenueRoutes.forEach((r) => (map[r] = 'weekly'));
  hubRoutes.forEach((r) => (map[r] = 'weekly'));
  featuredRoutes.forEach((r) => (map[r] = 'monthly'));
  blogRoutes.forEach((r) => (map[r] = 'monthly'));
  legalRoutes.forEach((r) => (map[r] = 'yearly'));
  map['*'] = 'monthly';
  return map;
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.guiderr.in',
      dynamicRoutes: allRoutes,
      exclude: ['/cms', '/cms/**'],
      priority: buildPriorityMap(),
      changefreq: buildChangefreqMap(),
      readable: true,
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
