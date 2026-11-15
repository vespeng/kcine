'use client';

import { useEffect, useState } from 'react';
import { PremiumCategoryFilter, PremiumSourceGroup, PremiumTag } from './PremiumCategoryFilter';
import { PremiumContentGrid } from './PremiumContentGrid';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';

export function PremiumContent() {
    const [sources, setSources] = useState<PremiumSourceGroup[]>([]);
    const [activeSourceId, setActiveSourceId] = useState('');
    const [selectedTags, setSelectedTags] = useState<PremiumTag[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(true);

    // 获取各启用高级源的分组分类列表
    useEffect(() => {
        let cancelled = false;

        const fetchSources = async () => {
            try {
                const { settingsStore } = await import('@/lib/store/settings-store');
                const settings = settingsStore.getSettings();
                const enabledSources = settings.premiumSources.filter(s => s.enabled);

                const response = await fetch('/api/premium/types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sources: enabledSources })
                });

                const data = await response.json();
                if (!cancelled && Array.isArray(data.sources)) {
                    setSources(data.sources);
                }
            } catch (error) {
                console.error('Failed to fetch premium sources:', error);
            } finally {
                if (!cancelled) setIsLoadingSources(false);
            }
        };

        fetchSources();
        return () => { cancelled = true; };
    }, []);

    const selectedValues = selectedTags.map(t => t.value);

    const {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    } = usePremiumContent(selectedValues);

    // 点击订阅源：切换源并重置其分类标签
    const handleSourceSelect = (sourceId: string) => {
        setActiveSourceId(sourceId);
        setSelectedTags([]);
    };

    const handleRecommendSelect = () => {
        setActiveSourceId('');
        setSelectedTags([]);
    };

    // 面板多选：「全部」清空，其余按 id 切换
    const handleToggleTag = (tag: PremiumTag) => {
        if (!tag.value) {
            setSelectedTags([]);
            return;
        }
        setSelectedTags(prev => {
            if (prev.some(t => t.id === tag.id)) {
                return prev.filter(t => t.id !== tag.id);
            }
            return [...prev, tag];
        });
    };

    if (isLoadingSources) {
        return (
            <div className="flex items-center gap-2 py-4 px-1">
                <span className="text-sm text-text-secondary">正在加载订阅源...</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PremiumCategoryFilter
                sources={sources}
                activeSourceId={activeSourceId}
                selectedTags={selectedTags}
                onRecommendSelect={handleRecommendSelect}
                onSourceSelect={handleSourceSelect}
                onToggleTag={handleToggleTag}
            />

            <PremiumContentGrid
                videos={videos}
                loading={loading}
                hasMore={hasMore}
                prefetchRef={prefetchRef}
                loadMoreRef={loadMoreRef}
            />
        </div>
    );
}
