'use client';

import { Suspense, useMemo, useState } from 'react';
import { PopularFeatures } from '@/components/home/PopularFeatures';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { SearchPageLayout } from '@/components/layout/SearchPageLayout';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { useLatencyPing } from '@/lib/hooks/useLatencyPing';

function HomePage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const {
    query,
    hasSearched,
    loading,
    results,
    availableSources,
    completedSources,
    totalSources,
    handleSearch,
    handleReset,
    handleCancelSearch,
  } = useHomePage();

  // Real-time latency pinging
  const sourceUrls = useMemo(() =>
    availableSources.flatMap((source) =>
      source.baseUrl ? [{ id: source.id, baseUrl: source.baseUrl }] : []
    ),
    [availableSources]
  );

  const { latencies } = useLatencyPing({
    sourceUrls,
    enabled: hasSearched && results.length > 0,
  });

  return (
    <SearchPageLayout
      query={query}
      hasSearched={hasSearched}
      loading={loading}
      results={results}
      availableSources={availableSources}
      completedSources={completedSources}
      totalSources={totalSources}
      latencies={latencies}
      onSearch={handleSearch}
      onReset={handleReset}
      onCancelSearch={handleCancelSearch}
      onOpenHistory={() => setIsHistoryOpen(true)}
      featured={<PopularFeatures onSearch={handleSearch} />}
      sidebars={
        <WatchHistorySidebar
          isOpen={isHistoryOpen}
          onOpen={() => setIsHistoryOpen(true)}
          onClose={() => setIsHistoryOpen(false)}
        />
      }
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
