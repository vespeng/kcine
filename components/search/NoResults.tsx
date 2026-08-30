'use client';

import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';

interface NoResultsProps {
  onReset: () => void;
}

export function NoResults({ onReset }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
      <Icons.Search
        size={64}
        className="text-[var(--text-color-secondary)] opacity-50 mb-4"
      />
      <p className="text-[var(--text-color-secondary)] text-lg">
        未找到相关内容
      </p>
      <p className="text-[var(--text-color-secondary)] text-sm mt-2 opacity-70">
        试试其他关键词或检查拼写
      </p>
      <Button variant="primary" onClick={onReset} className="mt-6">
        返回首页
      </Button>
    </div>
  );
}
