/**
 * SourceBadges - Clickable video source badges with filtering
 * Shows available video sources with counts
 * Click to filter videos by source
 * Responsive: Desktop shows expand/collapse, Mobile shows horizontal scroll
 */

'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import { SourceBadgeList } from './SourceBadgeList';
import type { SourceBadge } from '@/lib/types';

interface SourceBadgesProps {
  sources: SourceBadge[];
  selectedSources: Set<string>;
  onToggleSource: (sourceId: string) => void;
  className?: string;
}

export const SourceBadges = memo(function SourceBadges({
  sources,
  selectedSources,
  onToggleSource,
  className = ''
}: SourceBadgesProps) {
  if (sources.length === 0) {
    return null;
  }

  const handleClearAll = () => {
    selectedSources.forEach(sourceId => onToggleSource(sourceId));
  };

  return (
    <Card
      hover={false}
      className={`p-4 animate-fade-in ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Icons.Globe size={16} className="text-primary" />
          <span className="text-sm font-semibold text-text">
            视频源 ({sources.length}):
          </span>
        </div>

        <SourceBadgeList
          sources={sources}
          selectedSources={selectedSources}
          onToggleSource={onToggleSource}
        />
      </div>

      {selectedSources.size > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={handleClearAll}
            className="text-xs text-text-secondary hover:text-primary
                     flex items-center gap-1 transition-colors"
          >
            <Icons.X size={12} />
            清除筛选 ({selectedSources.size})
          </button>
        </div>
      )}
    </Card>
  );
});
