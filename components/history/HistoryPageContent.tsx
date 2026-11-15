'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icons } from '@/components/ui/Icon';
import { useHistory } from '@/lib/store/history-store';
import { HistoryList } from './HistoryList';

interface HistoryPageContentProps {
  isPremium?: boolean;
}

/**
 * 观看历史独立页面：页头（返回 / 计数 / 清空）+ 历史列表（含观看进度与日期）
 */
export function HistoryPageContent({ isPremium = false }: HistoryPageContentProps) {
  const router = useRouter();
  const { viewingHistory, removeFromHistory, clearHistory } = useHistory(isPremium);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    showIdentifier?: string;
    isClearAll?: boolean;
  }>({ isOpen: false });

  const confirmDelete = () => {
    if (deleteConfirm.isClearAll) {
      clearHistory();
    } else if (deleteConfirm.showIdentifier) {
      removeFromHistory(deleteConfirm.showIdentifier);
    }
    setDeleteConfirm({ isOpen: false });
  };

  return (
    <AppShell
      isPremium={isPremium}
      onReset={() => router.push(isPremium ? '/premium' : '/')}
      className="bg-bg bg-page bg-fixed"
    >
      <PageContainer className="py-8 space-y-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 返回按钮，样式与收藏页页头一致 */}
            <button
              onClick={() => router.back()}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
              aria-label="返回"
              title="返回上一页"
              data-focusable
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-text">观看历史</h1>
              <p className="text-sm text-text-secondary">
                共 {viewingHistory.length} 条记录
              </p>
            </div>
          </div>

          {viewingHistory.length > 0 && (
            <button
              onClick={() => setDeleteConfirm({ isOpen: true, isClearAll: true })}
              className="px-4 py-2 rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all text-xs font-medium flex items-center gap-1"
            >
              <Icons.Trash size={16} />
              清空历史
            </button>
          )}
        </div>

        <HistoryList
          history={viewingHistory}
          onRemove={(showIdentifier) => setDeleteConfirm({ isOpen: true, showIdentifier })}
          isPremium={isPremium}
        />
      </PageContainer>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.isClearAll ? '清空历史记录' : '删除历史记录'}
        message={
          deleteConfirm.isClearAll
            ? '确定要清空所有观看历史吗？此操作无法撤销。'
            : '确定要删除这条历史记录吗？'
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </AppShell>
  );
}

export function HistoryPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
    </div>
  );
}
