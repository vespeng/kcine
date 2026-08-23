'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';

interface FavoritesPageHeaderProps {
  count: number;
  sortBy: 'date' | 'title';
  onSortChange: (sort: 'date' | 'title') => void;
  onClearAll: () => void;
}

export function FavoritesPageHeader({
  count,
  sortBy,
  onSortChange,
  onClearAll
}: FavoritesPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Back button - icon only, matches SettingsHeader/Navbar style */}
        <button
          onClick={() => router.back()}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
          aria-label="返回"
          title="返回上一页"
          data-focusable
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-color)]">我的收藏</h1>
          <p className="text-sm text-[var(--text-color-secondary)]">
            共 {count} 个视频
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort buttons */}
        <div className="flex items-center gap-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-full)] p-1">
          <button
            onClick={() => onSortChange('date')}
            className={`px-4 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-all ${
              sortBy === 'date'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
            }`}
          >
            最新添加
          </button>
          <button
            onClick={() => onSortChange('title')}
            className={`px-4 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-all ${
              sortBy === 'title'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
            }`}
          >
            标题排序
          </button>
        </div>

        {/* Clear all button */}
        {count > 0 && (
          <button
            onClick={onClearAll}
            className="px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all text-xs font-medium flex items-center gap-1.5"
          >
            <Icons.Trash size={16} />
            清空收藏
          </button>
        )}
      </div>
    </div>
  );
}
