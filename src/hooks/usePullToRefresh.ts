import { useEffect, useRef, useState } from 'react';

interface Options {
  onRefresh: () => void | Promise<void>;
  // Drag distance (px) required to trigger a refresh.
  threshold?: number;
  // Only allow the gesture when the page is scrolled within this many px of the top.
  topTolerance?: number;
  disabled?: boolean;
}

/**
 * Touch-based pull-to-refresh for mobile. Tracks a downward drag that starts
 * near the top of the page and, once past the threshold, invokes onRefresh.
 * Returns the live pull distance (px) so the UI can render an indicator.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 70,
  topTolerance = 4,
  disabled = false,
}: Options) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const RESISTANCE = 0.5; // dampen the drag so it feels elastic
    const MAX_PULL = 120;

    const onTouchStart = (e: TouchEvent) => {
      // Only begin tracking when the user is at the very top of the page.
      if (window.scrollY <= topTolerance && !isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        activeRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || startYRef.current === null) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        const dist = Math.min(delta * RESISTANCE, MAX_PULL);
        setPullDistance(dist);
      } else {
        setPullDistance(0);
      }
    };

    const onTouchEnd = async () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      const shouldRefresh = pullDistance >= threshold;
      startYRef.current = null;

      if (shouldRefresh) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, isRefreshing, onRefresh, pullDistance, threshold, topTolerance]);

  return { pullDistance, isRefreshing, threshold };
}
