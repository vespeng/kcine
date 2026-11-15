/**
 * Individual search history list item
 */

import { Icons } from '@/components/ui/Icon';
import type { SearchHistoryItem } from '@/lib/store/search-history-store';

interface SearchHistoryListItemProps {
    item: SearchHistoryItem;
    index: number;
    isHighlighted: boolean;
    onSelectItem: (query: string) => void;
    onRemoveItem: (query: string) => void;
}

export function SearchHistoryListItem({
    item,
    index,
    isHighlighted,
    onSelectItem,
    onRemoveItem,
}: SearchHistoryListItemProps) {
    return (
        <div
            data-index={index}
            role="option"
            aria-selected={isHighlighted}
            className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors duration-200 ${isHighlighted ? 'bg-primary/15 text-primary' : 'text-text hover:bg-surface-hover'}`}
            onClick={(e) => {
                e.preventDefault();
                onSelectItem(item.query);
            }}
            tabIndex={0}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icons.Search
                    size={16}
                    className={`shrink-0 ${isHighlighted ? 'text-primary' : 'text-text-secondary'}`}
                />
                <span className="text-sm truncate flex-1">
                    {item.query}
                </span>
                {item.resultCount !== undefined && (
                    <span className="text-xs text-text-secondary shrink-0">
                        {item.resultCount} 个结果
                    </span>
                )}
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveItem(item.query);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-full text-text-secondary shrink-0 transition-colors duration-200 hover:bg-surface-hover hover:text-text"
                aria-label={`删除 "${item.query}"`}
                tabIndex={0}
            >
                <Icons.X size={14} />
            </button>
        </div>
    );
}
