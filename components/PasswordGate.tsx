'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { clearSession, getSession, setSession, type AuthSession } from '@/lib/store/auth-store';
import { resolvePasswordGateState } from '@/lib/auth/password-gate-state';
import { useSubscriptionSync } from '@/lib/hooks/useSubscriptionSync';
import { hasStoredAppSetting, settingsStore } from '@/lib/store/settings-store';
import { useIPTVStore } from '@/lib/store/iptv-store';
import { StatusCard } from '@/components/ui/StatusCard';
import { Button } from '@/components/ui/Button';

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

// /api/auth is the only source of subscriptions for a fresh browser; retry
// transient failures instead of silently leaving the session with zero sources.
const CONFIG_FETCH_ATTEMPTS = 4;
const CONFIG_FETCH_RETRY_DELAY_MS = 1500;

async function fetchRuntimeConfigWithRetry(url: string): Promise<Response> {
  let lastError: unknown = new Error('Runtime config fetch failed');

  for (let attempt = 0; attempt < CONFIG_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastError = new Error(`Runtime config fetch failed with HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < CONFIG_FETCH_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, CONFIG_FETCH_RETRY_DELAY_MS * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
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

  const pathname = usePathname();
  // Premium routes (/premium) still need to pass the site-wide password gate first; the premium content password is handled by PremiumPasswordGate
  const isPremiumRoute = typeof pathname === 'string' && pathname.startsWith('/premium');

  const [isLocked, setIsLocked] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [persistSession, setPersistSession] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('none');

  // Accessing /premium without a normal login is blocked and redirected back to the normal page login
  useEffect(() => {
    if (!isClient || !isLocked || !isPremiumRoute) return;
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 3000);
    return () => clearTimeout(timer);
  }, [isClient, isLocked, isPremiumRoute]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const mirroredSession = getSession();

      try {
        const [configRes, sessionRes] = await Promise.all([
          fetchRuntimeConfigWithRetry('/api/auth'),
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
  }, [initialHasAuth, isPremiumRoute]);

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

  // Direct access to premium routes without login: show an interception notice and auto-redirect to the normal page login
  if (isPremiumRoute) {
    return (
      <StatusCard
        icon={Lock}
        tone="warning"
        fullscreen
        title="无法访问"
        description={
          <>
            <p>高级内容需在普通模式下登录后访问</p>
            <p className="text-xs">即将跳转到普通模式...</p>
          </>
        }
      >
        <a
          href="/"
          className="inline-flex w-full items-center justify-center min-h-touch rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200"
        >
          前往普通模式登录
        </a>
      </StatusCard>
    );
  }

  const showManagedFields = loginMode === 'managed';

  return (
    <StatusCard
      icon={Lock}
      fullscreen
      title="访问受限"
      description={showManagedFields ? '请输入用户名和密码以继续' : '请输入访问密码以继续'}
    >
      <form id="password-form" onSubmit={handleUnlock} className="w-full space-y-3">
        {showManagedFields && (
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
              }}
              placeholder="输入用户名..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface border border-border focus:outline-none focus:border-primary transition-all duration-400 ease-fluid text-text placeholder:text-text-secondary"
              autoComplete="username"
              autoFocus
            />
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
            placeholder="输入密码..."
            className={`w-full px-4 py-2.5 rounded-2xl bg-surface border ${error ? 'border-danger' : 'border-border'} focus:outline-none focus:border-primary transition-all duration-400 ease-fluid text-text placeholder:text-text-secondary`}
            autoFocus={!showManagedFields}
            autoComplete={showManagedFields ? 'current-password' : 'off'}
          />
          {error && (
            <p className="text-sm text-danger text-center animate-pulse">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isValidating} className="w-full">
          {isValidating ? '验证中...' : '登录'}
        </Button>
      </form>
    </StatusCard>
  );
}
