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
            className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-4 cursor-pointer transition-colors duration-200 ${isHighlighted ? 'bg-primary/15 ring-1 ring-inset ring-primary/30' : 'hover:bg-primary/10'}`}
            onClick={(e) => {
                e.preventDefault();
                onSelectItem(item.query);
            }}
            tabIndex={0}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icons.Search
                    size={16}
                    className="flex-shrink-0 text-text-secondary"
                />
                <span className="text-text truncate flex-1">
                    {item.query}
                </span>
                {item.resultCount !== undefined && (
                    <span className="text-xs text-text-secondary flex-shrink-0">
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
                className="flex items-center justify-center w-6 h-6 rounded-full text-text-secondary shrink-0 transition-all duration-200 z-10 hover:bg-text-secondary/20 hover:text-text hover:scale-110 active:scale-95"
                aria-label={`删除 "${item.query}"`}
                tabIndex={0}
            >
                <Icons.X size={14} />
            </button>
        </div>
    );
}
