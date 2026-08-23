'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { FavoritesPageHeader } from '@/components/favorites/FavoritesPageHeader';
import { FavoritesGrid } from '@/components/favorites/FavoritesGrid';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useFavorites } from '@/lib/store/favorites-store';

interface FavoritesPageContentProps {
  isPremium?: boolean;
}

export function FavoritesPageContent({
  isPremium = false,
}: FavoritesPageContentProps) {
  const router = useRouter();
  const { favorites, clearFavorites } = useFavorites(isPremium);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const sortedFavorites = useMemo(() => {
    if (sortBy === 'title') {
      return [...favorites].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    }

    return favorites;
  }, [favorites, sortBy]);

  return (
    <AppShell
      isPremium={isPremium}
      onReset={() => router.push(isPremium ? '/premium' : '/')}
      onOpenHistory={() => setIsHistoryOpen(true)}
      className="bg-[var(--bg-color)] bg-[image:var(--bg-image)] bg-fixed"
    >
      <PageContainer className="py-8 space-y-8">
        <FavoritesPageHeader
          count={favorites.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearAll={() => setIsClearDialogOpen(true)}
        />

        <FavoritesGrid favorites={sortedFavorites} isPremium={isPremium} />
      </PageContainer>

      <FavoritesSidebar isPremium={isPremium} />
      <WatchHistorySidebar
        isPremium={isPremium}
        isOpen={isHistoryOpen}
        onOpen={() => setIsHistoryOpen(true)}
        onClose={() => setIsHistoryOpen(false)}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title="清空收藏"
        message="确定要清空所有收藏吗？此操作不可撤销。"
        confirmText="清空"
        cancelText="取消"
        onConfirm={() => {
          clearFavorites();
          setIsClearDialogOpen(false);
        }}
        onCancel={() => setIsClearDialogOpen(false)}
        dangerous
      />
    </AppShell>
  );
}

export function FavoritesPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent" />
    </div>
  );
}
