'use client';

/**
 * VideoGroupCard - Displays grouped videos with same name as single card
 * Following Liquid Glass design system
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Video } from '@/lib/types';
import { parseVideoTitle } from '@/lib/utils/video';
import { storeGroupedSources } from '@/lib/utils/grouped-sources-cache';

export interface GroupedVideo {
    /** Representative video (lowest latency) */
    representative: Video;
    /** All videos in this group */
    videos: Video[];
    /** Group name (vod_name) */
    name: string;
}

interface VideoGroupCardProps {
    group: GroupedVideo;
    cardId: string;
    isActive: boolean;
    onCardClick: (e: React.MouseEvent, cardId: string, videoUrl: string) => void;
    isPremium?: boolean;
    latencies?: Record<string, number>;
}

export const VideoGroupCard = memo<VideoGroupCardProps>(({
    group,
    cardId,
    isActive,
    onCardClick,
    isPremium = false,
    latencies = {},
}) => {
    const { representative, videos, name } = group;

    // Best latency from the group, preferring real-time updates
    const bestLatency = useMemo(() => {
        const currentLatencies = videos.map(v => latencies[v.source] ?? v.latency).filter(l => l !== undefined) as number[];
        return currentLatencies.length > 0 ? Math.min(...currentLatencies) : undefined;
    }, [videos, latencies]);

    // Generate URL with grouped sources stored in sessionStorage (avoids long URLs / 414 errors)
    const videoUrl = useMemo(() => {
        const params = new URLSearchParams({
            id: String(representative.vod_id),
            source: representative.source,
            title: representative.vod_name,
        });

        // Store group data in sessionStorage and pass short key in URL
        if (videos.length > 1) {
            const groupData = videos.map(v => ({
                id: v.vod_id,
                source: v.source,
                sourceName: v.sourceName,
                latency: v.latency,
                pic: v.vod_pic,
                typeName: v.type_name,
                remarks: v.vod_remarks,
            }));
            const cacheKey = storeGroupedSources(groupData);
            if (cacheKey) {
                params.set('gs', cacheKey);
            }
        }

        if (isPremium) {
            params.set('premium', '1');
        }

        return `/player?${params.toString()}`;
    }, [representative, videos, isPremium]);

    return (
        <div className="relative z-1 hover:z-100">
            <Link
                key={cardId}
                href={videoUrl}
                onClick={(e) => onCardClick(e, cardId, videoUrl)}
                role="listitem"
                aria-label={`${name} - ${videos.length} 个源${representative.vod_remarks ? ` - ${representative.vod_remarks}` : ''}`}
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
                        {representative.vod_pic ? (
                            <Image
                                src={representative.vod_pic}
                                alt={name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                                loading="eager"
                                unoptimized
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.opacity = '0';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Icons.Film size={64} className="text-text-secondary" />
                            </div>
                        )}

                        {/* Fallback Icon - visible when image fails */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 gap-2">
                            <Icons.Film size={48} className="text-text-secondary opacity-40" />
                            <span className="text-xs text-text-secondary opacity-60 px-2 text-center line-clamp-2">{name}</span>
                        </div>

                        {/* Badge Container */}
                        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1">
                            {/* Source count badge */}
                            <Badge variant="primary" className="bg-primary flex-shrink-0">
                                <Icons.Layers size={12} className="mr-1" />
                                {videos.length} 源
                            </Badge>

                            {bestLatency !== undefined && (
                                <LatencyBadge latency={bestLatency} className="flex-shrink-0" />
                            )}
                        </div>

                        {/* Favorite Button - Top Right */}
                        <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <FavoriteButton
                                videoId={representative.vod_id}
                                source={representative.source}
                                title={name}
                                poster={representative.vod_pic}
                                sourceName={representative.sourceName}
                                type={representative.type_name}
                                year={representative.vod_year}
                                remarks={representative.vod_remarks}
                                sourceMap={Object.fromEntries(videos.map((video) => [video.source, video.vod_id]))}
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
                                {representative.type_name && (
                                    <Badge variant="secondary" className="text-xs mb-2">
                                        {representative.type_name}
                                    </Badge>
                                )}
                                {representative.vod_year && (
                                    <div className="flex items-center gap-1 text-white/80 text-xs">
                                        <Icons.Calendar size={12} />
                                        <span>{representative.vod_year}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pt-1.5 px-1 pb-1">
                        <h3 className="font-semibold text-sm text-left text-text line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                            {parseVideoTitle(name).cleanTitle}
                        </h3>
                    </div>
                </Card>
            </Link>
        </div>
    );
});

VideoGroupCard.displayName = 'VideoGroupCard';
