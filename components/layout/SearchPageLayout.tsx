'use client';

import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { PageContainer } from './PageContainer';
import { SearchResults } from '@/components/home/SearchResults';
import { NoResults } from '@/components/search/NoResults';
import { StatusCard } from '@/components/ui/StatusCard';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';
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
   * 搜索无可用视频源时由同步状态决定展示：syncing 同步中 / failed 同步失败
   * 传入后替代通用的「无结果」视图
   */
  sourceIssue?: 'syncing' | 'failed' | null;
  onRetrySources?: () => void;
  /** Shown below results when not searching (e.g. PopularFeatures / PremiumContent) */
  featured?: ReactNode;
}

/**
 * 搜索页共用布局：顶栏搜索联动 + 结果/加载/空态 + 收藏侧栏
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
              {sourceIssue === 'syncing' ? (
                <StatusCard
                  icon={Icons.RefreshCw}
                  tone="primary"
                  busy
                  surface={false}
                  title="正在同步视频源…"
                  description="同步完成后将自动重新搜索，请稍候。"
                />
              ) : (
                <StatusCard
                  icon={Icons.AlertTriangle}
                  tone="danger"
                  surface={false}
                  title="视频源同步失败，无法搜索"
                  description="可能是订阅地址暂时不可用。同步已自动重试，也可手动重试。"
                >
                  <Button variant="primary" size="sm" onClick={onRetrySources}>
                    重试同步
                  </Button>
                </StatusCard>
              )}
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
