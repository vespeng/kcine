'use client';

import { useEffect, useState } from 'react';
import { PremiumCategoryFilter, type PremiumTag } from './PremiumCategoryFilter';
import { PremiumContentGrid } from './PremiumContentGrid';
import { usePremiumSources } from './PremiumSourcesProvider';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';

/**
 * 高级首页内容区：源由左侧导航选定，此处仅负责分类标签筛选与内容栅格
 */
export function PremiumContent() {
    const premium = usePremiumSources();
    const [selectedTags, setSelectedTags] = useState<PremiumTag[]>([]);

    const activeSourceId = premium?.activeSourceId ?? '';
    const activeSource = premium?.sources.find((source) => source.sourceId === activeSourceId);

    // 切换订阅源时清空上一源的分类标签
    useEffect(() => {
        setSelectedTags([]);
    }, [activeSourceId]);

    const selectedValues = selectedTags.map((tag) => tag.value);

    const {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    } = usePremiumContent(selectedValues, activeSourceId);

    // 分类面板多选：「全部」清空，其余按 id 切换
    const handleToggleTag = (tag: PremiumTag) => {
        if (!tag.value) {
            setSelectedTags([]);
            return;
        }
        setSelectedTags((prev) => {
            if (prev.some((item) => item.id === tag.id)) {
                return prev.filter((item) => item.id !== tag.id);
            }
            return [...prev, tag];
        });
    };

    return (
        <div className="animate-fade-in">
            {activeSource && (
                <PremiumCategoryFilter
                    source={activeSource}
                    selectedTags={selectedTags}
                    onToggleTag={handleToggleTag}
                />
            )}

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
