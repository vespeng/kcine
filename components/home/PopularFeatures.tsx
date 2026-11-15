/**
 * PopularFeatures - Main component for popular movies section
 * Displays TMDB recommendations with douban fallback, category dropdown filtering
 * and infinite scroll. Includes personalized "推荐" category when user
 * has 2+ watched items.
 *
 * mode:
 * - home: 分类切换 + 标签筛选 + 推荐切换（首页行为）
 * - movie / tv / variety / anime: 固定内容频道，仅保留标签筛选（独立路由）
 * - recommend: 个性化推荐；无足够观看历史时降级为热门列表并引导
 */

'use client';

import { useEffect, useState } from 'react';
import { CategoryFilter, type TagGroup } from './CategoryFilter';
import { MovieGrid } from './MovieGrid';
import { NoResults } from '@/components/search/NoResults';
import { usePopularMovies } from './hooks/usePopularMovies';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';
import type { DirectPlayStatus } from '@/lib/hooks/useDirectPlay';
import type { MediaItem } from '@/lib/types';

const DEFAULT_TAG = '热门';

export type PopularMode = 'home' | 'movie' | 'tv' | 'variety' | 'anime' | 'recommend';

/**
 * 综艺/动漫专属频道的标签分组与豆瓣兜底标签映射
 */
const MODE_CHANNEL_CONFIG: Record<'variety' | 'anime', { tagGroups: TagGroup[]; doubanTagMap: Record<string, string> }> = {
    variety: {
        tagGroups: [{ label: '类型', tags: ['真人秀', '脱口秀'] }],
        doubanTagMap: { 真人秀: '综艺', 脱口秀: '综艺' },
    },
    anime: {
        tagGroups: [{ label: '地区', tags: ['日漫', '国漫', '美漫'] }],
        doubanTagMap: { 日漫: '日本动画', 国漫: '热门', 美漫: '热门' },
    },
};

interface PopularFeaturesProps {
  mode?: PopularMode;
  onMovieClick?: (movie: MediaItem) => void;
  directPlayStatus?: DirectPlayStatus;
  onResetDirectPlay?: () => void;
}

export function PopularFeatures({
  mode = 'home',
  onMovieClick,
  directPlayStatus = 'idle',
  onResetDirectPlay,
}: PopularFeaturesProps) {
  const [contentType, setContentType] = useState<'movie' | 'tv'>(() => {
    if (mode === 'movie' || mode === 'tv') return mode;
    if (mode === 'variety' || mode === 'anime') return 'tv';
    if (typeof window === 'undefined') return 'movie';
    return localStorage.getItem('kcine_default_content_type') === 'tv' ? 'tv' : 'movie';
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([DEFAULT_TAG]);
  const [isRecommendSelected, setIsRecommendSelected] = useState(mode === 'recommend');

  // 仅首页模式持久化内容类型偏好，独立路由不回写首页默认值
  useEffect(() => {
    if (mode === 'home') {
      localStorage.setItem('kcine_default_content_type', contentType);
    }
  }, [contentType, mode]);

  const {
    movies: recommendMovies,
    loading: recommendLoading,
    hasMore: recommendHasMore,
    hasHistory,
    prefetchRef: recommendPrefetchRef,
    loadMoreRef: recommendLoadMoreRef,
  } = usePersonalizedRecommendations(false);

  const effectiveRecommendSelected = hasHistory && isRecommendSelected;
  const channelConfig = mode === 'variety' || mode === 'anime' ? MODE_CHANNEL_CONFIG[mode] : undefined;

  const {
    movies,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
  } = usePopularMovies(
    effectiveRecommendSelected ? [''] : selectedTags,
    contentType,
    channelConfig?.doubanTagMap
  );

  const handleMovieClick = (movie: MediaItem) => {
    onMovieClick?.(movie);
  };

  const handleRecommendSelect = () => {
    setIsRecommendSelected(true);
  };

  const handleContentTypeChange = (type: 'movie' | 'tv') => {
    setIsRecommendSelected(false);
    setContentType(type);
    setSelectedTags([DEFAULT_TAG]);
  };

  const handleTagSelect = (tag: string) => {
    setIsRecommendSelected(false);
    setSelectedTags(prev => {
      // 「全部」重置为默认标签；已选标签再次点击取消，取消后为空则回退「全部」
      if (tag === DEFAULT_TAG) return [DEFAULT_TAG];
      const rest = prev.filter(t => t !== DEFAULT_TAG);
      if (!rest.includes(tag)) return [...rest, tag];
      const next = rest.filter(t => t !== tag);
      return next.length > 0 ? next : [DEFAULT_TAG];
    });
  };

  if (directPlayStatus === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  if (directPlayStatus === 'notfound') {
    return <NoResults onReset={onResetDirectPlay ?? (() => {})} />;
  }

  // 推荐路由：有历史渲染个性化推荐，否则降级热门并引导
  if (mode === 'recommend') {
    return (
      <div className="animate-fade-in">
        {effectiveRecommendSelected ? (
          <MovieGrid
            movies={recommendMovies}
            loading={recommendLoading}
            hasMore={recommendHasMore}
            onMovieClick={handleMovieClick}
            prefetchRef={recommendPrefetchRef}
            loadMoreRef={recommendLoadMoreRef}
          />
        ) : (
          <>
            {!hasHistory && (
              <div className="flex justify-center py-8">
                <div className="px-6 py-4 rounded-2xl bg-surface border border-border text-center">
                  <p className="text-sm text-text-secondary">
                    观看 2 部以上影片解锁个性化推荐
                  </p>
                </div>
              </div>
            )}
            <MovieGrid
              movies={movies}
              loading={loading}
              hasMore={hasMore}
              onMovieClick={handleMovieClick}
              prefetchRef={prefetchRef}
              loadMoreRef={loadMoreRef}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <CategoryFilter
        contentType={contentType}
        selectedTags={selectedTags}
        isRecommendActive={effectiveRecommendSelected}
        recommendAvailable={hasHistory}
        showCategories={mode === 'home'}
        tagGroups={channelConfig?.tagGroups}
        onRecommendSelect={handleRecommendSelect}
        onContentTypeChange={handleContentTypeChange}
        onTagSelect={handleTagSelect}
      />

      {effectiveRecommendSelected ? (
        <MovieGrid
          movies={recommendMovies}
          loading={recommendLoading}
          hasMore={recommendHasMore}
          onMovieClick={handleMovieClick}
          prefetchRef={recommendPrefetchRef}
          loadMoreRef={recommendLoadMoreRef}
        />
      ) : (
        <MovieGrid
          movies={movies}
          loading={loading}
          hasMore={hasMore}
          onMovieClick={handleMovieClick}
          prefetchRef={prefetchRef}
          loadMoreRef={loadMoreRef}
        />
      )}
    </div>
  );
}
