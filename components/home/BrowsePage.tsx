'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { PopularFeatures, type PopularMode } from './PopularFeatures';
import { useDirectPlay } from '@/lib/hooks/useDirectPlay';

interface BrowsePageProps {
  mode: Extract<PopularMode, 'movie' | 'tv' | 'variety' | 'anime' | 'recommend'>;
}

/**
 * 独立浏览路由（电影/剧集/综艺/动漫/推荐）的共享页面骨架。
 * 内部自带 Suspense 边界，供 useSearchParams 在预渲染阶段安全挂起。
 */
export function BrowsePage({ mode }: BrowsePageProps) {
  return (
    <Suspense fallback={<BrowseFallback />}>
      <BrowseContent mode={mode} />
    </Suspense>
  );
}

function BrowseContent({ mode }: BrowsePageProps) {
  const { status: directPlayStatus, handleDirectPlay, resetDirectPlay } = useDirectPlay();

  return (
    <AppShell onReset={resetDirectPlay} className="bg-bg bg-page bg-fixed">
      <PageContainer className="pb-20 pt-4">
        <PopularFeatures
          mode={mode}
          onMovieClick={handleDirectPlay}
          directPlayStatus={directPlayStatus}
          onResetDirectPlay={resetDirectPlay}
        />
      </PageContainer>
    </AppShell>
  );
}

function BrowseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
    </div>
  );
}
