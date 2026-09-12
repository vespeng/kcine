/**
 * TypeBadges - Main component for type badge filtering
 * Auto-collects unique type_name values and shows counts
 * Badges disappear when all videos of that type are removed
 * Responsive: Desktop shows expand/collapse, Mobile shows horizontal scroll
 */

'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import { TypeBadgeList } from './TypeBadgeList';
import type { TypeBadge } from '@/lib/types';

interface TypeBadgesProps {
  badges: TypeBadge[];
  selectedTypes: Set<string>;
  onToggleType: (type: string) => void;
  className?: string;
}

export const TypeBadges = memo(function TypeBadges({
  badges,
  selectedTypes,
  onToggleType,
  className = ''
}: TypeBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  const handleClearAll = () => {
    selectedTypes.forEach(type => onToggleType(type));
  };

  return (
    <Card
      hover={false}
      className={`p-4 animate-fade-in ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Icons.Tag size={16} className="text-primary" />
          <span className="text-sm font-semibold text-text">
            分类标签 ({badges.length}):
          </span>
        </div>

        <TypeBadgeList
          badges={badges}
          selectedTypes={selectedTypes}
          onToggleType={onToggleType}
        />
      </div>

      {selectedTypes.size > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={handleClearAll}
            className="text-xs text-text-secondary hover:text-primary
                     flex items-center gap-1 transition-colors"
          >
            <Icons.X size={12} />
            清除筛选 ({selectedTypes.size})
          </button>
        </div>
      )}
    </Card>
  );
});
