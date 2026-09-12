import { type SortOption } from '@/lib/store/settings-store';
import { sortOptions } from '@/lib/store/settings-helpers';

interface SortSettingsProps {
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
}

export function SortSettings({ sortBy, onSortChange }: SortSettingsProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl shadow-card p-5 mb-4">
            <h2 className="text-lg font-semibold text-text mb-3">搜索结果排序</h2>
            <p className="text-sm text-text-secondary mb-4">
                选择搜索结果的默认排序方式
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(sortOptions) as SortOption[]).map((option) => (
                    <button
                        key={option}
                        onClick={() => onSortChange(option)}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${sortBy === option
                            ? 'bg-primary border-primary text-white'
                            : 'bg-surface border-border text-text hover:bg-primary/10'
                            }`}
                    >
                        {sortOptions[option]}
                    </button>
                ))}
            </div>
        </div>
    );
}
