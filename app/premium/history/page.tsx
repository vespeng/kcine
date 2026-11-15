'use client';

import { Suspense } from 'react';
import {
  HistoryPageContent,
  HistoryPageFallback,
} from '@/components/history/HistoryPageContent';
import { usePremiumTheme } from '@/lib/hooks/usePremiumTheme';

export default function PremiumHistory() {
  usePremiumTheme(true);
  return (
    <Suspense fallback={<HistoryPageFallback />}>
      <HistoryPageContent isPremium />
    </Suspense>
  );
}
