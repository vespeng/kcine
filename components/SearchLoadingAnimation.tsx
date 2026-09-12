'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface SearchLoadingAnimationProps {
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
  isPaused?: boolean;
  onComplete?: (checkedSources: number, totalSources: number) => void;
  onCancel?: () => void;
}

export function SearchLoadingAnimation({
  currentSource,
  checkedSources = 0,
  totalSources = 16,
  isPaused = false,
  onComplete,
  onCancel,
}: SearchLoadingAnimationProps) {
  const [dots, setDots] = useState('');
  const dotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledComplete = useRef(false);

  // Calculate progress (0-100%)
  const progress = totalSources > 0 ? (checkedSources / totalSources) * 100 : 0;
  const isComplete = progress >= 100;

  // Animation pause/resume logic - Optimized interval
  useEffect(() => {
    if (isPaused || isComplete) {
      if (dotIntervalRef.current) {
        clearInterval(dotIntervalRef.current);
        dotIntervalRef.current = null;
      }
      return;
    }

    dotIntervalRef.current = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 600); // Increased from 500ms to 600ms for better performance

    return () => {
      if (dotIntervalRef.current) {
        clearInterval(dotIntervalRef.current);
        dotIntervalRef.current = null;
      }
    };
  }, [isPaused, isComplete]);

  // Call onComplete callback when animation finishes
  useEffect(() => {
    if (isComplete && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      // Small delay to allow animation to settle
      const timeout = setTimeout(() => {
        onComplete(checkedSources, totalSources);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, onComplete, checkedSources, totalSources]);

  const statusText = `${checkedSources}/${totalSources} 个源`;

  return (
    <div className="w-full space-y-3 animate-fade-in">
      {/* Loading Message with Icon */}
      <div className="flex items-center justify-center gap-3">
        {/* Spinning Icon */}
        <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="3"
            strokeDasharray="60 40"
            strokeLinecap="round"
          />
        </svg>

        <span className="text-sm font-medium text-text-secondary">
          正在搜索视频源{dots}
        </span>
      </div>

      {/* Progress Bar - Unified 0-100% */}
      <div className="w-full">
        <div
          className="h-1 bg-surface/50 overflow-hidden rounded-full"
        >
          <div
            className="h-full bg-primary transition-all duration-500 ease-out relative rounded-full"
            style={{
              width: `${progress}%`
            }}
          >
            {/* Shimmer Effect - Optimized for GPU with contain for better performance */}
            <div className="absolute inset-0 animate-shimmer shimmer-bar"></div>
          </div>
        </div>

        {/* Progress Info - Real-time count with pause indicator */}
        <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-2">
            {statusText}
            {isPaused && (
              <span className="px-2 py-0.5 rounded-full bg-surface text-2xs">
                已暂停
              </span>
            )}
            {isComplete && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-2xs">
                完成
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-medium">{Math.round(progress)}%</span>
            {!isComplete && onCancel && (
              <button
                onClick={onCancel}
                className="px-2 py-0.5 rounded-full bg-surface hover:bg-danger/20 text-2xs transition-colors cursor-pointer"
              >
                取消
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
