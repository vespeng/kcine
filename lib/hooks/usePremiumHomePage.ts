import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchCache } from '@/lib/hooks/useSearchCache';
import { useParallelSearch } from '@/lib/hooks/useParallelSearch';
import { useSubscriptionSync } from '@/lib/hooks/useSubscriptionSync';
import { settingsStore } from '@/lib/store/settings-store';
import { VideoSource } from '@/lib/types';

export function usePremiumHomePage() {
    useSubscriptionSync();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loadFromCache, saveToCache } = useSearchCache();
    const hasLoadedCache = useRef(false);
    const hasSearchedWithSourcesRef = useRef(false);

    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [currentSortBy, setCurrentSortBy] = useState('default');
    // 记录上次 URL 中的 q，用于识别浏览器前进/后退触发的 URL 变化
    const prevUrlQueryRef = useRef<string | null>(null);

    // Use state for sources to trigger re-renders when they update
    const [enabledPremiumSources, setEnabledPremiumSources] = useState<VideoSource[]>([]);

    const onUrlUpdate = useCallback((q: string) => {
        // 同一 q 已在 URL 中时跳过，避免初始恢复搜索时重复入栈
        if (searchParams.get('q') === q) return;
        router.push(`/premium?q=${encodeURIComponent(q)}`, { scroll: false });
    }, [router, searchParams]);

    // Search stream hook
    const {
        loading,
        results,
        availableSources,
        completedSources,
        totalSources,
        performSearch,
        resetSearch,
        cancelSearch,
        loadCachedResults,
        applySorting,
        loadMore,
        hasMore,
        loadingMore,
    } = useParallelSearch(
        saveToCache,
        onUrlUpdate
    );

    // Core search execution function - extracted to eliminate duplication
    const executeSearch = useCallback((searchQuery: string, sources: VideoSource[]) => {
        if (!searchQuery.trim()) return false;

        if (sources.length === 0) {
            return false;
        }

        performSearch(searchQuery, sources, currentSortBy as any);
        hasSearchedWithSourcesRef.current = true;
        return true;
    }, [performSearch, currentSortBy]);

    // Re-sort results when sort preference changes
    useEffect(() => {
        if (hasSearched && results.length > 0) {
            applySorting(currentSortBy as any);
        }
    }, [currentSortBy, applySorting, hasSearched, results.length]);

    // Load sources and subscribe to changes
    useEffect(() => {
        const updateSettings = () => {
            const settings = settingsStore.getSettings();

            // Update sort preference if changed
            // Note: settings.sortBy might be shared or we might want specific one, 
            // but for now we follow the store or keep local state if we want independence.
            // The original hook had local state 'default'.

            const newPremiumSources = settings.premiumSources.filter(s => s.enabled);
            setEnabledPremiumSources(newPremiumSources);

            // Check if we need to re-trigger search due to new sources being loaded
            const hasSources = newPremiumSources.length > 0;

            // If we have a query, and we haven't searched with sources yet,
            // and we suddenly have sources, trigger the search.
            if (query && hasSources && !hasSearchedWithSourcesRef.current && !loading) {
                if (executeSearch(query, newPremiumSources)) {
                    setHasSearched(true);
                }
            }
        };

        // Initial load
        updateSettings();

        // Subscribe to changes
        const unsubscribe = settingsStore.subscribe(updateSettings);
        return () => unsubscribe();
    }, [query, loading, executeSearch]);

    // Load cached results on mount
    useEffect(() => {
        if (hasLoadedCache.current) return;
        hasLoadedCache.current = true;

        const urlQuery = searchParams.get('q');

        if (urlQuery) {
            setQuery(urlQuery);
            // We need to wait for sources to be available, which is handled by the subscription effect
            // But if sources are already available (e.g. navigation), execute immediately
            const currentSettings = settingsStore.getSettings();
            const currentSources = currentSettings.premiumSources.filter(s => s.enabled);

            if (currentSources.length > 0) {
                handleSearch(urlQuery);
            }
            // If no sources yet, the useEffect above will catch it when they load
        }
    }, [searchParams]);

    // 浏览器前进/后退时同步页面状态：回到首页清空搜索，切回旧搜索重新拉取
    useEffect(() => {
        const urlQuery = searchParams.get('q') || '';
        // 首次运行由挂载恢复逻辑处理，仅记录初始 URL
        if (prevUrlQueryRef.current === null) {
            prevUrlQueryRef.current = urlQuery;
            return;
        }
        if (urlQuery === prevUrlQueryRef.current) return;
        prevUrlQueryRef.current = urlQuery;

        if (!urlQuery) {
            if (hasSearched) {
                hasSearchedWithSourcesRef.current = false;
                setQuery('');
                setHasSearched(false);
                resetSearch();
            }
            return;
        }

        if (urlQuery === query) return;
        handleSearch(urlQuery);
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        setHasSearched(true);
        // Use current state of sources
        executeSearch(searchQuery, enabledPremiumSources);
    };

    const handleReset = () => {
        setHasSearched(false);
        setQuery('');
        hasSearchedWithSourcesRef.current = false;
        resetSearch();
        router.push('/premium', { scroll: false });
    };

    return {
        query,
        hasSearched,
        loading,
        results,
        availableSources,
        completedSources,
        totalSources,
        handleSearch,
        handleReset,
        handleCancelSearch: cancelSearch,
        loadMore,
        hasMore,
        loadingMore,
    };
}
