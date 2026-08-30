'use client';

import { Suspense } from 'react';
import {
  FavoritesPageContent,
  FavoritesPageFallback,
} from '@/components/favorites/FavoritesPageContent';
import { usePremiumTheme } from '@/lib/hooks/usePremiumTheme';

export default function PremiumFavorites() {
  usePremiumTheme(true);
  return (
    <Suspense fallback={<FavoritesPageFallback />}>
      <FavoritesPageContent isPremium />
    </Suspense>
  );
}
