'use client';

import { Button } from '@/components/ui/Button';
import { StatusCard } from '@/components/ui/StatusCard';
import { Icons } from '@/components/ui/Icon';

interface PlayerErrorProps {
  error: string;
  onRetry: () => void;
}

export function PlayerError({ error, onRetry }: PlayerErrorProps) {
  return (
    <div className="flex justify-center py-16">
      <StatusCard
        icon={Icons.AlertTriangle}
        tone="danger"
        title="视频源不可用"
        description={error}
        surface={false}
        width="2xl"
      >
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2 min-w-cta"
        >
          <Icons.RefreshCw size={16} />
          <span>重试</span>
        </Button>
      </StatusCard>
    </div>
  );
}
