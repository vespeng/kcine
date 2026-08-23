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

export function usePopularMovies(selectedTag: string, tags: any[], contentType: 'movie' | 'tv' = 'movie') {
    const [movies, setMovies] = useState<DoubanMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    // Guard to prevent the cache-save effect from writing during a cache restore
    const isRestoringRef = useRef(false);
    // Tracks the latest request so stale fetches can be discarded during rapid tag switching
    const requestIdRef = useRef(0);

    const loadMovies = useCallback(async (tag: string, pageStart: number, append = false) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const tagValue = tags.find(t => t.id === tag)?.value || '热门';
            const response = await fetch(
                `/api/douban/recommend?type=${contentType}&tag=${encodeURIComponent(tagValue)}&page_limit=${PAGE_LIMIT}&page_start=${pageStart}`
            );

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const newMovies: DoubanMovie[] = data.subjects || [];

            // Drop stale results if the user switched tags during the fetch
            if (requestIdRef.current !== requestId) return;

            setMovies(prev => {
                if (!append) return newMovies;
                // Dedupe by id: douban pages may overlap across fetches
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...newMovies.filter(m => !seen.has(m.id))];
            });
            setHasMore(newMovies.length === PAGE_LIMIT);
            // Update page after a successful fetch so a stale request can't corrupt pagination
            setPage(Math.floor(pageStart / PAGE_LIMIT));
        } catch (error) {
            if (requestIdRef.current !== requestId) return;
            console.error('Failed to load movies:', error);
            setHasMore(false);
        } finally {
            if (requestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [tags, contentType]);

    useEffect(() => {
        // Invalidate any in-flight fetch from a previous tag/type so it can't overwrite current results
        requestIdRef.current++;

        // Try cache first to avoid redundant fetches when switching back to a visited tag
        if (selectedTag) {
            const cache = loadPopularCache();
            const cacheKey = `${contentType}:${selectedTag}`;
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
        }

        // Cache miss — fetch fresh
        setPage(0);
        setMovies([]);
        setHasMore(true);
        loadMovies(selectedTag, 0, false);
    }, [selectedTag, contentType]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to cache whenever results change (covers initial fetch + infinite scroll appends)
    useEffect(() => {
        if (!selectedTag || movies.length === 0) return;
        // Skip the write right after a cache restore (data is identical)
        if (isRestoringRef.current) {
            isRestoringRef.current = false;
            return;
        }
        const cache = loadPopularCache();
        const cacheKey = `${contentType}:${selectedTag}`;
        cache[cacheKey] = {
            movies,
            hasMore,
            page,
            dateKey: getTodayKey(),
        };
        savePopularCache(cache);
    }, [movies, hasMore, page, selectedTag, contentType]);

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            // page is updated inside loadMovies after a successful fetch,
            // so a stale loadMore can't advance the pagination state
            loadMovies(selectedTag, nextPage * PAGE_LIMIT, true);
        },
    });

    // Force a cache-bypassing refresh of the current tag (e.g. re-clicking the active tag)
    const refresh = useCallback(() => {
        // Drop the cache entry for the current tag/type so the refresh actually re-fetches
        const cache = loadPopularCache();
        const cacheKey = `${contentType}:${selectedTag}`;
        delete cache[cacheKey];
        savePopularCache(cache);
        // Invalidate any in-flight fetch
        requestIdRef.current++;
        // Reset and refetch
        setPage(0);
        setMovies([]);
        setHasMore(true);
        loadMovies(selectedTag, 0, false);
    }, [selectedTag, contentType, loadMovies]);

    return {
        movies,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
        refresh,
    };
}
