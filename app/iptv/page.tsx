'use client';

/**
 * IPTV 直播页：M3U 源管理、频道栅格与播放器
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useIPTVStore } from '@/lib/store/iptv-store';
import { IPTVSourceManager } from '@/components/iptv/IPTVSourceManager';
import { IPTVChannelGrid } from '@/components/iptv/IPTVChannelGrid';
import { IPTVPlayer } from '@/components/iptv/IPTVPlayer';
import { Icons } from '@/components/ui/Icon';
import { hasPermission, getSession } from '@/lib/store/auth-store';
import { useRuntimeFeatures } from '@/components/RuntimeFeaturesProvider';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusCard } from '@/components/ui/StatusCard';
import type { M3UChannel } from '@/lib/utils/m3u-parser';

export default function IPTVPage() {
  const router = useRouter();
  const { iptvEnabled, restrictionSummary } = useRuntimeFeatures();
  const { sources, cachedChannels, cachedChannelsBySource, refreshSources, isLoading } = useIPTVStore();
  const [activeChannel, setActiveChannel] = useState<M3UChannel | null>(null);
  const [showManager, setShowManager] = useState(false);

  const canManageSources = hasPermission('iptv_source_management');
  const canAccessIPTV = hasPermission('iptv_access');
  const canUseBuiltinSources = hasPermission('iptv_builtin_sources');
  const visibleSources = useMemo(
    () => sources.filter((source) => canUseBuiltinSources || source.kind !== 'builtin'),
    [sources, canUseBuiltinSources]
  );
  const visibleSourceIds = useMemo(() => new Set(visibleSources.map((source) => source.id)), [visibleSources]);
  const visibleChannels = useMemo(
    () => cachedChannels.filter((channel) => !channel.sourceId || visibleSourceIds.has(channel.sourceId)),
    [cachedChannels, visibleSourceIds]
  );
  const visibleGroups = useMemo(
    () => Array.from(new Set(visibleChannels.map((channel) => channel.group).filter(Boolean))).sort() as string[],
    [visibleChannels]
  );
  const visibleChannelsBySource = useMemo(
    () =>
      Object.fromEntries(
        visibleSources
          .map((source) => [source.id, cachedChannelsBySource[source.id]])
          .filter(([, data]) => !!data)
      ),
    [visibleSources, cachedChannelsBySource]
  );

  // Auto-refresh on first load if we have sources but no cached channels
  useEffect(() => {
    if (!iptvEnabled) {
      return;
    }

    if (sources.length > 0 && cachedChannels.length === 0 && !isLoading) {
      refreshSources();
    }
  }, [iptvEnabled, sources.length, cachedChannels.length, isLoading, refreshSources]);

  // If auth is configured and user doesn't have iptv_access, show access denied
  if (!canAccessIPTV && getSession()) {
    return (
      <AppShell className="bg-bg bg-page">
        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <StatusCard
            icon={Icons.TV}
            tone="warning"
            surface={false}
            title="无权访问 IPTV"
            description="请联系管理员开通权限"
          >
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center min-h-touch rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200"
            >
              返回首页
            </Link>
          </StatusCard>
        </div>
      </AppShell>
    );
  }

  if (!iptvEnabled) {
    return (
      <AppShell className="bg-bg bg-page">
        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <StatusCard
            icon={Icons.TV}
            tone="warning"
            surface={false}
            title="当前部署已禁用 IPTV"
            description={restrictionSummary}
          >
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center min-h-touch rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:brightness-110 active:scale-98 transition-all duration-200"
            >
              返回首页
            </Link>
          </StatusCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="bg-bg bg-page bg-fixed">
      <PageContainer className="py-8 space-y-8">
          {/* 页头：返回 + 标题/频道数 + 管理源，样式与收藏/历史页一致 */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4">
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
                <h1 className="text-xl font-bold text-text flex items-center gap-2">
                  <Icons.TV size={20} className="text-primary" />
                  直播
                </h1>
                <p className="text-sm text-text-secondary">
                  {visibleChannels.length > 0 ? `${visibleChannels.length} 个频道` : 'IPTV 直播频道'}
                </p>
              </div>
            </div>

            {canManageSources && (
              <button
                onClick={() => setShowManager(!showManager)}
                className="px-4 py-2 rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Icons.Settings size={16} />
                管理源
              </button>
            )}
          </div>

          {/* Source Manager (collapsible) */}
          {showManager && (
            <div className="bg-surface border border-border rounded-2xl shadow-card p-6">
              <IPTVSourceManager />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-text-secondary">正在加载频道列表...</p>
            </div>
          )}

          {/* Channel Grid */}
          {!isLoading && (
            <div className="bg-surface border border-border rounded-2xl shadow-card p-4 sm:p-6">
              <IPTVChannelGrid
                channels={visibleChannels}
                groups={visibleGroups}
                onSelect={setActiveChannel}
                activeChannel={activeChannel}
                channelsBySource={visibleChannelsBySource}
                sources={visibleSources}
              />
            </div>
          )}
      </PageContainer>

        {/* Player Overlay */}
        {activeChannel && (
          <IPTVPlayer
            channel={activeChannel}
            onClose={() => setActiveChannel(null)}
            channels={visibleChannels}
            onChannelChange={setActiveChannel}
            channelsBySource={visibleChannelsBySource}
            sources={visibleSources}
          />
        )}
    </AppShell>
  );
}
