'use client';

import { isAdmin, getSession } from '@/lib/store/auth-store';
import { ShieldAlert, User } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';

function ViewerNotice() {
  const session = getSession();
  const isPremiumPath =
    typeof window !== 'undefined' && window.location.pathname.includes('/premium');

  return (
    <StatusCard
      icon={ShieldAlert}
      tone="warning"
      fullscreen
      title="权限不足"
      description="仅管理员可修改设置"
    >
      {session && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-sm">
          <User size={16} className="text-text-secondary" />
          <span>当前用户：{session.name}</span>
          <span className="px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-text-secondary">
            观众
          </span>
        </div>
      )}

      <a
        href={isPremiumPath ? '/premium' : '/'}
        className="inline-flex w-full items-center justify-center min-h-touch rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200"
      >
        返回首页
      </a>
    </StatusCard>
  );
}

export function AdminGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactElement }) {
  if (!isAdmin()) return fallback || <ViewerNotice />;
  return <>{children}</>;
}
