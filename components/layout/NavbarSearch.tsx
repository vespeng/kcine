'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Icons } from '@/components/ui/Icon';
import { SearchHistoryDropdown } from '@/components/search/SearchHistoryDropdown';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';

export interface NavbarSearchConfig {
  /** 当前页面已生效的搜索词，用于回填输入框 */
  query?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  /** 清空输入并复位页面（与原搜索框清除行为一致） */
  onClear?: () => void;
}

/**
 * 导航栏内联搜索：默认圆形图标按钮，点击后动效展开为药丸输入框，
 * 其余图标按钮随宽度变化自然平移；提交或点击外部后收起复原。
 */
export function NavbarSearch({
  query: initialQuery = '',
  placeholder = '搜你想看...',
  onSearch,
  onClear,
  isPremium = false,
}: NavbarSearchConfig & { isPremium?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    onSearch(selectedQuery);
    setExpanded(false);
    inputRef.current?.blur();
  }, isPremium);

  // 回填页面当前搜索词
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // 展开时聚焦输入框
  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
    }
  }, [expanded]);

  // 点击组件外部时收起
  useEffect(() => {
    if (!expanded) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        hideDropdown();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [expanded, hideDropdown]);

  const handleExpand = () => {
    setExpanded(true);
    showDropdown();
  };

  const handleCollapse = () => {
    setExpanded(false);
    hideDropdown();
    resetHighlight();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    onSearch(trimmed);
    hideDropdown();
    handleCollapse();
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
      handleCollapse();
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
    <div ref={containerRef} className="relative flex items-center">
      {/* 药丸输入框：max-width 过渡实现展开/收起动效；内容固定宽度仅做裁剪揭示，避免逐帧重排 */}
      <div
        className={`flex items-center overflow-hidden shrink-0 transition-all duration-300 ease-fluid ${
          expanded ? 'max-w-42 sm:max-w-72 opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center h-8 sm:h-10 w-42 sm:w-72 shrink-0 pl-4 pr-1 gap-1 bg-surface border border-border rounded-full"
        >
          <Icons.Search size={14} className="text-text-secondary flex-shrink-0 sm:w-4 sm:h-4" />
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
            className="flex-1 min-w-0 pl-2 bg-transparent text-sm sm:text-md text-text placeholder:text-text-secondary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-text opacity-70 hover:opacity-100 transition-opacity touch-manipulation cursor-pointer flex-shrink-0"
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
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-primary text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation cursor-pointer flex-shrink-0"
          >
            <Icons.Search size={12} className="sm:w-4 sm:h-4" />
          </button>
        </form>
      </div>

      {/* 收起态：圆形搜索图标按钮 */}
      <button
        onClick={handleExpand}
        aria-label="搜索"
        title="搜索"
        data-focusable
        className={
          expanded
            ? 'hidden'
            : 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer'
        }
      >
        <Icons.Search size={16} className="sm:w-5 sm:h-5" />
      </button>

      {/* 搜索历史下拉：悬挂在药丸右下方 */}
      <SearchHistoryDropdown
        isOpen={expanded && isDropdownOpen}
        searchHistory={searchHistory}
        highlightedIndex={highlightedIndex}
        triggerRef={inputRef}
        onSelectItem={selectHistoryItem}
        onRemoveItem={removeSearch}
        onClearAll={clearAll}
        positionClassName="left-auto right-0 w-64 sm:w-72"
      />
    </div>
  );
}
