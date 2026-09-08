/**
 * useConfigSync - Syncs user settings to the server for cross-device
 * and PWA persistence. Pulls on mount, pushes on change.
 *
 * Important constraints:
 * - Video sources can come from site-level config (env / subscription URLs).
 *   Those must never be dropped because of a stale or partial server snapshot,
 *   so pulls MERGE sources instead of replacing the local list.
 * - The sync timestamp lives in its own storage key. It used to be stored
 *   inside `kcine-settings`, but every saveSettings() rewrites that object and
 *   silently dropped the field, which made pulls overwrite local data on
 *   every load.
 */

import { useEffect, useRef, useCallback } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { getProfileId } from '@/lib/store/auth-store';

const DEBOUNCE_MS = 3000;
const SYNC_TIME_KEY = 'kcine-config-synced-at';

function readSyncTime(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(SYNC_TIME_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeSyncTime(value: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SYNC_TIME_KEY, String(value));
}

/** Merge remote entries into the local list, local entries always win. */
function mergeSourceList(localList: any[], remoteList: unknown): any[] {
  if (!Array.isArray(remoteList) || remoteList.length === 0) return localList;

  const merged = [...localList];
  const seen = new Set<string>(localList.map((item) => item?.id).filter(Boolean));

  for (const item of remoteList) {
    if (!item || typeof item.id !== 'string' || seen.has(item.id)) continue;
    merged.push(item);
    seen.add(item.id);
  }

  return merged;
}

function mergeSubscriptionList(localList: any[], remoteList: unknown): any[] {
  if (!Array.isArray(remoteList) || remoteList.length === 0) return localList;

  const merged = [...localList];
  const seen = new Set<string>(localList.map((item) => item?.url).filter(Boolean));

  for (const item of remoteList) {
    if (!item || typeof item.url !== 'string' || seen.has(item.url)) continue;
    merged.push(item);
    seen.add(item.url);
  }

  return merged;
}

export function useConfigSync() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPulled = useRef(false);

  const hasSession = useCallback(() => {
    return !!getProfileId();
  }, []);

  // Pull config from server on mount (once)
  useEffect(() => {
    if (hasPulled.current) return;
    hasPulled.current = true;

    const pull = async () => {
      if (!hasSession()) return;

      try {
        const res = await fetch('/api/user/config');
        if (!res.ok) return;

        const result = await res.json();
        if (!result?.success || !result?.data) return;

        const serverData = result.data;
        const local = settingsStore.getSettings();

        const serverTime = Number(serverData.updatedAt) || 0;
        if (serverTime <= readSyncTime()) return;

        const merged = { ...local };

        // Never let a server snapshot shrink the source list: site sources
        // (env / subscriptions) would be lost and search would return nothing.
        merged.sources = mergeSourceList(local.sources, serverData.sources);
        merged.premiumSources = mergeSourceList(local.premiumSources, serverData.premiumSources);
        merged.subscriptions = mergeSubscriptionList(local.subscriptions, serverData.subscriptions);

        if (Array.isArray(serverData.blockedCategories) && serverData.blockedCategories.length > 0) {
          merged.blockedCategories = serverData.blockedCategories;
        }

        settingsStore.saveSettings(merged);
        writeSyncTime(serverTime);
      } catch {
        // Server may not be available (e.g. Cloudflare Pages)
      }
    };

    pull();
  }, [hasSession]);

  // Push config to server on settings change (debounced)
  useEffect(() => {
    const push = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        if (!hasSession()) return;

        try {
          const settings = settingsStore.getSettings();

          const body: Record<string, unknown> = {
            subscriptions: settings.subscriptions,
            blockedCategories: settings.blockedCategories,
            sortBy: settings.sortBy,
            locale: settings.locale,
          };

          // Guard against persisting an empty/partial source list: site sources
          // may still be loading from subscriptions at this point, and pushing
          // an empty list would poison the snapshot for every other device.
          if (settings.sources.length > 0) {
            body.sources = settings.sources;
          }
          if (settings.premiumSources.length > 0) {
            body.premiumSources = settings.premiumSources;
          }

          await fetch('/api/user/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          writeSyncTime(Date.now());
        } catch {
          // Silently fail — local storage is the primary source
        }
      }, DEBOUNCE_MS);
    };

    const unsubscribe = settingsStore.subscribe(push);
    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasSession]);

}
