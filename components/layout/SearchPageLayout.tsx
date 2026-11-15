'use client';

import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { PageContainer } from './PageContainer';
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
  isPremium?: boolean;
  latencies?: Record<string, number>;
  placeholder?: string;
  onSearch: (query: string) => void;
  onReset: () => void;
  /**
   * Non-null when the current search has no usable video sources yet because
   * subscriptions are still syncing ('syncing') or the last sync failed
   * ('failed'). Rendered instead of the generic "no results" view.
   */
  sourceIssue?: 'syncing' | 'failed' | null;
  onRetrySources?: () => void;
  /** Shown below results when not searching (e.g. PopularFeatures / PremiumContent) */
  featured?: ReactNode;
}

/**
 * Shared layout for search pages (home & premium):
 * navbar (with inline pill search) + result/loading/empty states + favorites sidebar.
 */
export function SearchPageLayout({
  query,
  hasSearched,
  loading,
  results,
  availableSources,
  isPremium = false,
  latencies,
  placeholder,
  onSearch,
  onReset,
  sourceIssue,
  onRetrySources,
  featured,
}: SearchPageLayoutProps) {
  return (
    <AppShell
      isPremium={isPremium}
      onReset={onReset}
      search={{ query, placeholder, onSearch, onClear: onReset }}
      className="bg-bg bg-page bg-fixed"
    >
      {/* Main Content */}
      <PageContainer className="pb-20 pt-4">
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-text-secondary">加载中...</p>
            </div>
          </div>
        )}

        {/* Featured content - shown when not searching */}
        {!loading && !hasSearched && featured}

        {/* Empty results: explain missing sources, otherwise generic no-results */}
        {!loading && hasSearched && results.length === 0 && (
          sourceIssue ? (
            <div className="flex justify-center py-16">
              <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface text-center space-y-4">
                {sourceIssue === 'syncing' ? (
                  <>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-text">正在同步视频源…</p>
                      <p className="text-sm text-text-secondary">
                        同步完成后将自动重新搜索，请稍候。
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="font-medium text-text">视频源同步失败，无法搜索</p>
                      <p className="text-sm text-text-secondary">
                        可能是订阅地址暂时不可用。同步已自动重试，也可手动重试。
                      </p>
                    </div>
                    <button
                      onClick={onRetrySources}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer"
                    >
                      重试同步
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <NoResults onReset={onReset} />
          )
        )}
      </PageContainer>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar isPremium={isPremium} />
    </AppShell>
  );
}
