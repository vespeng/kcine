'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';

interface PlayerErrorProps {
  error: string;
  onBack: () => void;
  onRetry: () => void;
}

export function PlayerError({ error, onBack, onRetry }: PlayerErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Card className="max-w-2xl">
        <Icons.AlertTriangle size={64} className="mx-auto mb-4 text-danger" />
        <h2 className="text-2xl font-bold text-text mb-4">视频源不可用</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="primary"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <Icons.ChevronLeft size={20} />
            <span>返回</span>
          </Button>
          <Button 
            variant="secondary"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <Icons.RefreshCw size={20} />
            <span>重试</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
