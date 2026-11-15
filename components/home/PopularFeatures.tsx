/**
 * PopularFeatures - Main component for popular movies section
 * Displays Douban movie recommendations with category dropdown filtering
 * and infinite scroll. Includes personalized "推荐" category when user
 * has 2+ watched items.
 */

'use client';

import { useEffect, useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { MovieGrid } from './MovieGrid';
import { NoResults } from '@/components/search/NoResults';
import { usePopularMovies } from './hooks/usePopularMovies';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';
import type { DirectPlayStatus } from '@/lib/hooks/useDirectPlay';

const DEFAULT_TAG = '热门';

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

interface PopularFeaturesProps {
  onMovieClick?: (movie: DoubanMovie) => void;
  directPlayStatus?: DirectPlayStatus;
  onResetDirectPlay?: () => void;
}

export function PopularFeatures({
  onMovieClick,
  directPlayStatus = 'idle',
  onResetDirectPlay,
}: PopularFeaturesProps) {
  const [contentType, setContentType] = useState<'movie' | 'tv'>(() => {
    if (typeof window === 'undefined') return 'movie';
    return localStorage.getItem('kcine_default_content_type') === 'tv' ? 'tv' : 'movie';
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([DEFAULT_TAG]);
  const [isRecommendSelected, setIsRecommendSelected] = useState(false);

  // Persist content type preference
  useEffect(() => {
    localStorage.setItem('kcine_default_content_type', contentType);
  }, [contentType]);

  const {
    movies: recommendMovies,
    loading: recommendLoading,
    hasMore: recommendHasMore,
    hasHistory,
    prefetchRef: recommendPrefetchRef,
    loadMoreRef: recommendLoadMoreRef,
  } = usePersonalizedRecommendations(false);

  const effectiveRecommendSelected = hasHistory && isRecommendSelected;

  const {
    movies,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
  } = usePopularMovies(
    effectiveRecommendSelected ? [''] : selectedTags,
    contentType
  );

  const handleMovieClick = (movie: DoubanMovie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
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
      // 「全部」清空其它标签；再次点击已选标签则取消
      if (tag === DEFAULT_TAG) return [DEFAULT_TAG];
      const next = prev.filter(t => t !== DEFAULT_TAG);
      if (next.includes(tag)) {
        return next.length > 0 ? next : [DEFAULT_TAG];
      }
      return [...next, tag];
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
    return <NoResults onReset={onResetDirectPlay || (() => {})} />;
  }

  return (
    <div className="animate-fade-in">
      <CategoryFilter
        contentType={contentType}
        selectedTags={selectedTags}
        isRecommendActive={effectiveRecommendSelected}
        recommendAvailable={hasHistory}
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
