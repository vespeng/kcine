/**
 * MovieCard - Individual movie card component
 * Displays movie poster, title, and rating
 */

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

interface MovieCardProps {
  movie: DoubanMovie;
  onMovieClick: (movie: DoubanMovie) => void;
}

export const MovieCard = memo(function MovieCard({ movie, onMovieClick }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  return (
    <Link
      href={`/?q=${encodeURIComponent(movie.title)}`}
      onClick={(e) => {
        // Allow default behavior for modifier keys (new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        onMovieClick(movie);
      }}
      data-focusable
      className="group relative z-1 hover:z-100 content-visibility-auto cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 ease-out"
    >
      <Card hover={false} padded={false} className="h-full p-6">
        <div className="relative aspect-poster bg-surface overflow-hidden rounded-2xl">
          {!imageError ? (
            <Image
              src={movie.cover}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="eager"
              unoptimized
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : !fallbackError ? (
            <Image
              src="/placeholder-poster.svg"
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              unoptimized
              onError={() => setFallbackError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface">
              <p className="text-sm text-text-secondary">暂无图片</p>
            </div>
          )}
          {movie.rate && parseFloat(movie.rate) > 0 && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling from triggering the outer card's search click
                window.open(movie.url, '_blank', 'noopener,noreferrer');
              }}
              title="在豆瓣中查看"
              className="absolute top-2 right-2 bg-black/80 hover:bg-black/90 px-2.5 py-1.5 flex items-center gap-1.5 rounded-full z-20 hover:scale-105 transition-all shadow-md"
            >
              <Icons.Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">
                {movie.rate}
              </span>
            </div>
          )}
        </div>
        <div className="pt-1.5 px-1 pb-1">
          <h3 className="font-semibold text-sm text-left text-text line-clamp-1 leading-snug group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
});
