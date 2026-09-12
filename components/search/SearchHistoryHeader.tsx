/**
 * Header for search history dropdown
 */

import { Icons } from '@/components/ui/Icon';

interface SearchHistoryHeaderProps {
    onClearAll: () => void;
}

export function SearchHistoryHeader({ onClearAll }: SearchHistoryHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 py-2 mb-2">
            <div className="flex items-center gap-2">
                <Icons.Clock size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-text-secondary">
                    搜索历史
                </span>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                }}
                className="text-xs text-primary hover:underline transition-all cursor-pointer"
                aria-label="清除所有历史"
            >
                清除全部
            </button>
        </div>
    );
}
