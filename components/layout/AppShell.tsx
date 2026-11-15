'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NavDrawer } from './NavDrawer';
import type { NavbarSearchConfig } from './NavbarSearch';

interface AppShellProps {
  /** 顶栏下方的页面内容 */
  children: ReactNode;
  isPremium?: boolean;
  /** 点击站点 Logo 时的复位回调（搜索页用于清空搜索态） */
  onReset?: () => void;
  /** 顶栏搜索配置；缺省时提交搜索后跳转对应首页 */
  search?: NavbarSearchConfig;
  /** 是否显示顶栏搜索框，默认常驻显示 */
  showSearch?: boolean;
  /** 页面外壳附加类名，如背景修饰 */
  className?: string;
  /** 是否显示桌面端左侧导航栏；播放页关闭以保留全宽内容区 */
  showSidebar?: boolean;
}

/**
 * 全站页面外壳：全宽顶栏 + 左侧导航（md 及以上）+ 右侧内容列。
 * 所有主页面共用，保证顶栏与内容区对齐一致。
 */
export function AppShell({
  children,
  isPremium = false,
  onReset,
  search,
  showSearch = true,
  className = '',
  showSidebar = true,
}: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className={['min-h-screen flex flex-col', className].filter(Boolean).join(' ')}>
      <Navbar
        onReset={onReset}
        isPremiumMode={isPremium}
        search={search}
        showSearch={showSearch}
        onMenuClick={() => setIsDrawerOpen(true)}
      />

      <div className="flex-1 min-w-0 flex">
        {showSidebar && <Sidebar isPremium={isPremium} />}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isPremium={isPremium}
      />
    </div>
  );
}
