import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SiteLogo } from '@/components/SiteLogo';
import { Icons } from '@/components/ui/Icon';
import { useSiteInfo } from '@/components/SiteInfoProvider';

export function PlayerNavbar({ isPremium }: { isPremium?: boolean }) {
    const router = useRouter();
    const siteInfo = useSiteInfo();

    return (
        <nav className="sticky top-0 z-50 pt-3 pb-1.5 transform-gpu">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-surface backdrop-blur-glass backdrop-saturate-glass border border-border rounded-2xl shadow-card px-3 sm:px-5 py-1.5 sm:py-2.5">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <button
                            onClick={() => router.push(isPremium ? '/premium' : '/')}
                            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer min-w-0 text-left"
                            title={isPremium ? "返回高级主页" : "返回首页"}
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center flex-shrink-0">
                                <SiteLogo />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-text truncate">{siteInfo.name}</h1>
                                <p className="text-xs text-text-secondary hidden sm:block truncate">{siteInfo.description}</p>
                            </div>
                        </button>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => router.back()}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                aria-label="返回"
                                title="返回"
                            >
                                <Icons.ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                            </button>
                            <Link
                                href={isPremium ? '/premium/settings' : '/settings'}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                                aria-label="设置"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                                </svg>
                            </Link>
                            {/* Theme switcher is hidden in premium mode (theme is forced to dark) */}
                            {!isPremium && <ThemeSwitcher />}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
