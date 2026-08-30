'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

// A forced theme overrides the user/system theme until it is cleared.
// Used by premium mode to keep those pages dark while leaving normal mode's theme untouched.
type ForcedTheme = 'light' | 'dark' | null;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
  setForcedTheme: (forced: ForcedTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');
  const [forcedTheme, setForcedTheme] = useState<ForcedTheme>(null);
  const [mounted, setMounted] = useState(false);
  const transitionRef = React.useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved theme
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyTheme = (newTheme?: 'light' | 'dark') => {
      // Forced theme (premium mode) takes precedence over user/system theme
      const themeToApply = forcedTheme || newTheme || (theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme);
      
      setActualTheme(themeToApply);
      document.documentElement.classList.toggle('dark', themeToApply === 'dark');
    };

    const applyThemeWithTransition = () => {
      // Abort previous transition if it exists
      if (transitionRef.current) {
        try {
          transitionRef.current.skipTransition();
        } catch (e) {
          // Ignore if transition already finished
        }
      }

      // Check if document is visible - skip transition if hidden
      if (document.hidden) {
        applyTheme();
        return;
      }

      // Check if View Transition API is supported
      // @ts-ignore - View Transition API is experimental
      if (typeof document.startViewTransition === 'function') {
        try {
          // @ts-ignore
          transitionRef.current = document.startViewTransition(() => {
            applyTheme();
          });
          
          // Clear ref after transition completes or fails
          if (transitionRef.current) {
            transitionRef.current.finished
              .then(() => { transitionRef.current = null; })
              .catch((error: Error) => { 
                // Silently handle transition errors (visibility changes, etc.)
                transitionRef.current = null;
              });
            // Suppress the ready promise rejection ("Transition was skipped")
            // raised by skipTransition(), which otherwise surfaces as an
            // unhandled runtime rejection.
            transitionRef.current.ready.catch(() => {});
          }
        } catch (error) {
          // Fallback if transition fails to start
          applyTheme();
        }
      } else {
        // Fallback for browsers that don't support View Transition API
        applyTheme();
      }
    };

    applyThemeWithTransition();
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyThemeWithTransition();
      }
    };
    
    // Listen for visibility changes to abort transitions
    const handleVisibilityChange = () => {
      if (document.hidden && transitionRef.current) {
        try {
          transitionRef.current.skipTransition();
        } catch (e) {
          // Ignore
        }
        transitionRef.current = null;
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Abort any pending transition on unmount
      if (transitionRef.current) {
        try {
          transitionRef.current.skipTransition();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [theme, mounted, forcedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme, setForcedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
