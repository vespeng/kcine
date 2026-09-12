import { useRouter } from 'next/navigation';

export function SettingsHeader() {
    const router = useRouter();

    return (
        <div className="bg-surface border border-border rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                    aria-label="返回"
                    title="返回上一页"
                    data-focusable
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-text">设置</h1>
                    <p className="text-sm text-text-secondary">管理应用程序配置</p>
                </div>
            </div>
        </div>
    );
}
