'use client';

import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { PageContainer } from './PageContainer';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { NoResults } from '@/components/search/NoResults';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import type { SourceBadge, Video } from '@/lib/types';

interface SearchPageLayoutProps {
  query: string;
  hasSearched: boolean;
  loading: boolean;
  results: Video[];
  availableSources: SourceBadge[];
  completedSources: number;
  totalSources: number;
  isPremium?: boolean;
  latencies?: Record<string, number>;
  placeholder?: string;
  onSearch: (query: string) => void;
  onReset: () => void;
  onCancelSearch?: () => void;
  onOpenHistory?: () => void;
  /** Shown below results when not searching (e.g. PopularFeatures / PremiumContent) */
  featured?: ReactNode;
  /** Extra sidebars (e.g. WatchHistorySidebar) */
  sidebars?: ReactNode;
}

/**
 * Shared layout for search pages (home & premium):
 * navbar + search form + result/loading/empty states + favorites sidebar.
 */
export function SearchPageLayout({
  query,
  hasSearched,
  loading,
  results,
  availableSources,
  completedSources,
  totalSources,
  isPremium = false,
  latencies,
  placeholder,
  onSearch,
  onReset,
  onCancelSearch,
  onOpenHistory,
  featured,
  sidebars,
}: SearchPageLayoutProps) {
  return (
    <AppShell isPremium={isPremium} onReset={onReset} onOpenHistory={onOpenHistory}>
      {/* Search Form - Separate from navbar */}
      <div
        className="max-w-[1240px] mx-auto px-4 mt-6 mb-8 relative"
        style={{ transform: 'translate3d(0, 0, 0)', zIndex: 1000 }}
      >
        <SearchForm
          onSearch={onSearch}
          onClear={onReset}
          onCancelSearch={onCancelSearch}
          isLoading={loading}
          initialQuery={query}
          currentSource=""
          checkedSources={completedSources}
          totalSources={totalSources}
          placeholder={placeholder}
          isPremium={isPremium}
        />
      </div>

      {/* Main Content */}
      <PageContainer className="pb-20">
        {/* Results Section */}
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <SearchResults
            results={results}
            availableSources={availableSources}
            loading={loading}
            isPremium={isPremium}
            latencies={latencies}
          />
        )}

        {/* Searching - no results yet */}
        {loading && hasSearched && results.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-color)] border-t-transparent"></div>
              <p className="text-sm text-[var(--text-color-secondary)]">加载中...</p>
            </div>
          </div>
        )}

        {/* Featured content - shown when not searching */}
        {!loading && !hasSearched && featured}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && (
          <NoResults onReset={onReset} />
        )}
      </PageContainer>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar isPremium={isPremium} />

      {/* Extra sidebars (e.g. Watch History) */}
      {sidebars}
    </AppShell>
  );
}
