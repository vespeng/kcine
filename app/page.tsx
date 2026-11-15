'use client';

import { Suspense, useMemo } from 'react';
import { PopularFeatures } from '@/components/home/PopularFeatures';
import { SearchPageLayout } from '@/components/layout/SearchPageLayout';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { useDirectPlay } from '@/lib/hooks/useDirectPlay';
import { useLatencyPing } from '@/lib/hooks/useLatencyPing';

function HomePage() {
  const {
    query,
    hasSearched,
    loading,
    results,
    availableSources,
    handleSearch,
    handleReset,
    sourceIssue,
    handleRetrySources,
  } = useHomePage();
  const { status: directPlayStatus, handleDirectPlay, resetDirectPlay } = useDirectPlay();

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
      latencies={latencies}
      onSearch={handleSearch}
      onReset={handleReset}
      sourceIssue={sourceIssue}
      onRetrySources={handleRetrySources}
      featured={<PopularFeatures onMovieClick={handleDirectPlay} directPlayStatus={directPlayStatus} onResetDirectPlay={resetDirectPlay} />}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
