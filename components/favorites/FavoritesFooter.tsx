/**
 * FavoritesFooter - Footer component for favorites sidebar
 * Matches HistoryFooter design for consistency
 */

import { Icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

interface FavoritesFooterProps {
    hasFavorites: boolean;
    onClearAll: () => void;
}

export function FavoritesFooter({ hasFavorites, onClearAll }: FavoritesFooterProps) {
    if (!hasFavorites) return null;

    return (
        <footer className="mt-4 pt-4 border-t border-border">
            <Button
                variant="secondary"
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2"
            >
                <Icons.Trash size={18} />
                清空收藏
            </Button>
        </footer>
    );
}
