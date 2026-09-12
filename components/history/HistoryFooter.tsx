import { Icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

interface HistoryFooterProps {
    hasHistory: boolean;
    onClearAll: () => void;
}

export function HistoryFooter({ hasHistory, onClearAll }: HistoryFooterProps) {
    if (!hasHistory) return null;

    return (
        <footer className="mt-4 pt-4 border-t border-border">
            <Button
                variant="secondary"
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2"
            >
                <Icons.Trash size={18} />
                清空历史
            </Button>
        </footer>
    );
}
