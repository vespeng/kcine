'use client';

import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/ui/Icon';

export interface PremiumTag {
    id: string;
    label: string;
    value: string;
}

export interface PremiumSourceGroup {
    sourceId: string;
    sourceName: string;
    categories: { id: string; name: string }[];
}

interface PremiumCategoryFilterProps {
    sources: PremiumSourceGroup[];
    activeSourceId: string;
    selectedTags: PremiumTag[];
    onRecommendSelect: () => void;
    onSourceSelect: (sourceId: string) => void;
    onToggleTag: (tag: PremiumTag) => void;
}

export function PremiumCategoryFilter({
    sources,
    activeSourceId,
    selectedTags,
    onRecommendSelect,
    onSourceSelect,
    onToggleTag,
}: PremiumCategoryFilterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeSource = sources.find(s => s.sourceId === activeSourceId);
    const isRecommendActive = !activeSourceId;

    // 点击面板外或按 Esc 时收起下拉
    useEffect(() => {
        if (!isDropdownOpen) return;

        const handlePointerDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsDropdownOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDropdownOpen]);

    const chipShellClass = (active: boolean) => `
        flex items-center rounded-full transition-all select-none flex-shrink-0
        ${active
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
        }
    `;

    const optionButtonClass = (active: boolean) => `
        px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none
        ${active ? 'bg-primary text-white shadow-md' : 'text-text hover:bg-primary/10'}
    `;

    return (
        <div ref={containerRef} className="mb-8 pt-2 px-1">
            {/* 源分类行：今日推荐 + 各订阅源；激活源箭头可展开其分类标签面板 */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={onRecommendSelect}
                    className={`px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none flex-shrink-0 ${
                        isRecommendActive
                            ? 'bg-primary text-white shadow-md scale-105'
                            : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
                    }`}
                >
                    今日推荐
                </button>
                {sources.map((source) => {
                    const isActive = source.sourceId === activeSourceId;
                    return (
                        <div key={source.sourceId} className={chipShellClass(isActive)}>
                            <button
                                type="button"
                                onClick={() => onSourceSelect(source.sourceId)}
                                className="pl-4 pr-2 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer"
                            >
                                {source.sourceName}
                            </button>
                            {isActive && (
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    aria-label={`展开${source.sourceName}分类标签`}
                                    className="pr-3 py-1.5 -ml-1 flex items-center cursor-pointer"
                                >
                                    <Icons.ChevronDown
                                        size={14}
                                        className={`transition-transform duration-250 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 激活源的分类标签面板：文档流内高度过渡展开，推下后续内容 */}
            <div
                className={`grid transition-all duration-250 ease-fluid ${
                    isDropdownOpen && activeSource ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-3 rounded-2xl bg-surface backdrop-blur-xl border border-border shadow-overlay p-6 flex items-start gap-4">
                        <span className="w-16 pt-1.5 text-sm text-text-secondary select-none flex-shrink-0">
                            分类
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => onToggleTag({ id: 'all', label: '全部', value: '' })}
                                className={optionButtonClass(selectedTags.length === 0)}
                            >
                                全部
                            </button>
                            {activeSource?.categories.map((category) => {
                                const tag: PremiumTag = {
                                    id: `${activeSource.sourceId}:${category.id}`,
                                    label: category.name,
                                    value: `${activeSource.sourceId}:${category.id}`,
                                };
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => onToggleTag(tag)}
                                        className={optionButtonClass(selectedTags.some(t => t.id === tag.id))}
                                    >
                                        {tag.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
