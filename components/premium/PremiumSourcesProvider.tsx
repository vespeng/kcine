'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { settingsStore } from '@/lib/store/settings-store';

export interface PremiumSourceGroup {
  sourceId: string;
  sourceName: string;
  categories: { id: string; name: string }[];
}

interface PremiumSourcesContextValue {
  sources: PremiumSourceGroup[];
  loading: boolean;
  activeSourceId: string;
  setActiveSourceId: (id: string) => void;
}

const PremiumSourcesContext = createContext<PremiumSourcesContextValue | null>(null);

/**
 * 高级模式订阅源上下文：左侧导航选源、右侧内容按源筛选共用同一份状态
 */
export function PremiumSourcesProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<PremiumSourceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSourceId, setActiveSourceId] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSources = async () => {
      try {
        const enabledSources = settingsStore.getSettings().premiumSources.filter((s) => s.enabled);
        if (enabledSources.length === 0) return;

        const res = await fetch('/api/premium/types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources: enabledSources }),
        });
        const data = await res.json();
        if (!cancelled && Array.isArray(data.sources)) {
          setSources(data.sources);
        }
      } catch (error) {
        console.error('Failed to fetch premium sources:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSources();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PremiumSourcesContext.Provider
      value={{ sources, loading, activeSourceId, setActiveSourceId }}
    >
      {children}
    </PremiumSourcesContext.Provider>
  );
}

/** 未包裹 Provider 时返回 null，调用方回退到普通导航 */
export function usePremiumSources() {
  return useContext(PremiumSourcesContext);
}
