'use client';

/**
 * SourceSelector - Component for selecting video source in player
 * Following Liquid Glass design system
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { Button } from '@/components/ui/Button';

export interface SourceInfo {
    id: string | number;
    source: string;
    sourceName?: string;
    latency?: number;
    pic?: string;
}

interface SourceSelectorProps {
    sources: SourceInfo[];
    currentSource: string;
    onSourceChange: (source: SourceInfo) => void;
    className?: string;
}

export function SourceSelector({
    sources,
    currentSource,
    onSourceChange,
    className = '',
}: SourceSelectorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [latencies, setLatencies] = useState<Record<string, number>>({});

    // Sort sources by latency
    const sortedSources = useMemo(() => {
        return [...sources].sort((a, b) => {
            const latA = latencies[a.source] ?? a.latency ?? Infinity;
            const latB = latencies[b.source] ?? b.latency ?? Infinity;
            return latA - latB;
        });
    }, [sources, latencies]);

    // Refresh latency for all sources
    const refreshLatencies = useCallback(async () => {
        setIsLoading(true);

        const results = await Promise.all(
            sources.map(async (source) => {
                try {
                    // Use the stored baseUrl or extract from source
                    const response = await fetch('/api/ping', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            url: source.source, // This should be the baseUrl ideally
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        return { source: source.source, latency: data.latency };
                    }
                } catch {
                    // Ignore errors
                }
                return { source: source.source, latency: undefined };
            })
        );

        const newLatencies: Record<string, number> = {};
        results.forEach(({ source, latency }) => {
            if (latency !== undefined) {
                newLatencies[source] = latency;
            }
        });

        setLatencies(newLatencies);
        setIsLoading(false);
    }, [sources]);

    // Initialize latencies from sources
    useEffect(() => {
        const initial: Record<string, number> = {};
        sources.forEach(s => {
            if (s.latency !== undefined) {
                initial[s.source] = s.latency;
            }
        });
        setLatencies(initial);
    }, [sources]);

    if (sources.length <= 1) {
        return null;
    }

    return (
        <Card hover={false} className={`mt-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2">
                    <Icons.Layers size={20} className="sm:w-6 sm:h-6" />
                    <span></span>
                    <Badge variant="primary">{sources.length}</Badge>
                </h3>
                <Button
                    variant="secondary"
                    onClick={refreshLatencies}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5"
                >
                    <Icons.RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    刷新延迟
                </Button>
            </div>

            <div className="space-y-2 max-h-list overflow-y-auto">
                {sortedSources.map((source, index) => {
                    const isCurrent = source.source === currentSource;
                    const latency = latencies[source.source] ?? source.latency;

                    return (
                        <button
                            key={`${source.source}-${index}`}
                            onClick={() => !isCurrent && onSourceChange(source)}
                            className={`
                w-full p-3 rounded-2xl text-left transition-all duration-200
                flex items-center gap-3
                ${isCurrent
                                    ? 'bg-primary text-white'
                                    : 'bg-surface hover:bg-surface-hover text-text border border-border cursor-pointer'
                                }
              `}
                            aria-current={isCurrent ? 'true' : undefined}
                        >
                            {/* Thumbnail */}
                            {source.pic && (
                                <div className="w-12 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-surface/50">
                                    <Image
                                        src={source.pic}
                                        alt=""
                                        width={48}
                                        height={64}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Source Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">
                                    {source.sourceName || source.source}
                                </div>
                                {latency !== undefined && (
                                    <div className="mt-1">
                                        <LatencyBadge latency={latency} />
                                    </div>
                                )}
                            </div>

                            {/* Current indicator */}
                            {isCurrent && (
                                <Icons.Play size={16} className="flex-shrink-0" />
                            )}

                            {/* Rank badge for top 3 */}
                            {!isCurrent && index < 3 && (
                                <Badge
                                    variant="secondary"
                                    className={`flex-shrink-0 ${index === 0 ? 'bg-warning/20 text-warning border-warning' :
                                        index === 1 ? 'bg-text-secondary/20 text-text-secondary border-text-secondary' :
                                            'bg-warning/20 text-warning border-warning'
                                        }`}
                                >
                                    #{index + 1}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
