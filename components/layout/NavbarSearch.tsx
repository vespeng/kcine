'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { SearchHistoryDropdown } from '@/components/search/SearchHistoryDropdown';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';

export interface NavbarSearchConfig {
  /** 当前页面已生效的搜索词，用于回填输入框 */
  query?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  /** 清空输入并复位页面（与原搜索框清除行为一致） */
  onClear?: () => void;
}

/**
 * 顶栏独立搜索框：常驻药丸输入框，全站可用。
 * 页面未传入搜索配置时，提交后跳转至对应首页并携带 q 参数执行搜索。
 */
export function NavbarSearch({
  query: initialQuery = '',
  placeholder = '搜你想看...',
  onSearch,
  onClear,
  isPremium = false,
}: NavbarSearchConfig & { isPremium?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const searchByQuery = (trimmed: string) => {
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(isPremium ? `/premium?q=${encodeURIComponent(trimmed)}` : `/?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // 搜索历史下拉
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
    searchByQuery(selectedQuery);
    inputRef.current?.blur();
  }, isPremium);

  // 回填页面当前搜索词
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    searchByQuery(trimmed);
    hideDropdown();
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
    resetHighlight();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      inputRef.current?.blur();
      return;
    }
    if (!isDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateDropdown('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateDropdown('up');
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && searchHistory[highlightedIndex]) {
      e.preventDefault();
      selectHistoryItem(searchHistory[highlightedIndex].query);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center h-10 sm:h-11 w-full pl-4 pr-1 gap-1 bg-surface border border-border rounded-full"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={showDropdown}
          onBlur={(e) => {
            const related = e.relatedTarget as HTMLElement | null;
            if (related?.closest('.search-history-dropdown')) return;
            hideDropdown();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="搜索视频内容"
          aria-expanded={isDropdownOpen}
          aria-controls="search-history-dropdown"
          aria-autocomplete="list"
          data-focusable
          className="flex-1 min-w-0 pl-2 bg-transparent text-sm sm:text-md text-text placeholder:text-text-secondary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-text opacity-70 hover:opacity-100 transition-opacity touch-manipulation cursor-pointer shrink-0"
            aria-label="清除搜索"
          >
            <Icons.X size={14} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim()}
          aria-label="搜索"
          title="搜索"
          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation cursor-pointer shrink-0"
        >
          <Icons.Search size={12} className="sm:w-4 sm:h-4" />
        </button>
      </form>

      {/* 搜索历史下拉：悬挂在输入框正下方 */}
      <SearchHistoryDropdown
        isOpen={isDropdownOpen}
        searchHistory={searchHistory}
        highlightedIndex={highlightedIndex}
        triggerRef={inputRef}
        onSelectItem={selectHistoryItem}
        onRemoveItem={removeSearch}
        onClearAll={clearAll}
      />
    </div>
  );
}
