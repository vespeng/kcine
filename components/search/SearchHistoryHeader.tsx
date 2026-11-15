/**
 * Header for search history dropdown
 */

import { Icons } from '@/components/ui/Icon';

interface SearchHistoryHeaderProps {
    onClearAll: () => void;
}

export function SearchHistoryHeader({ onClearAll }: SearchHistoryHeaderProps) {
    return (
        <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
                <Icons.Clock size={14} className="text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary">
                    搜索历史
                </span>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                }}
                className="text-xs text-text-secondary transition-colors hover:text-primary cursor-pointer"
                aria-label="清除所有历史"
            >
                清除全部
            </button>
        </div>
    );
}
