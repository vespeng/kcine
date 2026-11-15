/**
 * TopRanking - 首页热门榜单
 * TMDB 本周热门电影与剧集交错合并 Top 10，横向滚动浏览，前三名金色高亮
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchTmdbSubjects } from '@/lib/utils/tmdb-client';
import { fetchDoubanSubjects } from '@/lib/utils/douban-client';
import type { MediaItem } from '@/lib/types';

interface TopRankingProps {
  onMovieClick: (movie: MediaItem) => void;
}

const RANK_COUNT = 10;
const HALF_COUNT = RANK_COUNT / 2;

export function TopRanking({ onMovieClick }: TopRankingProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const hasItems = items.length > 0;

  // 滚动条已隐藏，将垂直滚轮转换为横向滚动以保证滚轮可操作
  useEffect(() => {
    const row = rowRef.current;
    if (!hasItems || !row) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (row.scrollWidth <= row.clientWidth) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };
    row.addEventListener('wheel', onWheel, { passive: false });
    return () => row.removeEventListener('wheel', onWheel);
  }, [hasItems]);

  useEffect(() => {
    let cancelled = false;
    // 豆瓣兜底数据：TMDB 未配置或无结果时使用
    const loadDouban = async (): Promise<MediaItem[]> => {
      const [movies, tvs] = await Promise.all([
        fetchDoubanSubjects('movie', '热门', HALF_COUNT),
        fetchDoubanSubjects('tv', '热门', HALF_COUNT),
      ]);
      return [...movies, ...tvs];
    };

    const load = async () => {
      const [movies, tvs] = await Promise.all([
        fetchTmdbSubjects('movie', '热门').then((list) => list.slice(0, HALF_COUNT)),
        fetchTmdbSubjects('tv', '热门').then((list) => list.slice(0, HALF_COUNT)),
      ]);
      const loaded =
        movies.length + tvs.length > 0 ? interleave(movies, tvs) : await loadDouban();
      if (!cancelled) setItems(loaded.slice(0, RANK_COUNT));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary" aria-hidden />
        <h2 className="text-xl font-bold text-text">热门榜单</h2>
        <span className="text-xs text-text-secondary mt-0.5">本周最热 Top {RANK_COUNT}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex gap-2 md:gap-4 overflow-hidden">
          {Array.from({ length: RANK_COUNT }).map((_, index) => (
            <div key={index} className="w-28 sm:w-32 md:w-36 shrink-0 aspect-poster rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div ref={rowRef} className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-1">
          {items.map((item, index) => (
            <RankCard key={item.id} item={item} rank={index + 1} onMovieClick={onMovieClick} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 两数组按序交错合并（电影/剧集穿插排列）
 */
function interleave<T>(a: T[], b: T[]): T[] {
  const merged: T[] = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i]) merged.push(a[i]);
    if (b[i]) merged.push(b[i]);
  }
  return merged;
}

function RankCard({
  item,
  rank,
  onMovieClick,
}: {
  item: MediaItem;
  rank: number;
  onMovieClick: (movie: MediaItem) => void;
}) {
  return (
    <Link
      href={`/?q=${encodeURIComponent(item.title)}`}
      onClick={(e) => {
        // 允许修饰键走浏览器默认行为（新标签页打开等）
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onMovieClick(item);
      }}
      className="group relative w-28 sm:w-32 md:w-36 shrink-0 cursor-pointer hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="relative aspect-poster rounded-2xl overflow-hidden bg-surface">
        <Image
          src={item.cover}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="144px"
          unoptimized
          referrerPolicy="no-referrer"
        />
        <span
          className={`absolute bottom-1 left-2 text-4xl font-black italic leading-none drop-shadow-lg ${
            rank <= 3 ? 'text-warning' : 'text-white/80'
          }`}
        >
          {rank}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-text line-clamp-1 group-hover:text-primary transition-colors">
        {item.title}
      </p>
    </Link>
  );
}
