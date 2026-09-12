'use client';

import { useRef, useState } from 'react';

interface FileImportTabProps {
    onImport: (content: string) => Promise<boolean> | boolean;
}

export function FileImportTab({ onImport }: FileImportTabProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setSuccess(false);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const result = await onImport(content);

                if (result) {
                    setSuccess(true);
                    setError('');
                } else {
                    setError('导入失败：文件格式无效');
                    setSuccess(false);
                }
            } catch (err) {
                console.error(err);
                setError('导入失败：无法读取文件或格式错误');
                setSuccess(false);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-surface border border-border rounded-2xl">
                <p className="text-text-secondary text-sm mb-4">
                    选择之前导出的设置文件（JSON 配置文件）。支持新旧版本格式。
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={success}
                    className="w-full px-6 py-8 rounded-2xl bg-surface/50 border-2 border-dashed border-border text-text hover:bg-primary/5 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-surface border border-border group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <span className="font-medium">点击选择文件</span>
                    </div>
                </button>

                {error && (
                    <div className="mt-4 text-sm text-danger bg-danger/8 rounded-2xl px-4 py-3 border border-danger/20">
                        {error}
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
