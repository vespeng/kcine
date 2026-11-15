'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { useRuntimeFeatures } from '@/components/RuntimeFeaturesProvider';
import { hasPermission } from '@/lib/store/auth-store';
import { usePremiumSources } from '@/components/premium/PremiumSourcesProvider';
import type { ComponentType } from 'react';

interface MenuItem {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string; size?: number }>;
    /** 精确匹配的路径集合（首页需区分 premium 变体） */
    exactPaths: string[];
}

interface SidebarMenuProps {
    isPremium?: boolean;
    /** 菜单项点击后的回调（移动端抽屉用于关闭自身） */
    onNavigate?: () => void;
}

/** 左侧导航菜单项定义，桌面 Sidebar 与移动 NavDrawer 共用 */
const MENU_ITEMS: MenuItem[] = [
    { href: '/', label: '首页', icon: Icons.Home, exactPaths: ['/', '/premium'] },
    { href: '/recommend', label: '推荐', icon: Icons.Sparkles, exactPaths: ['/recommend'] },
    { href: '/movies', label: '电影', icon: Icons.Film, exactPaths: ['/movies'] },
    { href: '/tv', label: '剧集', icon: Icons.TV, exactPaths: ['/tv'] },
    { href: '/variety', label: '综艺', icon: Icons.Play, exactPaths: ['/variety'] },
    { href: '/anime', label: '动漫', icon: Icons.Zap, exactPaths: ['/anime'] },
];

/**
 * 共享菜单列表：premium 模式下首页指向 /premium，其余项为公共豆瓣浏览路由；
 * 高级首页改由订阅源列表驱动选源，IPTV 仅在启用且具备访问权限时展示。
 */
export function SidebarMenu({ isPremium = false, onNavigate }: SidebarMenuProps) {
    const pathname = usePathname();
    const { iptvEnabled } = useRuntimeFeatures();
    const premiumSources = usePremiumSources();
    const showIptv = iptvEnabled && hasPermission('iptv_access');

    // 高级首页：左侧展示已配置订阅源，选中后驱动右侧内容筛选
    if (isPremium && premiumSources) {
        return <PremiumSourceNav {...premiumSources} onNavigate={onNavigate} />;
    }

    const menuItems = showIptv
        ? [...MENU_ITEMS, { href: '/iptv', label: '直播', icon: Icons.Radio, exactPaths: ['/iptv'] } as MenuItem]
        : MENU_ITEMS;

    return (
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="站点导航">
            {menuItems.map((item) => {
                const href = isPremium && item.href === '/' ? '/premium' : item.href;
                const isActive = item.exactPaths.includes(pathname);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.label}
                        href={href}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-4 px-4 min-h-touch rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                            isActive
                                ? 'bg-primary text-white shadow-primary-glow-sm'
                                : 'text-text hover:bg-primary/10'
                        }`}
                        data-focusable
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

interface PremiumSourceNavProps {
    sources: { sourceId: string; sourceName: string }[];
    loading: boolean;
    activeSourceId: string;
    setActiveSourceId: (id: string) => void;
    onNavigate?: () => void;
}

/** 高级模式订阅源导航：推荐 + 各启用源，点击切换筛选范围 */
function PremiumSourceNav({
    sources,
    loading,
    activeSourceId,
    setActiveSourceId,
    onNavigate,
}: PremiumSourceNavProps) {
    const items: { id: string; label: string; icon: ComponentType<{ className?: string; size?: number }> }[] = [
        { id: '', label: '今日推荐', icon: Icons.Sparkles },
        ...sources.map((source) => ({ id: source.sourceId, label: source.sourceName, icon: Icons.Globe })),
    ];

    return (
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="订阅源导航">
            <p className="px-4 pb-2 text-xs text-text-secondary">订阅源</p>
            {loading ? (
                <p className="px-4 py-2 text-sm text-text-secondary">正在加载订阅源…</p>
            ) : (
                items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeSourceId;
                    return (
                        <button
                            type="button"
                            key={item.label}
                            onClick={() => {
                                setActiveSourceId(item.id);
                                onNavigate?.();
                            }}
                            aria-pressed={isActive}
                            className={`flex items-center gap-4 px-4 min-h-touch rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                                isActive
                                    ? 'bg-primary text-white shadow-primary-glow-sm'
                                    : 'text-text hover:bg-primary/10'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="truncate">{item.label}</span>
                        </button>
                    );
                })
            )}
            {!loading && sources.length === 0 && (
                <p className="px-4 py-2 text-xs text-text-secondary">暂无可用订阅源</p>
            )}
        </nav>
    );
}

interface SidebarProps {
    isPremium?: boolean;
}

/**
 * 桌面端左侧导航侧栏：仅承载站点菜单，Logo 由全站顶栏统一渲染。
 * self-start 避免 flex 拉伸到整行高度，否则吸顶无滑动空间；偏移取 --spacing-navbar。
 */
export function Sidebar({ isPremium = false }: SidebarProps) {
    return (
        <aside className="hidden md:flex md:w-sidenav md:self-start md:sticky md:top-navbar shrink-0 flex-col">
            <SidebarMenu isPremium={isPremium} />
        </aside>
    );
}
