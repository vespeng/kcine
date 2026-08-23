'use client';

import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import type { SourceBadge } from '@/lib/types';

interface ResultsHeaderProps {
  loading: boolean;
  resultsCount: number;
  availableSources: SourceBadge[];
}

export function ResultsHeader({
  loading,
  resultsCount,
  availableSources,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-3">
          <span>搜索结果</span>
        </h3>
        <div className="flex items-center gap-3">
          {loading && (
            <Badge variant="secondary" className="text-sm">
              <span className="flex items-center gap-2">
                <Icons.Search size={14} />
                搜索中...
              </span>
            </Badge>
          )}
          {!loading && (
            <Badge variant="primary">{resultsCount} 个视频</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
