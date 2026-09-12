import { Icons } from '@/components/ui/Icon';

interface HistoryHeaderProps {
    onClose: () => void;
}

export function HistoryHeader({ onClose }: HistoryHeaderProps) {
    return (
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
                <Icons.History size={24} className="text-primary" />
                <h2
                    id="history-sidebar-title"
                    className="text-xl font-semibold text-text"
                >
                    观看历史
                </h2>
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors cursor-pointer"
                aria-label="关闭"
            >
                <Icons.X size={24} className="text-text-secondary" />
            </button>
        </header>
    );
}
