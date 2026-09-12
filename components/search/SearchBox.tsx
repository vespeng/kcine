import { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/ui/Icon';
import { SearchHistoryDropdown } from '@/components/search/SearchHistoryDropdown';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { useSearchBoxHandlers } from './hooks/useSearchBoxHandlers';

interface SearchBoxProps {
    onSearch: (query: string) => void;
    onClear?: () => void;
    initialQuery?: string;
    placeholder?: string;
    isPremium?: boolean;
}

export function SearchBox({ onSearch, onClear, initialQuery = '', placeholder = '搜索电影、电视剧、综艺...', isPremium = false }: SearchBoxProps) {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    // Search history hook
    const {
        searchHistory,
        isDropdownOpen,
        highlightedIndex,
        showDropdown,
        hideDropdown,
        addSearch,
        removeSearch,
        clearAll,
        selectHistoryItem,
        navigateDropdown,
        resetHighlight,
    } = useSearchHistory((selectedQuery) => {
        setQuery(selectedQuery);
        onSearch(selectedQuery);
        // Blur the input after selecting from history
        inputRef.current?.blur();
    }, isPremium);

    // Update query when initialQuery changes
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const {
        handleSubmit,
        handleClear,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    } = useSearchBoxHandlers({
        query,
        setQuery,
        onSearch,
        onClear,
        inputRef,
        isDropdownOpen,
        highlightedIndex,
        searchHistory,
        addSearch,
        hideDropdown,
        showDropdown,
        resetHighlight,
        selectHistoryItem,
        navigateDropdown,
    });

    return (
        <form onSubmit={handleSubmit} className="relative group isolate">
            <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="text-base sm:text-lg pr-28 sm:pr-32 truncate"
                aria-label="搜索视频内容"
                aria-expanded={isDropdownOpen}
                aria-controls="search-history-dropdown"
                aria-autocomplete="list"
                data-focusable
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 text-text opacity-70 hover:opacity-100 transition-opacity touch-manipulation cursor-pointer"
                        aria-label="清除搜索"
                    >
                        <Icons.X size={18} />
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!query.trim()}
                    aria-label="搜索"
                    title="搜索"
                    className="h-9 sm:h-10 pl-3 pr-4 flex items-center justify-center gap-1.5 rounded-full bg-primary text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation cursor-pointer flex-shrink-0"
                >
                    <Icons.Search size={16} className="sm:w-icon sm:h-icon" />
                    <span className="text-sm sm:text-base font-medium leading-none">搜索</span>
                </button>
            </div>

            {/* Search History Dropdown */}
            <SearchHistoryDropdown
                isOpen={isDropdownOpen}
                searchHistory={searchHistory}
                highlightedIndex={highlightedIndex}
                triggerRef={inputRef}
                onSelectItem={selectHistoryItem}
                onRemoveItem={removeSearch}
                onClearAll={clearAll}
            />
        </form>
    );
}
