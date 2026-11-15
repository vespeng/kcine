'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SiteLogo } from '@/components/SiteLogo';
import { Icons } from '@/components/ui/Icon';
import { useSiteInfo } from '@/components/SiteInfoProvider';
import { clearSession, getSession } from '@/lib/store/auth-store';
import { NavbarSearch, type NavbarSearchConfig } from './NavbarSearch';

interface NavbarProps {
    /** 点击 Logo 时的复位回调（搜索页用于清空搜索态） */
    onReset?: () => void;
    isPremiumMode?: boolean;
    /** 顶栏搜索配置；缺省时提交搜索后跳转对应首页 */
    search?: NavbarSearchConfig;
    /** 是否显示顶栏搜索框，默认常驻显示 */
    showSearch?: boolean;
    /** 汉堡按钮点击回调（移动端打开导航抽屉） */
    onMenuClick?: () => void;
}

export function Navbar({ onReset, isPremiumMode = false, search, showSearch = true, onMenuClick }: NavbarProps) {
    const settingsHref = isPremiumMode ? '/premium/settings' : '/settings';
    const favoritesHref = isPremiumMode ? '/premium/favorites' : '/favorites';
    const historyHref = isPremiumMode ? '/premium/history' : '/history';
    const siteInfo = useSiteInfo();
    // 登录态在客户端读取（localStorage），首帧置空避免 SSR 水合不一致
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        setLoggedIn(!!getSession());
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
        } catch {
            // 尽力而为：即使请求失败也清除本地会话
        }
        clearSession();
        window.location.reload();
    };

    return (
        <nav className="sticky top-0 z-nav pt-3 pb-1.5 transform-gpu will-change-transform">
            <div className="w-full px-6">
                <div className="py-1.5 sm:py-2.5">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* 左右两侧等宽，保证搜索框始终居于顶栏正中 */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            {onMenuClick && (
                                <button
                                    type="button"
                                    onClick={onMenuClick}
                                    aria-label="打开导航菜单"
                                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                    data-focusable
                                >
                                    <Icons.Menu size={20} />
                                </button>
                            )}
                            <Link
                                href={isPremiumMode ? '/premium' : '/'}
                                className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0"
                                onClick={onReset}
                                data-focusable
                            >
                                <div className="w-8 h-8 md:w-10 md:h-10 relative flex items-center justify-center shrink-0">
                                    <SiteLogo />
                                </div>
                                <h1 className="text-lg md:text-xxl font-bold text-text truncate">{siteInfo.name}</h1>
                            </Link>
                        </div>

                        {/* 独立搜索框：全站常驻居中；未传配置的页面提交后跳转首页搜索 */}
                        {showSearch && (
                            <div className="w-full max-w-xl min-w-0">
                                <NavbarSearch {...search} isPremium={isPremiumMode} />
                            </div>
                        )}

                        <div className="flex-1 min-w-0 flex items-center justify-end gap-2 sm:gap-3">
                            <Link
                                href={favoritesHref}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                aria-label="我的收藏"
                                data-focusable
                            >
                                <Icons.Heart size={20} />
                            </Link>
                            <Link
                                href={historyHref}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                aria-label="观看历史"
                                title="观看历史"
                                data-focusable
                            >
                                <Icons.History size={20} />
                            </Link>
                            <Link
                                href={settingsHref}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                aria-label="设置"
                                data-focusable
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                                </svg>
                            </Link>
                            {/* Theme switcher is hidden in premium mode (theme is forced to dark) */}
                            {!isPremiumMode && <ThemeSwitcher />}
                            {/* Logout button: only shown when a session exists */}
                            {loggedIn && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    aria-label="退出登录"
                                    title="退出登录"
                                    data-focusable
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:text-danger hover:border-danger/30 transition-all duration-200 cursor-pointer"
                                >
                                    <LogOut size={16} className="sm:w-5 sm:h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
