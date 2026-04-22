import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Recover from chunk-load failures after new deployments.
// Reloads once to fetch updated assets; the flag prevents an infinite loop
// if the user is genuinely offline or the asset is permanently missing.
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message ?? '';
  if (msg.includes('Failed to fetch dynamically imported module')) {
    const FLAG = 'chunk_reload_attempted';
    if (!sessionStorage.getItem(FLAG)) {
      sessionStorage.setItem(FLAG, '1');
      window.location.reload();
    }
  }
});

// Free Tier Insurance: cache all queries for 5 minutes, retain for 30 minutes.
// Prevents redundant Supabase API calls — especially the Hero+Products double-fetch on homepage.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes — data is considered fresh
      gcTime: 30 * 60 * 1000,     // 30 minutes — keep in memory after unmount
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
      retry: 1,                    // Only 1 retry on failure
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
