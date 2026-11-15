import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

interface DoubanMovie {
    id: string;
    title: string;
    cover: string;
    rate: string;
    url: string;
}

const PAGE_LIMIT = 20;
const POPULAR_CACHE_KEY = 'kcine_popular_cache';

// Daily reset: cache entries are validated against today's date string
const getTodayKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

interface PopularCacheEntry {
    movies: DoubanMovie[];
    hasMore: boolean;
    page: number;
    dateKey: string;
}

interface PopularCache {
    [key: string]: PopularCacheEntry;
}

const loadPopularCache = (): PopularCache => {
    try {
        const cached = localStorage.getItem(POPULAR_CACHE_KEY);
        if (!cached) return {};
        const data = JSON.parse(cached) as PopularCache;
        const todayKey = getTodayKey();
        const validCache: PopularCache = {};
        for (const [key, entry] of Object.entries(data)) {
            // Drop entries from previous days (daily reset)
            if (entry && entry.dateKey === todayKey) {
                validCache[key] = entry;
            }
        }
        return validCache;
    } catch {
        return {};
    }
};

const savePopularCache = (cache: PopularCache): void => {
    try {
        localStorage.setItem(POPULAR_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('[PopularCache] Failed to save:', error);
    }
};

export function usePopularMovies(selectedTags: string[], contentType: 'movie' | 'tv' = 'movie') {
    const [movies, setMovies] = useState<DoubanMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    // Guard to prevent the cache-save effect from writing during a cache restore
    const isRestoringRef = useRef(false);
    // Tracks the latest request so stale fetches can be discarded during rapid tag switching
    const requestIdRef = useRef(0);

    // 空选中清回默认标签；缓存键基于标签名拼接
    const tagList = selectedTags.filter(Boolean);
    const effectiveTags = tagList.length > 0 ? tagList : ['热门'];
    const tagKey = effectiveTags.join('|');

    const loadMovies = useCallback(async (tags: string[], pageStart: number, append = false) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            // 豆瓣接口单次只接受一个标签，多选时并行请求后在合并阶段交错去重
            const pages = await Promise.all(
                tags.map(tag =>
                    fetch(
                        `/api/douban/recommend?type=${contentType}&tag=${encodeURIComponent(tag)}&page_limit=${PAGE_LIMIT}&page_start=${pageStart}`
                    )
                        .then(res => {
                            if (!res.ok) throw new Error('Failed to fetch');
                            return res.json();
                        })
                        .then(data => (data.subjects || []) as DoubanMovie[])
                )
            );

            // Drop stale results if the user switched tags during the fetch
            if (requestIdRef.current !== requestId) return;

            setHasMore(pages.some(p => p.length === PAGE_LIMIT));
            // Update page after a successful fetch so a stale request can't corrupt pagination
            setPage(Math.floor(pageStart / PAGE_LIMIT));
            setMovies(prev => {
                // Round-robin interleave of each tag's page, deduped by id
                const seen = new Set(append ? prev.map(m => m.id) : []);
                const merged: DoubanMovie[] = append ? [...prev] : [];
                const maxLen = Math.max(...pages.map(p => p.length));
                for (let i = 0; i < maxLen; i++) {
                    for (const pageItems of pages) {
                        const movie = pageItems[i];
                        if (movie && !seen.has(movie.id)) {
                            seen.add(movie.id);
                            merged.push(movie);
                        }
                    }
                }
                return merged;
            });
        } catch (error) {
            if (requestIdRef.current !== requestId) return;
            console.error('Failed to load movies:', error);
            setHasMore(false);
        } finally {
            if (requestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [contentType]);

    useEffect(() => {
        // Invalidate any in-flight fetch from a previous tag/type so it can't overwrite current results
        requestIdRef.current++;

        // Try cache first to avoid redundant fetches when switching back to a visited tag
        const cache = loadPopularCache();
        const cacheKey = `${contentType}:${tagKey}`;
        const cachedEntry = cache[cacheKey];
        if (cachedEntry && cachedEntry.movies.length > 0) {
            isRestoringRef.current = true;
            // Dedupe by id: cache entries saved before the append fix may contain duplicates
            const seenIds = new Set<string>();
            const dedupedMovies = cachedEntry.movies.filter(m => {
                if (seenIds.has(m.id)) return false;
                seenIds.add(m.id);
                return true;
            });
            setMovies(dedupedMovies);
            setHasMore(cachedEntry.hasMore);
            setPage(cachedEntry.page);
            // Reset loading in case a previous tag's fetch is still in-flight
            setLoading(false);
            return;
        }

        // Cache miss — fetch fresh
        setPage(0);
        setMovies([]);
        setHasMore(true);
        loadMovies(effectiveTags, 0, false);
    }, [tagKey, contentType]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to cache whenever results change (covers initial fetch + infinite scroll appends)
    useEffect(() => {
        if (movies.length === 0) return;
        // Skip the write right after a cache restore (data is identical)
        if (isRestoringRef.current) {
            isRestoringRef.current = false;
            return;
        }
        const cache = loadPopularCache();
        const cacheKey = `${contentType}:${tagKey}`;
        cache[cacheKey] = {
            movies,
            hasMore,
            page,
            dateKey: getTodayKey(),
        };
        savePopularCache(cache);
    }, [movies, hasMore, page, tagKey, contentType]);

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            // page is updated inside loadMovies after a successful fetch,
            // so a stale loadMore can't advance the pagination state
            loadMovies(effectiveTags, nextPage * PAGE_LIMIT, true);
        },
    });

    return {
        movies,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    };
}
