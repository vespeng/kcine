'use client';

import { Suspense } from 'react';
import {
  HistoryPageContent,
  HistoryPageFallback,
} from '@/components/history/HistoryPageContent';

export default function History() {
  return (
    <Suspense fallback={<HistoryPageFallback />}>
      <HistoryPageContent />
    </Suspense>
  );
}
