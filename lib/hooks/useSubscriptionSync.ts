import { useEffect } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { fetchSourcesFromUrl, mergeSources } from '@/lib/utils/source-import-utils';
import type { SourceSubscription } from '@/lib/types';

// Minimum time between syncs for the same subscription (5 minutes)
const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
// Delay before initial sync to ensure settings are fully loaded
const INITIAL_SYNC_DELAY_MS = 1000;

// Bump when the sync strategy changes. Existing clients are inside the
// cooldown window with a stale/partial source list, so they must be forced to
// re-sync once after the update — otherwise they stay broken until the
// cooldown expires and never recover on their own.
const SYNC_STRATEGY_VERSION = 2;
const SYNC_VERSION_KEY = 'kcine-subscription-sync-version';

// Module level so the PasswordGate instance and the page instance cannot run
// two overlapping syncs.
let syncInFlight: Promise<void> | null = null;

function readSyncVersion(): number {
  if (typeof window === 'undefined') return SYNC_STRATEGY_VERSION;
  const raw = window.localStorage.getItem(SYNC_VERSION_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeSyncVersion(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SYNC_VERSION_KEY, String(SYNC_STRATEGY_VERSION));
}

function hasActiveSubscriptions(): boolean {
  return settingsStore
    .getSettings()
    .subscriptions.some((sub: SourceSubscription) => sub.autoRefresh !== false);
}

async function runSync(): Promise<void> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const settings = settingsStore.getSettings();
    const activeSubscriptions = settings.subscriptions.filter(
      (s: SourceSubscription) => s.autoRefresh !== false
    );

    if (activeSubscriptions.length === 0) return;

    // Re-sync when the strategy changed, and also whenever there is nothing
    // searchable locally — otherwise a client stuck with an empty/partial
    // source list would only recover once the cooldown happens to expire.
    const hasUsableSource = settings.sources.some((source) => source.enabled !== false);
    const forceSync =
      readSyncVersion() !== SYNC_STRATEGY_VERSION || !hasUsableSource;
    const now = Date.now();

    const subsToSync = forceSync
      ? activeSubscriptions
      : activeSubscriptions.filter(
          (sub: SourceSubscription) =>
            !(sub.lastUpdated && now - sub.lastUpdated < SYNC_COOLDOWN_MS)
        );

    if (subsToSync.length === 0) {
      writeSyncVersion();
      return;
    }

    let anyChanged = false;
    let currentSources = [...settings.sources];
    let currentPremiumSources = [...settings.premiumSources];
    let updatedSubscriptions = [...settings.subscriptions];

    // Fetch all subscriptions in parallel for better performance
    const results = await Promise.allSettled(
      subsToSync.map((sub: SourceSubscription) => fetchSourcesFromUrl(sub.url))
    );

    // Process results
    results.forEach((result, index) => {
      const sub = subsToSync[index];
      if (result.status === 'fulfilled') {
        const fetchResult = result.value;

        if (fetchResult.normalSources.length > 0) {
          currentSources = mergeSources(currentSources, fetchResult.normalSources);
          anyChanged = true;
        }

        if (fetchResult.premiumSources.length > 0) {
          currentPremiumSources = mergeSources(currentPremiumSources, fetchResult.premiumSources);
          anyChanged = true;
        }

        // Update timestamp for successful sync
        const subIdx = updatedSubscriptions.findIndex(s => s.id === sub.id);
        if (subIdx !== -1) {
          updatedSubscriptions[subIdx] = {
            ...updatedSubscriptions[subIdx],
            lastUpdated: now
          };
          anyChanged = true;
        }
      } else {
        console.error(`Failed to sync subscription: ${sub.name}`, result.reason);
      }
    });

    if (anyChanged) {
      settingsStore.saveSettings({
        ...settings,
        sources: currentSources,
        premiumSources: currentPremiumSources,
        subscriptions: updatedSubscriptions
      });
    }

    writeSyncVersion();
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

export function useSubscriptionSync() {
    useEffect(() => {
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const scheduleSync = () => {
            if (cancelled) return;
            timeoutId = setTimeout(() => {
                if (!cancelled) void runSync();
            }, INITIAL_SYNC_DELAY_MS);
        };

        // Env-provided subscriptions are only written after /api/auth resolves,
        // so if there are none yet we must wait instead of bailing out forever.
        if (hasActiveSubscriptions()) {
            scheduleSync();
            return () => {
                cancelled = true;
                if (timeoutId) clearTimeout(timeoutId);
            };
        }

        const unsubscribe = settingsStore.subscribe(() => {
            if (cancelled) return;
            if (hasActiveSubscriptions()) {
                unsubscribe();
                scheduleSync();
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []); // Empty dependency array - only run once on mount
}
