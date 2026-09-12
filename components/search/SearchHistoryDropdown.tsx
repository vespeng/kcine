/**
 * SearchHistoryDropdown Component
 * Liquid Glass design system compliant dropdown for search history
 * Features: frosted glass effect, rounded-2xl corners, smooth animations
 */

'use client';

import { useEffect, useRef } from 'react';
import type { SearchHistoryItem } from '@/lib/store/search-history-store';
import { SearchHistoryHeader } from './SearchHistoryHeader';
import { SearchHistoryListItem } from './SearchHistoryListItem';

interface SearchHistoryDropdownProps {
  isOpen: boolean;
  searchHistory: SearchHistoryItem[];
  highlightedIndex: number;
  triggerRef: React.RefObject<HTMLInputElement | null>;
  onSelectItem: (query: string) => void;
  onRemoveItem: (query: string) => void;
  onClearAll: () => void;
}

export function SearchHistoryDropdown({
  isOpen,
  searchHistory,
  highlightedIndex,
  triggerRef,
  onSelectItem,
  onRemoveItem,
  onClearAll,
}: SearchHistoryDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex === -1 || !dropdownRef.current) return;

    const highlightedElement = dropdownRef.current.querySelector(
      `[data-index="${highlightedIndex}"]`
    );

    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  if (!isOpen || searchHistory.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="search-history-dropdown absolute top-full left-0 right-0 mt-2 z-modal max-h-panel overflow-y-auto overscroll-contain bg-bg/95 backdrop-blur-glass backdrop-saturate-glass rounded-2xl shadow-card border border-border p-4 origin-top select-none will-change-transform animate-dropdown-in"
      role="listbox"
      aria-label="搜索历史"
      onMouseDown={(e) => {
        // Prevent blur when clicking inside dropdown
        e.preventDefault();
      }}
    >
      {/* Header with clear all button */}
      <SearchHistoryHeader onClearAll={onClearAll} />

      {/* Divider */}
      <div className="h-px w-full bg-border my-2" />

      {/* History items */}
      <div className="flex flex-col gap-1">
        {searchHistory.map((item, index) => (
          <SearchHistoryListItem
            key={`${item.query}-${item.timestamp}`}
            item={item}
            index={index}
            isHighlighted={index === highlightedIndex}
            onSelectItem={onSelectItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
    </div>
  );
}
