/**
 * PosterSection - 首页内容分区
 * 标题 + 分类标签切换 + 两行海报栅格（桌面端 7 列 × 2 行）
 * 默认数据优先走 TMDB，无结果时回退豆瓣；source 为 douban 时直接走豆瓣
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';
import { MovieCard } from './MovieCard';
import { fetchTmdbSubjects } from '@/lib/utils/tmdb-client';
import { fetchDoubanSubjects } from '@/lib/utils/douban-client';
import type { MediaItem } from '@/lib/types';

interface SectionTag {
  label: string;
  doubanTag: string; // TMDB 无结果时的豆瓣兜底标签
}

interface PosterSectionProps {
  title: string;
  contentType: 'movie' | 'tv';
  tags: SectionTag[];
  source?: 'tmdb' | 'douban';
  moreHref?: string;
  onMovieClick: (movie: MediaItem) => void;
}

const PAGE_LIMIT = 14;

export function PosterSection({
  title,
  contentType,
  tags,
  source = 'tmdb',
  moreHref,
  onMovieClick,
}: PosterSectionProps) {
  const [selectedTag, setSelectedTag] = useState(tags[0].label);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    const doubanTag = tags.find((item) => item.label === selectedTag)?.doubanTag || selectedTag;
    const loadDouban = () => fetchDoubanSubjects(contentType, doubanTag, PAGE_LIMIT);

    const load =
      source === 'douban'
        ? loadDouban()
        : fetchTmdbSubjects(contentType, selectedTag).then((tmdbItems) => {
            const list = tmdbItems.slice(0, PAGE_LIMIT);
            return list.length > 0 ? list : loadDouban();
          });

    load.then((finalItems) => {
      if (requestIdRef.current !== requestId) return;
      setItems(finalItems.slice(0, PAGE_LIMIT));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, source, selectedTag]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-primary" aria-hidden />
          <h2 className="text-xl font-bold text-text">{title}</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelectedTag(label)}
              className={`px-4 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer select-none ${
                label === selectedTag
                  ? 'bg-primary text-white shadow-card'
                  : 'text-text-secondary hover:text-text hover:bg-primary/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="ml-auto flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
          >
            更多
            <Icons.ChevronLeft size={12} className="rotate-180" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-4 lg:gap-6">
          {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
            <div key={index} className="aspect-poster rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-sm text-text-secondary text-center">暂无内容</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-4 lg:gap-6">
          {items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>
      )}
    </section>
  );
}
