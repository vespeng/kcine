/**
 * Empty state for search history dropdown
 */

import { Icons } from '@/components/ui/Icon';

export function SearchHistoryEmptyState() {
    return (
        <div>
            <Icons.Clock size={32} className="text-text-secondary mx-auto mb-2 opacity-50" />
            <span className="text-sm text-text-secondary">暂无搜索历史</span>
        </div>
    );
}
