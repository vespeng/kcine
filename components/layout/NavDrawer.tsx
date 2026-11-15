'use client';

import { useEffect, useRef } from 'react';
import { SiteLogo } from '@/components/SiteLogo';
import { useSiteInfo } from '@/components/SiteInfoProvider';
import { trapFocus } from '@/lib/accessibility/focus-management';
import { SidebarMenu } from './Sidebar';

interface NavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isPremium?: boolean;
}

/**
 * 移动端导航抽屉：汉堡按钮触发，承载与桌面 Sidebar 一致的菜单。
 */
export function NavDrawer({ isOpen, onClose, isPremium = false }: NavDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const siteInfo = useSiteInfo();

    // 打开期间启用焦点圈定与 Escape 关闭
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            const cleanupFocusTrap = trapFocus(drawerRef.current);
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleEscape);
            return () => {
                cleanupFocusTrap();
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-nav-backdrop bg-black/40 opacity-0 animate-fade md:hidden"
                    onClick={onClose}
                />
            )}

            <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="站点导航"
                aria-hidden={!isOpen}
                className={`fixed top-0 left-0 bottom-0 md:hidden ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'} will-change-transform w-drawer sm:w-drawer-sm max-w-sidebar z-nav bg-surface backdrop-blur-glass backdrop-saturate-glass border-r border-border rounded-tr-2xl rounded-br-2xl flex flex-col shadow-card transition-[transform,visibility] duration-250 ease-out`}
            >
                <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                    <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                        <SiteLogo />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-xxl font-bold text-text truncate">{siteInfo.name}</h1>
                    </div>
                </div>

                <SidebarMenu isPremium={isPremium} onNavigate={onClose} />
            </div>
        </>
    );
}
