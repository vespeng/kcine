'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const PREMIUM_UNLOCK_KEY = 'kvideo-premium-unlocked';

export function PremiumPasswordGate({ children }: { children: React.ReactNode }) {
    const [isLocked, setIsLocked] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            // Check if already unlocked in this session
            const unlocked = sessionStorage.getItem(PREMIUM_UNLOCK_KEY) === 'true';

            try {
                const [configRes, sessionRes] = await Promise.all([
                    fetch('/api/auth'),
                    fetch('/api/auth/session'),
                ]);
                if (!configRes.ok) throw new Error('Failed to fetch auth config');
                const data = await configRes.json();
                const sessionData = sessionRes.ok ? await sessionRes.json() : null;
                const isAdminSession = !!sessionData?.session &&
                    (sessionData.session.role === 'admin' || sessionData.session.role === 'super_admin');

                if (mounted) {
                    // If no premium password configured, allow access
                    setIsLocked(data.hasPremiumAuth && !unlocked && !isAdminSession);
                    setIsClient(true);
                }
            } catch {
                if (mounted) {
                    setIsLocked(false);
                    setIsClient(true);
                }
            }
        };

        init();
        return () => { mounted = false; };
    }, []);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, type: 'premium' }),
            });
            const data = await res.json();

            if (data.valid) {
                sessionStorage.setItem(PREMIUM_UNLOCK_KEY, 'true');
                setIsLocked(false);
                setIsValidating(false);
                return;
            }
        } catch {
            // API error
        }

        setError(true);
        setIsValidating(false);
        const form = document.getElementById('premium-password-form');
        form?.classList.add('animate-shake');
        setTimeout(() => form?.classList.remove('animate-shake'), 500);
    };

    if (!isClient) return null;

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-color)] bg-[image:var(--bg-image)]">
            <div className="w-full max-w-sm p-4 -translate-y-[7vh]">
                <form
                    id="premium-password-form"
                    onSubmit={handleUnlock}
                    className="bg-[var(--glass-bg)] backdrop-blur-[25px] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-md)] flex flex-col items-center gap-4 transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1)"
                >
                    <div className="w-10 h-10 rounded-[var(--radius-full)] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[var(--shadow-sm)] border border-[var(--glass-border)]">
                        <Lock size={20} />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold">高级内容</h2>
                        <p className="text-sm text-[var(--text-color-secondary)]">请输入高级内容密码以继续</p>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="输入高级内容密码..."
                                className={`w-full px-4 py-2.5 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border ${error ? 'border-red-500' : 'border-[var(--glass-border)]'
                                    } focus:outline-none focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.3)] transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) text-[var(--text-color)] placeholder-[var(--text-color-secondary)]`}
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-red-500 text-center animate-pulse">
                                    密码错误
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isValidating}
                            className="w-full py-2.5 px-4 bg-amber-500 text-black font-bold rounded-[var(--radius-2xl)] hover:translate-y-[-2px] hover:brightness-110 shadow-[var(--shadow-sm)] hover:shadow-[0_4px_8px_var(--shadow-color)] active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isValidating ? '验证中...' : '解锁'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}
