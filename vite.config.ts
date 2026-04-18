import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import fs from 'fs';
import path from 'path';

// ── Draft-aware sitemap route builder ────────────────────────────────────────
// Reads every .md file in src/content/blog/ at build time.
// Articles with `status: draft` (or `status: "draft"`) are excluded so Google
// never indexes private PDF briefs.
function getPublishedBlogRoutes(): string[] {
  const blogDir = path.resolve(__dirname, 'src/content/blog');
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
      // Extract status from frontmatter (handles quoted and unquoted values)
      const statusMatch = raw.match(/^status:\s*["']?(\w+)["']?\s*$/m);
      const status = statusMatch ? statusMatch[1] : 'published';
      if (status === 'draft') return [];
      const slug = file.replace('.md', '');
      return [`/guides/${slug}`];
    });
}

// Static routes that are always public
const staticRoutes = [
  '/',
  '/guides',
  '/featured',
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
      dynamicRoutes: [...staticRoutes, ...getPublishedBlogRoutes()],
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
