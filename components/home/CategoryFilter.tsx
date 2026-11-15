'use client';

import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/ui/Icon';

/**
 * 豆瓣/TMDB 共用的标签分组配置，按精选/类型/地区/年份分组展示。
 * 「全部」重置为默认标签「热门」；接口不支持组合查询，多选由前端并行请求交错合并。
 */
export interface TagGroup {
    label: string;
    tags: string[];
}

const DEFAULT_TAG = '热门';
const ALL_OPTION = '全部';
const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const CATEGORY_TAGS: Record<'movie' | 'tv', TagGroup[]> = {
    movie: [
        { label: '精选', tags: ['最新', '豆瓣高分', '冷门佳片', '经典'] },
        { label: '类型', tags: ['喜剧', '爱情', '动作', '恐怖', '科幻', '剧情', '犯罪', '奇幻', '战争', '悬疑', '冒险', '历史', '动画'] },
        { label: '国家/地区', tags: ['华语', '大陆', '香港', '台湾', '美国', '英国', '法国', '德国', '意大利', '西班牙', '印度', '泰国', '韩国', '日本'] },
        { label: '年份', tags: YEARS },
    ],
    tv: [
        { label: '精选', tags: ['最新', '豆瓣高分', '冷门佳片'] },
        { label: '类型', tags: ['国产剧', '美剧', '日剧', '韩剧', '港剧', '英剧', '日本动画', '综艺', '纪录片'] },
        { label: '年份', tags: YEARS },
    ],
};

interface CategoryFilterProps {
    contentType: 'movie' | 'tv';
    selectedTags: string[];
    isRecommendActive: boolean;
    recommendAvailable: boolean;
    /** 是否显示推荐/电影/剧集分类切换行（独立路由仅保留标签筛选时为 false） */
    showCategories?: boolean;
    /** 标签分组覆盖（综艺/动漫等专属频道），缺省按 contentType 使用默认分组 */
    tagGroups?: TagGroup[];
    onRecommendSelect: () => void;
    onContentTypeChange: (type: 'movie' | 'tv') => void;
    onTagSelect: (tag: string) => void;
}

export function CategoryFilter({
    contentType,
    selectedTags,
    isRecommendActive,
    recommendAvailable,
    showCategories = true,
    tagGroups,
    onRecommendSelect,
    onContentTypeChange,
    onTagSelect,
}: CategoryFilterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const groups: TagGroup[] = (tagGroups ?? CATEGORY_TAGS[contentType]).map((group) => ({
        ...group,
        tags: [ALL_OPTION, ...group.tags],
    }));

    const chipShellClass = (active: boolean) => `
        flex items-center rounded-full transition-all select-none
        ${active
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
        }
    `;

    const optionButtonClass = (active: boolean) => `
        px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none
        ${active ? 'bg-primary text-white shadow-md' : 'text-text hover:bg-primary/10'}
    `;

    // 点击分类主体：切换分类并重置为「全部」，不展开下拉
    const handleCategoryClick = (type: 'movie' | 'tv') => {
        if (type === contentType && !isRecommendActive) return;
        onContentTypeChange(type);
    };

    return (
        <div ref={containerRef} className="mb-8 pt-2 px-1">
            {/* 分类行：推荐 / 电影 / 剧集；独立路由模式下仅显示筛选按钮 */}
            <div className="flex items-center gap-3 flex-wrap">
                {!showCategories ? (
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-expanded={isDropdownOpen}
                        className="flex items-center gap-1 pl-4 pr-2 py-1.5 text-xs font-medium whitespace-nowrap rounded-full cursor-pointer select-none bg-surface backdrop-blur-xl text-text border border-border hover:border-primary transition-all"
                    >
                        筛选
                        <Icons.ChevronDown
                            size={14}
                            className={`transition-transform duration-250 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                ) : (
                    <>
                        {recommendAvailable && (
                            <button
                                type="button"
                                onClick={onRecommendSelect}
                                className={`px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none ${
                                    isRecommendActive
                                        ? 'bg-primary text-white shadow-md scale-105'
                                        : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
                                }`}
                            >
                                推荐
                            </button>
                        )}
                        {(['movie', 'tv'] as const).map((type) => {
                            const isActive = type === contentType && !isRecommendActive;
                            return (
                                <div key={type} className={chipShellClass(isActive)}>
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryClick(type)}
                                        className="pl-4 pr-2 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer"
                                    >
                                        {type === 'movie' ? '电影' : '剧集'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        aria-label={`展开${type === 'movie' ? '电影' : '剧集'}标签`}
                                        className="pr-3 py-1.5 -ml-1 flex items-center cursor-pointer"
                                    >
                                        <Icons.ChevronDown
                                            size={14}
                                            className={`transition-transform duration-250 ${isDropdownOpen && isActive ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* 标签面板：文档流内高度过渡展开，推下后续内容 */}
            <div
                className={`grid transition-all duration-250 ease-fluid ${
                    isDropdownOpen && !isRecommendActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-3 rounded-2xl bg-surface backdrop-blur-xl border border-border p-6 flex flex-col gap-4">
                        {groups.map((group) => (
                            <div key={group.label} className="flex items-start gap-4">
                                <span className="w-16 pt-1.5 text-sm text-text-secondary select-none shrink-0">
                                    {group.label}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {group.tags.map((tag) => {
                                        const value = tag === ALL_OPTION ? DEFAULT_TAG : tag;
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => onTagSelect(value)}
                                                className={optionButtonClass(selectedTags.includes(value))}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
