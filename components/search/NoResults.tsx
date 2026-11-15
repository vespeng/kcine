'use client';

import { Button } from '@/components/ui/Button';
import { StatusCard } from '@/components/ui/StatusCard';
import { Icons } from '@/components/ui/Icon';

interface NoResultsProps {
  onReset: () => void;
}

export function NoResults({ onReset }: NoResultsProps) {
  return (
    <div className="flex justify-center py-16">
      <StatusCard
        icon={Icons.Search}
        tone="primary"
        title="未找到相关内容"
        description="试试其他关键词或检查拼写"
        surface={false}
        width="lg"
        className="animate-fade-in"
      >
      </StatusCard>
    </div>
  );
}
