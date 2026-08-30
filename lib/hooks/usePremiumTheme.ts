'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

/**
 * Forces the dark theme while `enabled` is true (premium mode).
 *
 * On exit the previous theme is restored automatically, so normal mode
 * keeps its own theme (e.g. a light normal mode stays light after leaving
 * the premium pages).
 */
export function usePremiumTheme(enabled: boolean) {
  const { setForcedTheme } = useTheme();

  useEffect(() => {
    setForcedTheme(enabled ? 'dark' : null);
    return () => setForcedTheme(null);
  }, [enabled, setForcedTheme]);
}
