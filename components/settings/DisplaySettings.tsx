'use client';

/**
 * DisplaySettings - Settings for search display and latency
 * Following Liquid Glass design system
 */

import { useState } from 'react';
import { type SearchDisplayMode, type LocaleOption } from '@/lib/store/settings-store';
import { Switch } from '@/components/ui/Switch';

interface DisplaySettingsProps {
    realtimeLatency: boolean;
    searchDisplayMode: SearchDisplayMode;
    rememberScrollPosition: boolean;
    locale: LocaleOption;
    blockedCategories: string[];
    onRealtimeLatencyChange: (enabled: boolean) => void;
    onSearchDisplayModeChange: (mode: SearchDisplayMode) => void;
    onRememberScrollPositionChange: (enabled: boolean) => void;
    onLocaleChange: (locale: LocaleOption) => void;
    onBlockedCategoriesChange: (categories: string[]) => void;
}

export function DisplaySettings({
    realtimeLatency,
    searchDisplayMode,
    rememberScrollPosition,
    locale,
    blockedCategories,
    onRealtimeLatencyChange,
    onSearchDisplayModeChange,
    onRememberScrollPositionChange,
    onLocaleChange,
    onBlockedCategoriesChange,
}: DisplaySettingsProps) {
    const [newCategory, setNewCategory] = useState('');

    const addCategory = () => {
        const trimmed = newCategory.trim();
        if (!trimmed) return;
        if (blockedCategories.includes(trimmed)) {
            setNewCategory('');
            return;
        }
        onBlockedCategoriesChange([...blockedCategories, trimmed]);
        setNewCategory('');
    };

    const removeCategory = (cat: string) => {
        onBlockedCategoriesChange(blockedCategories.filter(c => c !== cat));
    };
    return (
        <div className="bg-surface border border-border rounded-2xl shadow-card p-5 mb-4">
            <h2 className="text-lg font-semibold text-text mb-3">显示设置</h2>

            {/* Remember Scroll Position Toggle */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-text">记住滚动位置</h3>
                        <p className="text-sm text-text-secondary mt-1">
                            退出或刷新页面后，自动恢复到之前的滚动位置
                        </p>
                    </div>
                    <Switch
                        checked={rememberScrollPosition}
                        onChange={onRememberScrollPositionChange}
                        ariaLabel="记住滚动位置开关"
                    />
                </div>
            </div>

            {/* Real-time Latency Toggle */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-text">实时延迟显示</h3>
                        <p className="text-sm text-text-secondary mt-1">
                            开启后，搜索结果中的延迟数值会每 5 秒更新一次
                        </p>
                    </div>
                    <Switch
                        checked={realtimeLatency}
                        onChange={onRealtimeLatencyChange}
                        ariaLabel="实时延迟显示开关"
                    />
                </div>
            </div>

            {/* Search Display Mode */}
            <div>
                <h3 className="font-medium text-text mb-2">搜索结果显示方式</h3>
                <p className="text-sm text-text-secondary mb-4">
                    选择搜索结果的展示模式
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => onSearchDisplayModeChange('normal')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${searchDisplayMode === 'normal'
                            ? 'bg-primary border-primary text-white shadow-primary-glow'
                            : 'bg-surface border-border text-text hover:bg-primary/10'
                            }`}
                    >
                        <div className="font-semibold">默认显示</div>
                        <div className="text-sm opacity-80 mt-1">每个源的结果单独显示</div>
                    </button>
                    <button
                        onClick={() => onSearchDisplayModeChange('grouped')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${searchDisplayMode === 'grouped'
                            ? 'bg-primary border-primary text-white shadow-primary-glow'
                            : 'bg-surface border-border text-text hover:bg-primary/10'
                            }`}
                    >
                        <div className="font-semibold">合并同名源</div>
                        <div className="text-sm opacity-80 mt-1">相同名称的视频合并为一个卡片</div>
                    </button>
                </div>
            </div>

            {/* Locale / Language Toggle */}
            <div className="mt-6">
                <h3 className="font-medium text-text mb-2">界面语言</h3>
                <p className="text-sm text-text-secondary mb-4">
                    切换界面显示的中文字体（简体/繁体）
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => onLocaleChange('zh-CN')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${locale === 'zh-CN'
                            ? 'bg-primary border-primary text-white shadow-primary-glow'
                            : 'bg-surface border-border text-text hover:bg-primary/10'
                            }`}
                    >
                        <div className="font-semibold">简体中文</div>
                        <div className="text-sm opacity-80 mt-1">使用简体中文显示界面</div>
                    </button>
                    <button
                        onClick={() => onLocaleChange('zh-TW')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${locale === 'zh-TW'
                            ? 'bg-primary border-primary text-white shadow-primary-glow'
                            : 'bg-surface border-border text-text hover:bg-primary/10'
                            }`}
                    >
                        <div className="font-semibold">繁體中文</div>
                        <div className="text-sm opacity-80 mt-1">使用繁體中文顯示界面</div>
                    </button>
                </div>
            </div>
            {/* Blocked Categories */}
            <div className="mt-6">
                <h3 className="font-medium text-text mb-2">内容类目过滤</h3>
                <p className="text-sm text-text-secondary mb-4">
                    添加要从搜索结果中隐藏的类目关键词（如&ldquo;伦理&rdquo;），匹配的视频将不会显示
                </p>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                        placeholder="输入类目关键词..."
                        className="flex-1 px-3 py-2 rounded-2xl bg-surface border border-border text-sm text-text placeholder:text-text-secondary focus:outline-none focus:border-primary"
                    />
                    <button
                        onClick={addCategory}
                        disabled={!newCategory.trim()}
                        className="px-4 py-2 rounded-2xl bg-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        添加
                    </button>
                </div>
                {blockedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {blockedCategories.map(cat => (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 text-danger text-sm border border-danger/20"
                            >
                                {cat}
                                <button
                                    onClick={() => removeCategory(cat)}
                                    className="hover:text-danger-dark cursor-pointer"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
