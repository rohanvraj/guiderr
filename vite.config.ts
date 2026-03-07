import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Strip console.* and debugger from production bundles.
  // Uses esbuild (built into Vite) — no extra dependencies needed.
  // Only active during `vite build`; console.log works normally in `vite dev`.
  ...(command === 'build' ? {
    esbuild: {
      drop: ['console', 'debugger'],
    },
  } : {}),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
