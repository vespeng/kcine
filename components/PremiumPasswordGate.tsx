'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { Button } from '@/components/ui/Button';

export const PREMIUM_UNLOCK_KEY = 'kcine-premium-unlocked';

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
        <StatusCard
            icon={Lock}
            tone="warning"
            fullscreen
            title="高级内容"
            description="请输入高级内容密码以继续"
        >
            <form id="premium-password-form" onSubmit={handleUnlock} className="w-full space-y-3">
                <div className="space-y-2">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        placeholder="输入高级内容密码..."
                        className={`w-full px-4 py-2.5 rounded-2xl bg-surface border ${error ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary transition-all duration-400 ease-fluid text-text placeholder:text-text-secondary`}
                        autoFocus
                    />
                    {error && (
                        <p className="text-sm text-danger text-center animate-pulse">
                            密码错误
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={isValidating} className="w-full">
                    {isValidating ? '验证中...' : '解锁'}
                </Button>
            </form>
        </StatusCard>
    );
}
