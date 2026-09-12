'use client';

import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

export function VideoPlayerEmpty() {
    return (
        <Card hover={false} padded={false} className="p-6">
            <div className="aspect-video bg-surface backdrop-blur-glass rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="text-center text-text-secondary">
                    <Icons.TV size={64} className="text-text-secondary mx-auto mb-4" />
                    <p>暂无播放源</p>
                </div>
            </div>
        </Card>
    );
}
