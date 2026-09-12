interface DataSettingsProps {
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}

export function DataSettings({ onExport, onImport, onReset }: DataSettingsProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-lg font-semibold text-text mb-3">数据管理</h2>
            <div className="space-y-3">
                <button
                    onClick={onExport}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border border-border text-text font-medium hover:bg-primary/10 transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>导出设置</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                </button>

                <button
                    onClick={onImport}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border border-border text-text font-medium hover:bg-primary/10 transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>导入设置</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                </button>

                <button
                    onClick={onReset}
                    className="w-full px-6 py-4 rounded-2xl bg-danger/8 dark:bg-danger/20 border border-danger/30 dark:border-danger/40 text-danger-dark dark:text-danger-light font-medium hover:bg-danger/15 dark:hover:bg-danger/30 transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>清除所有数据</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
