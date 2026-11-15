import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { settingsStore } from '@/lib/store/settings-store';

interface PremiumVideo {
    vod_id: string | number;
    vod_name: string;
    vod_pic?: string;
    vod_remarks?: string;
    type_name?: string;
    source: string;
}

const PAGE_LIMIT = 20;

export function usePremiumContent(categoryValues: string[], sourceId = '') {
    const [videos, setVideos] = useState<PremiumVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Tracks the latest request so stale fetches can be discarded during rapid category switching
    const requestIdRef = useRef(0);

    // 空选中回退为推荐（无分类过滤的单次请求）；缓存键基于分类值拼接
    const effectiveValues = categoryValues.filter(Boolean);
    const requestValues = effectiveValues.length > 0 ? effectiveValues : [''];
    const categoryKey = effectiveValues.join('|');

    const loadVideos = useCallback(async (values: string[], pageNum: number, append = false) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            // Get sources from settings
            const settings = settingsStore.getSettings();
            // Resolve all relevant sources (premium sources + subscriptions that might be premium)
            const premiumSources = [
                ...settings.premiumSources,
                // Check if any subscription sources are marked as premium
                ...settings.subscriptions.filter(s => (s as any).group === 'premium')
            ].filter(s => (s as any).enabled !== false);

            if (premiumSources.length === 0) {
                setLoading(false);
                return;
            }

            // 每个分类值独立请求，多选时在合并阶段交错去重
            const pages = await Promise.all(
                values.map(value =>
                    fetch('/api/premium/category', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sources: premiumSources,
                            category: value,
                            sourceId,
                            page: pageNum.toString(),
                            limit: PAGE_LIMIT.toString()
                        })
                    })
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to fetch');
                            return res.json();
                        })
                        .then(data => (data.videos || []) as PremiumVideo[])
                )
            );

            // Drop stale results if the user switched categories during the fetch
            if (requestIdRef.current !== requestId) return;

            setHasMore(pages.some(p => p.length === PAGE_LIMIT));
            setPage(pageNum);
            setVideos(prev => {
                // Round-robin interleave of each category's page, deduped by source + id
                const seen = new Set(
                    append ? prev.map(v => `${v.source}:${v.vod_id}`) : []
                );
                const merged: PremiumVideo[] = append ? [...prev] : [];
                const maxLen = Math.max(...pages.map(p => p.length));
                for (let i = 0; i < maxLen; i++) {
                    for (const pageItems of pages) {
                        const video = pageItems[i];
                        if (video) {
                            const key = `${video.source}:${video.vod_id}`;
                            if (!seen.has(key)) {
                                seen.add(key);
                                merged.push(video);
                            }
                        }
                    }
                }
                return merged;
            });
        } catch (error) {
            if (requestIdRef.current !== requestId) return;
            console.error('Failed to load videos:', error);
            setHasMore(false);
        } finally {
            if (requestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [sourceId]);

    // Initial load and category change
    useEffect(() => {
        // Invalidate any in-flight fetch from a previous category so it can't overwrite current results
        requestIdRef.current++;

        setPage(1);
        setVideos([]);
        setHasMore(true);

        loadVideos(requestValues, 1, false);
    }, [categoryKey, sourceId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Subscribe to settings changes to handle async source loading
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const settings = settingsStore.getSettings();
            const premiumSources = [
                ...settings.premiumSources,
                ...settings.subscriptions.filter(s => (s as any).group === 'premium')
            ].filter(s => (s as any).enabled !== false);

            const currentSourceCount = premiumSources.length;

            // If we have 0 videos and suddenly gain sources, we should retry loading
            // OR if the number of sources significantly changed (e.g. from 0 to N)
            if (videos.length === 0 && currentSourceCount > 0 && !loading) {
                // Determine if we should reload.
                // Mostly needed when initial load failed due to no sources.
                loadVideos(requestValues, 1, false);
            }
        };

        const unsubscribe = settingsStore.subscribe(handleSettingsUpdate);
        return () => unsubscribe();
    }, [loadVideos, videos.length, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            loadVideos(requestValues, nextPage, true);
        },
    });

    return {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    };
}
