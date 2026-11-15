/**
 * HomeFeatured - 首页推荐内容
 * 轮播图 + 热门榜单 + 电影/剧集/综艺/动漫/豆瓣高分分区
 */

'use client';

import { HeroCarousel } from './HeroCarousel';
import { TopRanking } from './TopRanking';
import { PosterSection } from './PosterSection';
import { NoResults } from '@/components/search/NoResults';
import type { DirectPlayStatus } from '@/lib/hooks/useDirectPlay';
import type { MediaItem } from '@/lib/types';

const MOVIE_TAGS = [
  { label: '热门', doubanTag: '热门' },
  { label: '喜剧', doubanTag: '喜剧' },
  { label: '爱情', doubanTag: '爱情' },
  { label: '动作', doubanTag: '动作' },
  { label: '恐怖', doubanTag: '恐怖' },
  { label: '科幻', doubanTag: '科幻' },
];

const TV_TAGS = [
  { label: '热门', doubanTag: '热门' },
  { label: '国产', doubanTag: '国产剧' },
  { label: '美剧', doubanTag: '美剧' },
  { label: '日剧', doubanTag: '日剧' },
  { label: '韩剧', doubanTag: '韩剧' },
  { label: '综艺', doubanTag: '综艺' },
];

const VARIETY_TAGS = [
  { label: '热门', doubanTag: '综艺' },
  { label: '真人秀', doubanTag: '综艺' },
  { label: '脱口秀', doubanTag: '综艺' },
];

const ANIME_TAGS = [
  { label: '热门', doubanTag: '日本动画' },
  { label: '日漫', doubanTag: '日本动画' },
  { label: '国漫', doubanTag: '热门' },
  { label: '美漫', doubanTag: '热门' },
];

const DOUBAN_TOP_TAGS = [
  { label: '豆瓣高分', doubanTag: '豆瓣高分' },
  { label: '经典', doubanTag: '经典' },
  { label: '冷门佳片', doubanTag: '冷门佳片' },
];

interface HomeFeaturedProps {
  onMovieClick: (movie: MediaItem) => void;
  directPlayStatus?: DirectPlayStatus;
  onResetDirectPlay?: () => void;
}

export function HomeFeatured({
  onMovieClick,
  directPlayStatus = 'idle',
  onResetDirectPlay,
}: HomeFeaturedProps) {
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

  return (
    <div className="animate-fade-in flex flex-col gap-8 md:gap-12">
      <HeroCarousel onMovieClick={onMovieClick} />
      <TopRanking onMovieClick={onMovieClick} />
      <PosterSection title="电影" contentType="movie" tags={MOVIE_TAGS} moreHref="/movies" onMovieClick={onMovieClick} />
      <PosterSection title="剧集" contentType="tv" tags={TV_TAGS} moreHref="/tv" onMovieClick={onMovieClick} />
      <PosterSection title="综艺" contentType="tv" tags={VARIETY_TAGS} onMovieClick={onMovieClick} />
      <PosterSection title="动漫" contentType="tv" tags={ANIME_TAGS} onMovieClick={onMovieClick} />
      <PosterSection title="豆瓣高分" contentType="movie" tags={DOUBAN_TOP_TAGS} source="douban" moreHref="/movies" onMovieClick={onMovieClick} />
    </div>
  );
}
