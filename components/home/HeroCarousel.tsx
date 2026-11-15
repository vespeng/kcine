/**
 * HeroCarousel - 首页顶部热门影片轮播图
 * 16:9 铺满内容区，取热门电影与剧集海报自动轮播，底部渐变展示标题与评分
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { fetchTmdbSubjects } from '@/lib/utils/tmdb-client';
import { fetchDoubanSubjects } from '@/lib/utils/douban-client';
import type { MediaItem } from '@/lib/types';

interface CarouselItem extends MediaItem {
  type: 'movie' | 'tv';
}

interface HeroCarouselProps {
  onMovieClick: (movie: MediaItem) => void;
}

const AUTO_PLAY_INTERVAL = 5000;
const MOVIE_COUNT = 4;
const TV_COUNT = 3;

export function HeroCarousel({ onMovieClick }: HeroCarouselProps) {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 豆瓣兜底数据：TMDB 未配置或无结果时使用
    const loadDouban = async (): Promise<CarouselItem[]> => {
      const [movies, tvs] = await Promise.all([
        fetchDoubanSubjects('movie', '热门', MOVIE_COUNT),
        fetchDoubanSubjects('tv', '热门', TV_COUNT),
      ]);
      return [
        ...movies.map((item) => ({ ...item, type: 'movie' as const })),
        ...tvs.map((item) => ({ ...item, type: 'tv' as const })),
      ];
    };

    const load = async () => {
      const [movies, tvs] = await Promise.all([
        fetchTmdbSubjects('movie', '热门').then((list) => list.slice(0, MOVIE_COUNT)),
        fetchTmdbSubjects('tv', '热门').then((list) => list.slice(0, TV_COUNT)),
      ]);
      const tmdbItems: CarouselItem[] = [
        ...movies.map((item) => ({ ...item, type: 'movie' as const })),
        ...tvs.map((item) => ({ ...item, type: 'tv' as const })),
      ];
      const loaded = tmdbItems.length > 0 ? tmdbItems : await loadDouban();
      if (cancelled) return;
      // 优先使用横版高清剧照
      setItems(loaded.map((item) => ({ ...item, cover: item.backdrop || item.cover })));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) {
    return <div className="aspect-video sm:aspect-banner rounded-2xl bg-surface animate-pulse" />;
  }

  return (
    <div
      className="relative aspect-video sm:aspect-banner rounded-2xl overflow-hidden bg-surface group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          aria-hidden={index !== active}
          className={`absolute inset-0 transition-opacity duration-500 ease-fluid ${
            index === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            tabIndex={index !== active ? -1 : 0}
            onClick={() => onMovieClick(item)}
            aria-label={`播放${item.title}`}
            className="absolute inset-0 w-full cursor-pointer"
          >
            <Image
              src={item.cover}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
              unoptimized
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start gap-2 text-left">
              <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-2xs text-white">
                {item.type === 'movie' ? '电影' : '剧集'}
              </span>
              <h2 className="text-xl md:text-xxl font-bold text-white line-clamp-1">{item.title}</h2>
              {item.rate && parseFloat(item.rate) > 0 && (
                <div className="flex items-center gap-1">
                  <Icons.Star size={14} className="text-warning fill-warning" />
                  <span className="text-sm font-semibold text-white">{item.rate}</span>
                </div>
              )}
            </div>
          </button>
        </div>
      ))}

      {/* 左右切换箭头：桌面端悬停显示 */}
      <button
        type="button"
        onClick={() => setActive((prev) => (prev - 1 + items.length) % items.length)}
        aria-label="上一张"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 hidden sm:flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity duration-250 z-10 cursor-pointer"
      >
        <Icons.ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => setActive((prev) => (prev + 1) % items.length)}
        aria-label="下一张"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 hidden sm:flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity duration-250 z-10 cursor-pointer"
      >
        <Icons.ChevronLeft size={20} className="rotate-180" />
      </button>

      {/* 指示器 */}
      <div className="absolute bottom-4 right-6 z-10 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`切换到第 ${index + 1} 张`}
            className={`h-2 rounded-full transition-all duration-250 cursor-pointer ${
              index === active ? 'w-6 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
