'use client';

import { useState, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { clearSession, getSession, setSession, type AuthSession } from '@/lib/store/auth-store';
import { resolvePasswordGateState } from '@/lib/auth/password-gate-state';
import { useSubscriptionSync } from '@/lib/hooks/useSubscriptionSync';
import { hasStoredAppSetting, settingsStore } from '@/lib/store/settings-store';
import { useIPTVStore } from '@/lib/store/iptv-store';

type LoginMode = 'none' | 'legacy_password' | 'managed';

function syncIPTVSources(rawValue: string) {
  const iptvStore = useIPTVStore.getState();

  let entries: { name: string; url: string }[] = [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      entries = parsed.filter((item: unknown): item is { name: string; url: string } => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as { name?: unknown; url?: unknown };
        return typeof candidate.url === 'string';
      });
    }
  } catch {
    if (rawValue.includes('http')) {
      const urls = rawValue.split(',').map((value) => value.trim()).filter((value) => value.startsWith('http'));
      entries = urls.map((url, index) => ({
        name: urls.length > 1 ? `直播源 ${index + 1}` : '直播源',
        url,
      }));
    }
  }

  iptvStore.syncBuiltinSources(entries);
}

function syncMergeSources(rawValue: string) {
  const enabled = rawValue === 'true' || rawValue === '1';
  if (!enabled) return;

  const settings = settingsStore.getSettings();
  if (settings.searchDisplayMode !== 'grouped') {
    settingsStore.saveSettings({
      ...settings,
      searchDisplayMode: 'grouped',
    });
  }
}

function syncDanmakuApiUrl(rawValue: string) {
  if (!rawValue || hasStoredAppSetting('danmakuApiUrl')) return;

  const settings = settingsStore.getSettings();
  if (settings.danmakuApiUrl !== rawValue) {
    settingsStore.saveSettings({
      ...settings,
      danmakuApiUrl: rawValue,
    });
  }
}

function applyRuntimeConfig(data: {
  subscriptionSources?: string;
  iptvSources?: string;
  mergeSources?: string;
  danmakuApiUrl?: string;
}) {
  if (data.subscriptionSources) {
    settingsStore.syncEnvSubscriptions(data.subscriptionSources);
  }

  if (data.iptvSources) {
    syncIPTVSources(data.iptvSources);
  }

  if (data.mergeSources) {
    syncMergeSources(data.mergeSources);
  }

  if (data.danmakuApiUrl) {
    syncDanmakuApiUrl(data.danmakuApiUrl);
  }
}

function toAuthSession(session: {
  accountId: string;
  profileId: string;
  username?: string;
  name: string;
  role: AuthSession['role'];
  customPermissions?: AuthSession['customPermissions'];
  mode?: AuthSession['mode'];
}): AuthSession {
  return {
    accountId: session.accountId,
    profileId: session.profileId,
    username: session.username,
    name: session.name,
    role: session.role,
    customPermissions: session.customPermissions,
    mode: session.mode,
  };
}

export function PasswordGate({
  children,
  hasAuth: initialHasAuth,
}: {
  children: React.ReactNode;
  hasAuth: boolean;
}) {
  useSubscriptionSync();

  const [isLocked, setIsLocked] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [persistSession, setPersistSession] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('none');

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const mirroredSession = getSession();

      try {
        const [configRes, sessionRes] = await Promise.all([
          fetch('/api/auth'),
          fetch('/api/auth/session'),
        ]);

        if (!configRes.ok) {
          throw new Error('Failed to fetch auth config');
        }

        const config = await configRes.json();
        const sessionStatus = sessionRes.ok ? await sessionRes.json() : { authenticated: false, session: null };

        if (!mounted) return;

        setPersistSession(config.persistSession);
        setLoginMode(config.loginMode || 'none');
        applyRuntimeConfig(config);

        const serverSession = sessionStatus.authenticated && sessionStatus.session
          ? toAuthSession(sessionStatus.session)
          : null;
        const gateState = resolvePasswordGateState({
          hasAuth: !!config.hasAuth,
          serverSession,
          mirroredSession,
          persistSession: config.persistSession,
        });

        if (gateState.action === 'unlock-session') {
          setSession(gateState.session, gateState.persistSession);
          setIsLocked(false);
          setIsClient(true);
          return;
        }

        if (gateState.action === 'unlock-public') {
          setIsLocked(false);
          setIsClient(true);
          return;
        }

        if (gateState.clearMirroredSession) {
          clearSession();
        }

        setIsLocked(true);
        setIsClient(true);
      } catch {
        if (!mounted) return;
        setIsLocked(initialHasAuth && !mirroredSession);
        setIsClient(true);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [initialHasAuth]);

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginMode === 'managed' ? username : undefined,
          password,
        }),
      });
      const data = await response.json();

      if (response.status === 503) {
        setError('认证存储暂时不可用，请检查 Upstash Redis 配置');
        setIsValidating(false);
        return;
      }

      if (data.valid && data.session) {
        setSession(toAuthSession(data.session), data.persistSession ?? persistSession);
        setIsLocked(false);
        setIsClient(true);
        setIsValidating(false);
        return;
      }
    } catch {
      // Ignore network errors and show the same message as invalid credentials.
    }

    setError(loginMode === 'managed' ? '用户名或密码错误' : '密码错误');
    setIsValidating(false);
    const form = document.getElementById('password-form');
    form?.classList.add('animate-shake');
    setTimeout(() => form?.classList.remove('animate-shake'), 500);
  };

  if (!isClient) return null;

  if (!isLocked) {
    return <>{children}</>;
  }

  const showManagedFields = loginMode === 'managed';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-color)] bg-[image:var(--bg-image)] text-[var(--text-color)]">
      <div className="w-full max-w-sm p-4 -translate-y-[7vh]">
        <form
          id="password-form"
          onSubmit={handleUnlock}
          className="bg-[var(--glass-bg)] backdrop-blur-[25px] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-md)] flex flex-col items-center gap-4 transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1)"
        >
          <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] shadow-[var(--shadow-sm)] border border-[var(--glass-border)]">
            <Lock size={20} />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">访问受限</h2>
            <p className="text-sm text-[var(--text-color-secondary)]">
              {showManagedFields ? '请输入用户名和密码以继续' : '请输入访问密码以继续'}
            </p>
          </div>

          <div className="w-full space-y-3">
            {showManagedFields && (
              <div className="space-y-2">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-color-secondary)]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError('');
                    }}
                    placeholder="输入用户名..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) text-[var(--text-color)] placeholder-[var(--text-color-secondary)]"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                placeholder={showManagedFields ? '输入密码...' : '输入密码...'}
                className={`w-full px-4 py-2.5 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border ${error ? 'border-red-500' : 'border-[var(--glass-border)]'} focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) text-[var(--text-color)] placeholder-[var(--text-color-secondary)]`}
                autoFocus={!showManagedFields}
                autoComplete={showManagedFields ? 'current-password' : 'off'}
              />
              {error && (
                <p className="text-sm text-red-500 text-center animate-pulse">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full py-2.5 px-4 bg-[var(--accent-color)] text-white font-bold rounded-[var(--radius-2xl)] hover:translate-y-[-2px] hover:brightness-110 shadow-[var(--shadow-sm)] hover:shadow-[0_4px_8px_var(--shadow-color)] active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? '验证中...' : '登录'}
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
