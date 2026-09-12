'use client';

import { isAdmin, getSession } from '@/lib/store/auth-store';
import { ShieldAlert, User } from 'lucide-react';

function ViewerNotice() {
  const session = getSession();

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-bg bg-page text-text">
      <div className="w-full max-w-sm p-4 -translate-y-gate-shift">
        <div className="bg-surface backdrop-blur-glass border border-border rounded-2xl p-6 shadow-overlay flex flex-col items-center gap-4 transition-all duration-400 ease-fluid">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning shadow-card border border-border">
            <ShieldAlert size={20} />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">权限不足</h2>
            <p className="text-sm text-text-secondary">仅管理员可修改设置</p>
          </div>

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
            href={window?.location?.pathname?.includes('/premium') ? '/premium' : '/'}
            className="w-full py-2.5 px-4 bg-primary text-white font-bold rounded-2xl hover:-translate-y-0.5 hover:brightness-110 shadow-card hover:shadow-soft active:translate-y-0 active:scale-98 transition-all duration-200 text-center"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

export function AdminGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactElement }) {
  if (!isAdmin()) return fallback || <ViewerNotice />;
  return <>{children}</>;
}
