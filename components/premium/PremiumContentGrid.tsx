'use client';

import Link from 'next/link';
import { Video } from '@/lib/types';
import Image from 'next/image';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

interface PremiumContentGridProps {
    videos: Video[];
    loading: boolean;
    hasMore: boolean;
    prefetchRef: React.RefObject<HTMLDivElement | null>;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

export function PremiumContentGrid({
    videos,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
}: PremiumContentGridProps) {
    if (videos.length === 0 && !loading) {
        return <PremiumGridEmpty />;
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 max-w-page mx-auto">
                {videos.map((video) => {
                    const videoUrl = `/player?${new URLSearchParams({
                        id: String(video.vod_id),
                        source: video.source,
                        title: video.vod_name,
                        premium: '1',
                    }).toString()}`;

                    return (
                        <Link
                            key={`${video.source}-${video.vod_id}`}
                            href={videoUrl}
                            className="group relative z-1 hover:z-100 content-visibility-auto cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 ease-out"
                        >
                            <Card hover={false} padded={false} className="h-full p-6">
                                <div className="relative aspect-poster bg-surface overflow-hidden rounded-2xl">
                                    {video.vod_pic ? (
                                        <Image
                                            src={video.vod_pic}
                                            alt={video.vod_name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="eager"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-secondary">
                                            无封面
                                        </div>
                                    )}
                                    {video.vod_remarks && (
                                        <div className="absolute top-2 right-2 bg-black/80 px-2.5 py-1.5 flex items-center gap-1.5 rounded-full">
                                            <span className="text-xs font-bold text-white">
                                                {video.vod_remarks}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-1.5 px-1 pb-1">
                                    <h3 className="font-semibold text-sm text-left text-text line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                                        {video.vod_name}
                                    </h3>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Prefetch Trigger - Earlier */}
            {hasMore && !loading && <div ref={prefetchRef} className="h-1" />}

            {/* Loading Indicator */}
            {loading && <PremiumGridLoading />}

            {/* Intersection Observer Target */}
            {hasMore && !loading && <div ref={loadMoreRef} className="h-20" />}

            {/* No More Content */}
            {!hasMore && videos.length > 0 && <PremiumGridNoMore />}
        </>
    );
}

function PremiumGridLoading() {
    return (
        <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-text-secondary">加载中...</p>
            </div>
        </div>
    );
}

function PremiumGridNoMore() {
    return (
        <div className="text-center py-12">
            <p className="text-text-secondary">没有更多内容了</p>
        </div>
    );
}

function PremiumGridEmpty() {
    return (
        <div className="text-center py-20">
            <Icons.Film size={64} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">暂无内容</p>
        </div>
    );
}
