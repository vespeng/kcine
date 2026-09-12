/**
 * Watch History Sidebar Component
 * Main layout and state management
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useHistory } from '@/lib/store/history-store';
import { Icons } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HistoryHeader } from './HistoryHeader';
import { HistoryList } from './HistoryList';
import { HistoryFooter } from './HistoryFooter';
import { trapFocus } from '@/lib/accessibility/focus-management';

export function WatchHistorySidebar({ isPremium = false, isOpen, onOpen, onClose }: { isPremium?: boolean; isOpen?: boolean; onOpen?: () => void; onClose?: () => void }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const sidebarOpen = isControlled ? isOpen : internalIsOpen;
  const setSidebarOpen = isControlled ? (open: boolean) => open ? onOpen?.() : onClose?.() : setInternalIsOpen;
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    showIdentifier?: string;
    isClearAll?: boolean;
  }>({ isOpen: false });
  const { viewingHistory, removeFromHistory, clearHistory } = useHistory(isPremium);
  const sidebarRef = useRef<HTMLElement>(null);
  const cleanupFocusTrapRef = useRef<(() => void) | null>(null);
  // Note: Floating button removed - history now accessible via Navbar button

  // Setup focus trap when sidebar opens
  useEffect(() => {
    if (sidebarOpen && sidebarRef.current) {
      cleanupFocusTrapRef.current = trapFocus(sidebarRef.current);
    }

    return () => {
      if (cleanupFocusTrapRef.current) {
        cleanupFocusTrapRef.current();
        cleanupFocusTrapRef.current = null;
      }
    };
  }, [sidebarOpen]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen]);

  // Handle delete confirmation
  const handleDeleteItem = (showIdentifier: string) => {
    setDeleteConfirm({ isOpen: true, showIdentifier });
  };

  const handleClearAll = () => {
    setDeleteConfirm({ isOpen: true, isClearAll: true });
  };

  const confirmDelete = () => {
    if (deleteConfirm.isClearAll) {
      clearHistory();
    } else if (deleteConfirm.showIdentifier) {
      removeFromHistory(deleteConfirm.showIdentifier);
    }
    setDeleteConfirm({ isOpen: false });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false });
  };

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-nav-backdrop bg-black/40 opacity-0 animate-fade"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="complementary"
        aria-labelledby="history-sidebar-title"
        aria-hidden={!sidebarOpen}
        className={`fixed top-0 right-0 bottom-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} will-change-transform w-drawer sm:w-drawer-sm max-w-sidebar z-nav bg-surface backdrop-blur-glass backdrop-saturate-glass border-l border-border rounded-tl-2xl rounded-bl-2xl p-6 flex flex-col shadow-card transition-transform duration-250 ease-out`}
      >
        <HistoryHeader onClose={() => setSidebarOpen(false)} />

        <HistoryList
          history={viewingHistory}
          onRemove={handleDeleteItem}
          isPremium={isPremium}
        />

        <HistoryFooter
          hasHistory={viewingHistory.length > 0}
          onClearAll={handleClearAll}
        />
      </aside>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.isClearAll ? '清空历史记录' : '删除历史记录'}
        message={
          deleteConfirm.isClearAll
            ? '确定要清空所有观看历史吗？此操作无法撤销。'
            : '确定要删除这条历史记录吗？'
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </>
  );
}
