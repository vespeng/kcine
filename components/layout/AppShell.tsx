'use client';

import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppShellProps {
  /** Page content rendered below the navbar */
  children: ReactNode;
  isPremium?: boolean;
  /** Called when the site logo is clicked (resets the page) */
  onReset: () => void;
  onOpenHistory?: () => void;
  /** Extra classes for the page wrapper, e.g. background modifiers */
  className?: string;
}

/**
 * Shared page shell: sticky glass navbar + min-h-screen wrapper.
 * All main pages (home, search, favorites, premium) use this so the
 * top menu bar and page container stay consistent.
 */
export function AppShell({
  children,
  isPremium = false,
  onReset,
  onOpenHistory,
  className = '',
}: AppShellProps) {
  return (
    <div className={['min-h-screen', className].filter(Boolean).join(' ')}>
      <Navbar onReset={onReset} isPremiumMode={isPremium} onOpenHistory={onOpenHistory} />
      {children}
    </div>
  );
}
