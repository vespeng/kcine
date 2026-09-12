'use client';

import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';

interface VideoPlayerErrorProps {
    error: string;
    onBack: () => void;
    onRetry: () => void;
    retryCount: number;
    maxRetries: number;
}

export function VideoPlayerError({
    error,
    onBack,
    onRetry,
    retryCount,
    maxRetries,
}: VideoPlayerErrorProps) {
    return (
        <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
            {/* Glass Card Container */}
            <div
                className="bg-panel/85 backdrop-blur-glass backdrop-saturate-glass rounded-2xl border border-white/10 shadow-card-hover p-8 max-w-sm text-center animate-scale-in"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                {/* Glowing Error Icon */}
                <div className="relative">
                    <Icons.AlertTriangle
                        size={56}
                        className="w-16 h-16 mx-auto mb-4 text-danger drop-shadow-danger-glow"
                    />
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-xl bg-danger/30 rounded-full -z-10" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">播放失败</h3>
                <p className="text-white/70 text-sm mb-6 leading-normal">{error}</p>

                {/* Browser compatibility hint */}
                {(error.includes('不支持') || error.includes('格式') || error.includes('编码')) && (
                    <p className="text-xs text-white/50 mt-1">
                        建议使用 Chrome、Edge 或 Safari 浏览器以获得最佳兼容性
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 px-4 py-2 min-w-10 h-10 bg-white/10 backdrop-blur-input border border-white/15 rounded-2xl text-white transition-all duration-400 ease-fluid select-none touch-manipulation hover:bg-white/20 hover:-translate-y-0.5 hover:scale-105 hover:shadow-soft hover:border-white/25 active:translate-y-0 active:scale-95 active:bg-white/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50"
                    >
                        <Icons.ChevronLeft size={18} />
                        <span>返回</span>
                    </button>
                    {retryCount < maxRetries && (
                        <button
                            onClick={onRetry}
                            className="flex items-center justify-center gap-2 px-4 py-2 min-w-10 h-10 bg-white/10 backdrop-blur-input border border-white/15 rounded-2xl text-white transition-all duration-400 ease-fluid select-none touch-manipulation hover:bg-white/20 hover:-translate-y-0.5 hover:scale-105 hover:shadow-soft hover:border-white/25 active:translate-y-0 active:scale-95 active:bg-white/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 bg-primary/80 hover:bg-primary"
                        >
                            <Icons.RefreshCw size={18} />
                            <span>重试 ({retryCount}/{maxRetries})</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
