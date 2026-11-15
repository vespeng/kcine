/**
 * 影片海报栅格：无限滚动加载，含加载态、空态与结束提示
 */

import { MovieCard } from './MovieCard';
import { Icons } from '@/components/ui/Icon';
import type { MediaItem } from '@/lib/types';

interface MovieGridProps {
  movies: MediaItem[];
  loading: boolean;
  hasMore: boolean;
  onMovieClick: (movie: MediaItem) => void;
  prefetchRef: React.RefObject<HTMLDivElement | null>;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

export function MovieGrid({
  movies,
  loading,
  hasMore,
  onMovieClick,
  prefetchRef,
  loadMoreRef
}: MovieGridProps) {
  if (movies.length === 0 && !loading) {
    return <MovieGridEmpty />;
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-8 gap-2 md:gap-4 lg:gap-6 max-w-page mx-auto">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onMovieClick={onMovieClick}
          />
        ))}
      </div>

      {/* Prefetch Trigger - Earlier */}
      {hasMore && !loading && <div ref={prefetchRef} className="h-1" />}

      {/* Loading Indicator */}
      {loading && <MovieGridLoading />}

      {/* Intersection Observer Target */}
      {hasMore && !loading && <div ref={loadMoreRef} className="h-20" />}

      {/* No More Content */}
      {!hasMore && movies.length > 0 && <MovieGridNoMore />}
    </>
  );
}

function MovieGridLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  );
}

function MovieGridNoMore() {
  return (
    <div className="text-center py-12">
      <p className="text-text-secondary">没有更多内容了</p>
    </div>
  );
}

function MovieGridEmpty() {
  return (
    <div className="text-center py-20">
      <Icons.Film size={64} className="text-text-secondary mx-auto mb-4" />
      <p className="text-text-secondary">暂无内容</p>
    </div>
  );
}
