'use client';

import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/ui/Icon';
import type { PremiumSourceGroup } from './PremiumSourcesProvider';

export interface PremiumTag {
    id: string;
    label: string;
    value: string;
}

interface PremiumCategoryFilterProps {
    /** 左侧导航当前选中的订阅源 */
    source: PremiumSourceGroup;
    selectedTags: PremiumTag[];
    onToggleTag: (tag: PremiumTag) => void;
}

/**
 * 高级内容分类筛选：交互与普通模式 CategoryFilter 一致，
 * 「筛选」按钮展开文档流内的分类标签面板，支持多选
 */
export function PremiumCategoryFilter({
    source,
    selectedTags,
    onToggleTag,
}: PremiumCategoryFilterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 切换订阅源时收起面板，避免残留上一源的分类
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [source.sourceId]);

    // 点击面板外或按 Esc 时收起下拉
    useEffect(() => {
        if (!isDropdownOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsDropdownOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDropdownOpen]);

    const optionButtonClass = (active: boolean) => `
        px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none
        ${active ? 'bg-primary text-white shadow-md' : 'text-text hover:bg-primary/10'}
    `;

    return (
        <div ref={containerRef} className="mb-8 pt-2 px-1">
            <div className="flex items-center gap-3 flex-wrap">
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
            </div>

            {/* 标签面板：文档流内高度过渡展开，推下后续内容 */}
            <div
                className={`grid transition-all duration-250 ease-fluid ${
                    isDropdownOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-3 rounded-2xl bg-surface backdrop-blur-xl border border-border shadow-overlay p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <span className="w-16 pt-1.5 text-sm text-text-secondary select-none shrink-0">
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
                                {source.categories.map((category) => {
                                    const tag: PremiumTag = {
                                        id: `${source.sourceId}:${category.id}`,
                                        label: category.name,
                                        value: `${source.sourceId}:${category.id}`,
                                    };
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => onToggleTag(tag)}
                                            className={optionButtonClass(selectedTags.some((item) => item.id === tag.id))}
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
        </div>
    );
}
