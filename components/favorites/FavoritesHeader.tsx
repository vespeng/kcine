/**
 * FavoritesHeader - Header component for favorites sidebar
 * Matches HistoryHeader design for consistency
 */

import { Icons } from '@/components/ui/Icon';

interface FavoritesHeaderProps {
    onClose: () => void;
}

export function FavoritesHeader({ onClose }: FavoritesHeaderProps) {
    return (
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
                <Icons.Heart size={24} className="text-primary" />
                <h2
                    id="favorites-sidebar-title"
                    className="text-xl font-semibold text-text"
                >
                    我的收藏
                </h2>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors cursor-pointer"
                aria-label="关闭"
            >
                <Icons.X size={24} className="text-text-secondary" />
            </button>
        </header>
    );
}
