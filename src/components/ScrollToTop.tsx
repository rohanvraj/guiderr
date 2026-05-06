import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      scrollPositions.current[location.key] = {
        x: window.scrollX,
        y: window.scrollY,
      };
    };
  }, [location.key]);

  useLayoutEffect(() => {
    // Preserve native in-page anchor behavior when a hash is present.
    if (location.hash) return;

    // Bypass CSS `scroll-behavior: smooth` on html so the position resets
    // instantly with no visible animation — the page just opens at the top.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current[location.key];
      if (savedPosition) {
        window.scrollTo(savedPosition.x, savedPosition.y);
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }

    // Restore smooth scrolling so in-page anchors (ToC, etc.) still animate.
    html.style.scrollBehavior = prev;
  }, [location.key, location.hash, navigationType]);

  return null;
}