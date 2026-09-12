'use client';

import { useState, useEffect } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (includeSearchHistory: boolean, includeWatchHistory: boolean) => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [includeSearchHistory, setIncludeSearchHistory] = useState(true);
  const [includeWatchHistory, setIncludeWatchHistory] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIncludeSearchHistory(true);
      setIncludeWatchHistory(true);
    }
  }, [isOpen]);

  const handleExport = () => {
    onExport(includeSearchHistory, includeWatchHistory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-backdrop bg-black/30 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 z-modal w-modal max-w-md -translate-x-1/2 transition-all duration-300 ${isOpen
            ? 'opacity-100 -translate-y-1/2 scale-100'
            : 'opacity-0 -translate-y-2/5 scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-overlay p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text">
              导出设置
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-text-secondary text-sm">
              选择要导出的内容：
            </p>

            {/* Checkbox for Search History */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSearchHistory}
                onChange={(e) => setIncludeSearchHistory(e.target.checked)}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${includeSearchHistory
                  ? 'bg-primary border-primary'
                  : 'border-text-secondary'
                }`}>
                {includeSearchHistory && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="text-text">搜索历史</span>
            </label>

            {/* Checkbox for Watch History */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWatchHistory}
                onChange={(e) => setIncludeWatchHistory(e.target.checked)}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${includeWatchHistory
                  ? 'bg-primary border-primary'
                  : 'border-text-secondary'
                }`}>
                {includeWatchHistory && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="text-text">观看历史</span>
            </label>

            <div className="text-xs text-text-secondary bg-surface/50 rounded-2xl p-3 mt-4">
              注意：源设置将始终包含在导出中
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl bg-surface border border-border text-text font-semibold hover:bg-text/10 transition-all duration-200"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-card transition-all duration-200"
            >
              导出
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
