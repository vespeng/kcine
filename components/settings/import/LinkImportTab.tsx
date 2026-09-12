'use client';

import { useState } from 'react';
import { fetchSourcesFromUrl, type ImportResult } from '@/lib/utils/source-import-utils';

interface LinkImportTabProps {
    onImport: (result: ImportResult) => Promise<boolean> | boolean;
}

export function LinkImportTab({ onImport }: LinkImportTabProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<ImportResult | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFetch = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError('');
        setPreview(null);
        setSuccess(false);

        try {
            // In a real app, this might need a crossover/cors proxy if target server doesn't support CORS
            // For now, we assume the user provides a CORS-friendly URL (like GitHub raw, etc)
            const result = await fetchSourcesFromUrl(url);
            setPreview(result);
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : '获取链接失败，请检查URL是否正确或是否存在跨域限制');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!preview) return;

        try {
            const result = await onImport(preview);
            if (result) {
                setSuccess(true);
                setPreview(null);
                setUrl('');
            } else {
                setError('导入处理失败');
            }
        } catch {
            setError('导入过程发生错误');
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="p-1 max-h-sheet overflow-y-auto">
                <label className="block text-sm font-medium text-text mb-2">
                    源配置链接
                </label>
                <div className="flex gap-2 flex-wrap">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/sources.json"
                        onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                        disabled={loading || success}
                        className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-text placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all"
                    />
                    <button
                        onClick={handleFetch}
                        disabled={!url.trim() || loading || success}
                        className="px-6 py-2 rounded-2xl bg-primary text-white font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-card transition-all min-w-cta flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            '获取'
                        )}
                    </button>
                </div>

                <p className="text-xs text-text-secondary mt-2 ml-1">
                    支持 JSON 配置文件格式的单个或多个源配置链接
                </p>

                {error && (
                    <div className="mt-4 text-sm text-danger bg-danger/8 rounded-2xl px-4 py-3 border border-danger/20">
                        {error}
                    </div>
                )}

                {preview && (
                    <div className="mt-6 bg-surface border border-border rounded-2xl p-4 animate-scale-in">
                        <h4 className="font-semibold text-text mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            解析成功
                        </h4>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-bg/50 p-3 rounded-2xl">
                                <span className="text-xs text-text-secondary block">普通源</span>
                                <span className="text-xl font-bold text-text">{preview.normalSources.length}</span>
                            </div>
                            <div className="bg-bg/50 p-3 rounded-2xl">
                                <span className="text-xs text-text-secondary block">成人源</span>
                                <span className="text-xl font-bold text-text">{preview.premiumSources.length}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmImport}
                            className="w-full py-3 rounded-2xl bg-primary text-white font-semibold hover:brightness-110 shadow-overlay transition-all active:scale-98"
                        >
                            确认导入 {preview.totalCount} 个源
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mt-4 text-sm text-success-dark bg-success/8 rounded-2xl px-4 py-3 flex items-center gap-2 border border-success/20">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        导入成功！正在刷新...
                    </div>
                )}
            </div>
        </div>
    );
}
