'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

import { Video } from '@/lib/types';
import { parseVideoTitle } from '@/lib/utils/video';

interface VideoCardProps {
    video: Video;
    videoUrl: string;
    cardId: string;
    isActive: boolean;
    onCardClick: (e: React.MouseEvent, cardId: string, videoUrl: string) => void;
    isPremium?: boolean;
}

export const VideoCard = memo<VideoCardProps>(({
    video,
    videoUrl,
    cardId,
    isActive,
    onCardClick,
    isPremium = false,
}) => {
    return (
        <div className="relative z-1 hover:z-100">
            <Link
                key={cardId}
                href={videoUrl}
                onClick={(e) => onCardClick(e, cardId, videoUrl)}
                role="listitem"
                aria-label={`${video.vod_name}${video.vod_remarks ? ` - ${video.vod_remarks}` : ''}`}
                prefetch={false}
                data-focusable
                className="group cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 ease-out block h-full"
            >
                <Card
                    className="flex flex-col h-full p-6 hover:shadow-card-hover transition-shadow backface-hidden"
                    hover={false}
                    padded={false}
                >
                    {/* Poster */}
                    <div className="relative aspect-poster bg-surface overflow-hidden rounded-2xl">
                        {video.vod_pic ? (
                            <Image
                                src={video.vod_pic}
                                alt={video.vod_name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                                loading="eager"
                                unoptimized
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    if (target.dataset.fallback === '1') {
                                        target.style.opacity = '0';
                                        return;
                                    }
                                    target.dataset.fallback = '1';
                                    target.src = '/placeholder-poster.svg';
                                }}
                            />
                        ) : (
                            <Image
                                src="/placeholder-poster.svg"
                                alt={video.vod_name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                                unoptimized
                            />
                        )}

                        {/* Fallback Icon - visible when image fails completely */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 gap-2">
                            <Icons.Film size={48} className="text-text-secondary opacity-40" />
                            <span className="text-xs text-text-secondary opacity-60 px-2 text-center line-clamp-2">{video.vod_name}</span>
                        </div>

                        {/* Badge Container */}
                        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                                {video.sourceName && (
                                    <Badge variant="primary" className="bg-primary flex-shrink-0 max-w-full truncate">
                                        {video.sourceName}
                                    </Badge>
                                )}
                            </div>

                        </div>

                        {/* Favorite Button - Top Right */}
                        <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <FavoriteButton
                                videoId={video.vod_id}
                                source={video.source}
                                title={video.vod_name}
                                poster={video.vod_pic}
                                sourceName={video.sourceName}
                                type={video.type_name}
                                year={video.vod_year}
                                remarks={video.vod_remarks}
                                size={16}
                                className="shadow-md"
                                isPremium={isPremium}
                            />
                        </div>

                        {/* Overlay */}
                        <div
                            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isActive ? 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100' : 'opacity-0 lg:group-hover:opacity-100'
                                }`}
                        >
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                {isActive && (
                                    <div className="lg:hidden text-white/90 text-xs mb-2 font-medium">
                                        再次点击播放 →
                                    </div>
                                )}
                                {video.type_name && (
                                    <Badge variant="secondary" className="text-xs mb-2">
                                        {video.type_name}
                                    </Badge>
                                )}
                                {video.vod_year && (
                                    <div className="flex items-center gap-1 text-white/80 text-xs">
                                        <Icons.Calendar size={12} />
                                        <span>{video.vod_year}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pt-1.5 px-1 pb-1">
                        <h3 className="font-semibold text-sm text-left text-text line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                            {parseVideoTitle(video.vod_name).cleanTitle}
                        </h3>
                    </div>
                </Card>
            </Link>
        </div>
    );
});

VideoCard.displayName = 'VideoCard';

