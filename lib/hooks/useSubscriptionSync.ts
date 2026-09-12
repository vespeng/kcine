import { useEffect, useSyncExternalStore } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { fetchSourcesFromUrl, mergeSources } from '@/lib/utils/source-import-utils';
import type { ImportResult } from '@/lib/utils/source-import-utils';
import type { SourceSubscription, VideoSource } from '@/lib/types';

// Minimum time between syncs for the same subscription after a SUCCESSFUL sync (5 minutes).
// A failed sync never stamps `lastUpdated`, so it is retried on the next run.
const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
// Delay before initial sync to ensure settings are fully loaded
const INITIAL_SYNC_DELAY_MS = 1000;
// Cap a single subscription fetch so a dead/unroutable host can't stall the app
const SUBSCRIPTION_TIMEOUT_MS = 20 * 1000;
// Auto-retry schedule for failed runs (15s / 30s / 60s), then stop until the
// next page load or a manual retry.
const AUTO_RETRY_DELAYS_MS = [15 * 1000, 30 * 1000, 60 * 1000];

// Bump when the sync strategy changes. Existing clients inside the cooldown
// window with a stale/partial source list must be forced to re-sync once.
const SYNC_STRATEGY_VERSION = 3;
const SYNC_VERSION_KEY = 'kcine-subscription-sync-version';

// Module level so the PasswordGate instance and the page instance cannot run
// two overlapping syncs.
let syncInFlight: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let autoRetryIndex = 0;

export type SubscriptionSyncPhase = 'idle' | 'syncing' | 'ok' | 'error';

export interface SubscriptionSyncStatus {
  phase: SubscriptionSyncPhase;
  lastError: string | null;
  lastSyncedAt: number | null;
}

let syncStatus: SubscriptionSyncStatus = {
  phase: 'idle',
  lastError: null,
  lastSyncedAt: null,
};
const statusListeners = new Set<(status: SubscriptionSyncStatus) => void>();

function setSyncStatus(patch: Partial<SubscriptionSyncStatus>): void {
  syncStatus = { ...syncStatus, ...patch };
  statusListeners.forEach((listener) => {
    try {
      listener(syncStatus);
    } catch {
      // Listener errors must never break the sync loop.
    }
  });
}

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

async function fetchSubscription(url: string): Promise<ImportResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBSCRIPTION_TIMEOUT_MS);
  try {
    return await fetchSourcesFromUrl(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** Describe a fetch error in a user-friendly way (timeouts included). */
function describeFetchError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return '获取超时';
    return error.message;
  }
  return String(error);
}

function scheduleAutoRetry(): void {
  if (retryTimer) return;
  if (autoRetryIndex >= AUTO_RETRY_DELAYS_MS.length) return;

  const delay = AUTO_RETRY_DELAYS_MS[autoRetryIndex];
  autoRetryIndex += 1;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    void runSync();
  }, delay);
}

/**
 * Reconcile sources against the subscriptions that were successfully fetched
 * in this run. A source that a subscription previously offered (recorded in
 * `sub.sourceIds`) but no longer lists is dropped — otherwise dead/rotated
 * entries accumulate forever. Sources that are not attributed to any
 * subscription (manual/imported) are never touched.
 */
function reconcileSources(
  current: VideoSource[],
  subscriptions: SourceSubscription[],
  prevOwnersByUrl: Map<string, Set<string>>,
  fetchedByUrl: Map<string, ImportResult>
): VideoSource[] {
  if (fetchedByUrl.size === 0) return current;

  const offeredNow = new Set<string>();
  fetchedByUrl.forEach((result) => {
    result.normalSources.forEach((s) => offeredNow.add(s.id));
    result.premiumSources.forEach((s) => offeredNow.add(s.id));
  });
  const wasFetched = new Set(fetchedByUrl.keys());

  const isStale = (sourceId: string): boolean => {
    // Only sources we can attribute to a subscription are eligible for removal.
    const owners = subscriptions.filter((sub) => prevOwnersByUrl.get(sub.url)?.has(sourceId));
    if (owners.length === 0) return false;

    // Still offered by any successfully synced subscription → keep.
    if (offeredNow.has(sourceId)) return false;

    // An owner that we could not fetch this run has unknown state → keep.
    if (owners.some((owner) => !wasFetched.has(owner.url))) return false;

    // Every owner was fetched this run and dropped the source → stale.
    return true;
  };

  return current.filter((source) => !isStale(source.id));
}

async function runSync(): Promise<void> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const settings = settingsStore.getSettings();
    const activeSubscriptions = settings.subscriptions.filter(
      (sub: SourceSubscription) => sub.autoRefresh !== false
    );

    if (activeSubscriptions.length === 0) {
      setSyncStatus({ phase: 'idle', lastError: null });
      return;
    }

    setSyncStatus({ phase: 'syncing', lastError: null });

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
      setSyncStatus({ phase: 'ok', lastError: null, lastSyncedAt: now });
      return;
    }

    // Snapshot which subscription owned which source ids BEFORE this run, so we
    // can later detect ids that a subscription dropped. `updatedSubscriptions`
    // is a shallow clone: mutating an element never affects `settings`.
    const prevOwnersByUrl = new Map(
      settings.subscriptions.map((sub) => [sub.url, new Set(sub.sourceIds || [])])
    );

    const outcomes = await Promise.all(
      subsToSync.map(
        async (sub: SourceSubscription): Promise<
          { sub: SourceSubscription; ok: boolean; result?: ImportResult; error?: string }
        > => {
          try {
            const result = await fetchSubscription(sub.url);
            return { sub, ok: true, result };
          } catch (error) {
            return { sub, ok: false, error: describeFetchError(error) };
          }
        }
      )
    );

    let anyChanged = false;
    let currentSources = [...settings.sources];
    let currentPremiumSources = [...settings.premiumSources];
    const updatedSubscriptions = [...settings.subscriptions];
    // Successful fetches of this run, keyed by subscription url.
    const fetchedByUrl = new Map<string, ImportResult>();
    const failuresByUrl = new Map<string, string>();

    outcomes.forEach((outcome) => {
      const sub = outcome.sub;
      const subIdx = updatedSubscriptions.findIndex((s) => s.id === sub.id);

      if (!outcome.ok || !outcome.result) {
        failuresByUrl.set(sub.url, outcome.error || '同步失败');
        console.warn(`Failed to sync subscription: ${sub.name}`, outcome.error);
        return;
      }

      const { normalSources, premiumSources } = outcome.result;

      // An "empty" body is almost always a transient/upstream failure. Treating
      // it as success would both wipe the catalog (see reconcile) and stamp a
      // fresh `lastUpdated`, blocking recovery for 5 minutes.
      if (outcome.result.totalCount === 0) {
        failuresByUrl.set(sub.url, '订阅内容为空');
        console.warn(`Subscription returned no sources: ${sub.name}`);
        return;
      }

      fetchedByUrl.set(sub.url, outcome.result);

      if (normalSources.length > 0) {
        currentSources = mergeSources(currentSources, normalSources);
      }
      if (premiumSources.length > 0) {
        currentPremiumSources = mergeSources(currentPremiumSources, premiumSources);
      }

      // Record which source ids this subscription currently offers.
      const sourceIds = Array.from(
        new Set([...normalSources, ...premiumSources].map((source) => source.id))
      );

      if (subIdx !== -1) {
        updatedSubscriptions[subIdx] = {
          ...updatedSubscriptions[subIdx],
          lastUpdated: now,
          sourceIds,
        };
      }
      anyChanged = true;
    });

    // Remove sources that a synced subscription stopped offering (dead entries).
    const reconciledSources = reconcileSources(
      currentSources,
      settings.subscriptions,
      prevOwnersByUrl,
      fetchedByUrl
    );
    const reconciledPremiumSources = reconcileSources(
      currentPremiumSources,
      settings.subscriptions,
      prevOwnersByUrl,
      fetchedByUrl
    );

    if (
      reconciledSources.length !== currentSources.length ||
      reconciledPremiumSources.length !== currentPremiumSources.length
    ) {
      currentSources = reconciledSources;
      currentPremiumSources = reconciledPremiumSources;
      anyChanged = true;
    }

    if (anyChanged) {
      settingsStore.saveSettings({
        ...settings,
        sources: currentSources,
        premiumSources: currentPremiumSources,
        subscriptions: updatedSubscriptions,
      });
    }

    writeSyncVersion();

    const hasFailures = failuresByUrl.size > 0;
    const nowUsable = currentSources.some((source) => source.enabled !== false);

    if (hasFailures) {
      setSyncStatus({
        phase: 'error',
        lastError: failuresByUrl.values().next().value || '同步失败',
        lastSyncedAt: nowUsable ? now : null,
      });
      // Failed runs keep retrying in the background (with backoff) instead of
      // leaving the tab broken until the next manual reload.
      scheduleAutoRetry();
    } else {
      autoRetryIndex = 0;
      setSyncStatus({ phase: 'ok', lastError: null, lastSyncedAt: now });
    }
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

/**
 * Force a full sync right now (ignoring cooldown/strategy state). Used by the
 * "重试同步" action in the empty-state UI.
 */
export function retrySubscriptionSync(): Promise<void> {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  autoRetryIndex = 0;
  return runSync();
}

export function getSubscriptionSyncStatus(): SubscriptionSyncStatus {
  return syncStatus;
}

export function subscribeSubscriptionSyncStatus(
  listener: (status: SubscriptionSyncStatus) => void
): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** Reactive view of the subscription sync status (client components only). */
export function useSubscriptionSyncStatus(): SubscriptionSyncStatus {
  return useSyncExternalStore(
    subscribeSubscriptionSyncStatus,
    getSubscriptionSyncStatus,
    getSubscriptionSyncStatus
  );
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
