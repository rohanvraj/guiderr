import { lazy, ComponentType } from 'react';

/**
 * lazyRetry — Industry-standard SPA chunk-load recovery.
 *
 * Problem: After a new deploy, old chunk filenames (e.g. Library-BxK2a9.js)
 * no longer exist on the CDN. React.lazy() rejects, leaving a blank page.
 *
 * Solution: If the dynamic import fails and we haven't already retried this
 * session, set a flag in sessionStorage and hard-reload once. The reload
 * fetches the fresh HTML which references the new chunk names — problem solved.
 *
 * If it fails again after the reload (genuine error, not a stale-cache issue),
 * the error is re-thrown so an ErrorBoundary can display a useful message.
 */

const RELOAD_KEY = 'chunk_load_failed_reload';

export function lazyRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): ReturnType<typeof lazy<T>> {
  return lazy((): Promise<{ default: T }> =>
    factory().catch((error: unknown) => {
      const alreadyRetried = sessionStorage.getItem(RELOAD_KEY) === 'true';

      if (!alreadyRetried) {
        // Mark that we attempted a reload so we don't loop infinitely.
        sessionStorage.setItem(RELOAD_KEY, 'true');
        window.location.reload();
        // Return a promise that never resolves — the page reload will take over.
        return new Promise<{ default: T }>(() => {});
      }

      // Second failure in the same session — surface the real error.
      throw error;
    })
  );
}
