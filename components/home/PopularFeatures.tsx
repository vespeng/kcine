/**
 * PopularFeatures - Main component for popular movies section
 * Displays Douban movie recommendations with tag filtering and infinite scroll.
 * Includes personalized "推荐" tag when user has 2+ watched items.
 */

'use client';

import { useState } from 'react';
import { TagManager } from './TagManager';
import { MovieGrid } from './MovieGrid';
import { NoResults } from '@/components/search/NoResults';
import { useTagManager } from './hooks/useTagManager';
import { usePopularMovies } from './hooks/usePopularMovies';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';
import type { DirectPlayStatus } from '@/lib/hooks/useDirectPlay';

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
  const {
    tags,
    selectedTag,
    contentType,
    newTagInput,
    showTagManager,
    justAddedTag,
    setContentType,
    setSelectedTag,
    setNewTagInput,
    setShowTagManager,
    setJustAddedTag,
    handleAddTag,
    handleDeleteTag,
    handleRestoreDefaults,
    handleDragEnd,
    isLoadingTags,
  } = useTagManager();

  const {
    movies: recommendMovies,
    loading: recommendLoading,
    hasMore: recommendHasMore,
    hasHistory,
    prefetchRef: recommendPrefetchRef,
    loadMoreRef: recommendLoadMoreRef,
  } = usePersonalizedRecommendations(false);

  const [isRecommendSelected, setIsRecommendSelected] = useState(false);

  const effectiveRecommendSelected = hasHistory && isRecommendSelected;
  const isTagManagementMode = showTagManager;

  const {
    movies,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
    refresh,
  } = usePopularMovies(
    effectiveRecommendSelected ? '' : selectedTag,
    tags,
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

  const handleRegularTagSelect = (tagId: string) => {
    if (tagId === 'custom_高级' || tags.find(t => t.id === tagId)?.label === '高级') {
      window.location.href = '/premium';
      return;
    }
    // Re-clicking the active tag forces a cache-bypassing refresh
    if (tagId === selectedTag && !effectiveRecommendSelected) {
      refresh();
      return;
    }
    setIsRecommendSelected(false);
    setSelectedTag(tagId);
  };

  const handleContentTypeChange = (type: 'movie' | 'tv') => {
    setIsRecommendSelected(false);
    setContentType(type);
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
      <TagManager
        tags={tags}
        selectedTag={effectiveRecommendSelected ? '' : selectedTag}
        showTagManager={showTagManager}
        newTagInput={newTagInput}
        justAddedTag={justAddedTag}
        onTagSelect={handleRegularTagSelect}
        onTagDelete={handleDeleteTag}
        onToggleManager={() => setShowTagManager(!showTagManager)}
        onRestoreDefaults={handleRestoreDefaults}
        onNewTagInputChange={setNewTagInput}
        onAddTag={handleAddTag}
        onDragEnd={handleDragEnd}
        onJustAddedTagHandled={() => setJustAddedTag(false)}
        isLoadingTags={isLoadingTags}
        contentType={contentType}
        onContentTypeChange={handleContentTypeChange}
        recommendTag={hasHistory ? {
          label: '推荐',
          isSelected: effectiveRecommendSelected,
          onSelect: handleRecommendSelect,
        } : undefined}
      />

      {!isTagManagementMode && (
        effectiveRecommendSelected ? (
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
        )
      )}
    </div>
  );
}
