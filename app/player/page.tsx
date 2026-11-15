'use client';

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import { SourceInfo } from '@/components/player/EpisodeList';
import type { VideoSource } from '@/lib/types';
import type { VideoResolutionInfo } from '@/components/player/hooks/useVideoResolution';
import { useResolutionProbe } from '@/lib/hooks/useResolutionProbe';
import { setCachedResolution } from '@/lib/player/resolution-cache';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { useHistory } from '@/lib/store/history-store';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { AppShell } from '@/components/layout/AppShell';
import { settingsStore } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PageContainer } from '@/components/layout/PageContainer';
import { getSourceName } from '@/lib/utils/source-names';
import { retrieveGroupedSources, storeGroupedSources } from '@/lib/utils/grouped-sources-cache';
import { traditionalToSimplified } from '@/lib/utils/chinese-convert';
import { parseVideoTitle } from '@/lib/utils/video';
import { usePremiumTheme } from '@/lib/hooks/usePremiumTheme';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPremium = searchParams.get('premium') === '1';
  // Keep the premium player in dark theme; normal player follows the global theme
  usePremiumTheme(isPremium);
  const { addToHistory } = useHistory(isPremium);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode');
  // Support both legacy 'groupedSources' (full JSON) and new 'gs' (sessionStorage key)
  const groupedSourcesParam = searchParams.get('groupedSources');
  const gsKey = searchParams.get('gs');
  const missingRequiredParams = !videoId || !source;

  // Track settings - use mode-specific store
  const modeStore = isPremium ? premiumModeSettingsStore : settingsStore;
  const [isReversed, setIsReversed] = useState(() =>
    typeof window !== 'undefined' ? modeStore.getSettings().episodeReverseOrder : false
  );

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');
  const [isSourceSectionCollapsed, setIsSourceSectionCollapsed] = useState(false);
  const [isEpisodeSectionCollapsed, setIsEpisodeSectionCollapsed] = useState(false);

  // Sync with store changes if any (though usually it's one-way from UI to store)
  useEffect(() => {
    setIsReversed(modeStore.getSettings().episodeReverseOrder);
  }, [modeStore]);

  // Migrate legacy long groupedSources URL to short gs key
  useEffect(() => {
    if (groupedSourcesParam && !gsKey) {
      try {
        const data = JSON.parse(groupedSourcesParam);
        if (Array.isArray(data) && data.length > 0) {
          const newKey = storeGroupedSources(data);
          if (newKey) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('groupedSources');
            params.set('gs', newKey);
            router.replace(`/player?${params.toString()}`, { scroll: false });
          }
        }
      } catch { /* ignore parse errors */ }
    }
  }, [groupedSourcesParam, gsKey, router, searchParams]);

  useEffect(() => {
    if (missingRequiredParams) {
      router.push('/');
    }
  }, [missingRequiredParams, router]);

  const [pendingFallback, setPendingFallback] = useState(false);
  const [discoveredSources, setDiscoveredSources] = useState<SourceInfo[]>([]);
  const groupedSourcesRef = useRef<SourceInfo[]>([]);

  const handleSourceUnavailable = useCallback(() => {
    const groupedSources = groupedSourcesRef.current;
    const alternatives = groupedSources.filter((item) => item.source !== source);
    if (alternatives.length === 0) {
      setPendingFallback(true);
      return;
    }

    setPendingFallback(false);
    const best = [...alternatives].sort((left, right) => {
      const latA = left.latency ?? Infinity;
      const latB = right.latency ?? Infinity;
      return latA - latB;
    })[0];

    const params = new URLSearchParams();
    params.set('id', String(best.id));
    params.set('source', best.source);
    params.set('title', title || '');
    if (episodeParam) params.set('episode', episodeParam);
    if (gsKey) {
      params.set('gs', gsKey);
    } else if (groupedSources.length > 1) {
      const newKey = storeGroupedSources(groupedSources);
      if (newKey) params.set('gs', newKey);
    }
    if (isPremium) params.set('premium', '1');
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [episodeParam, gsKey, isPremium, router, source, title]);

  const {
    videoData,
    loading,
    videoError,
    currentEpisode,
    playUrl,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  } = useVideoPlayer(videoId, source, episodeParam, isReversed, handleSourceUnavailable);

  const groupedSources = useMemo<SourceInfo[]>(() => {
    let sources: SourceInfo[] = [];

    if (gsKey) {
      const cached = retrieveGroupedSources(gsKey);
      if (cached) sources = cached;
    } else if (groupedSourcesParam) {
      try {
        sources = JSON.parse(groupedSourcesParam);
      } catch {
        sources = [];
      }
    }

    if (discoveredSources.length > 0) {
      for (const ds of discoveredSources) {
        if (!sources.find((item) => item.source === ds.source)) {
          sources.push(ds);
        }
      }
    }

    if (source && !sources.find((item) => item.source === source)) {
      sources.unshift({
        id: videoId || '',
        source,
        sourceName: getSourceName(source),
        pic: videoData?.vod_pic,
      });
    }

    const fallbackPic = videoData?.vod_pic;
    if (fallbackPic) {
      sources = sources.map((item) => item.pic ? item : { ...item, pic: fallbackPic });
    }

    return sources;
  }, [discoveredSources, groupedSourcesParam, gsKey, source, videoData?.vod_pic, videoId]);

  useEffect(() => {
    groupedSourcesRef.current = groupedSources;
  }, [groupedSources]);

  // Retry pending fallback when discovered sources arrive
  useEffect(() => {
    if (pendingFallback && discoveredSources.length > 0) {
      handleSourceUnavailable();
    }
  }, [discoveredSources, handleSourceUnavailable, pendingFallback]);

  // Background fetch alternative sources when none provided or when existing ones lack full info
  useEffect(() => {
    if (!title) return;

    // Check if existing grouped sources already have full info (pic + latency)
    let existingSources: SourceInfo[] = [];
    if (gsKey) {
      const cached = retrieveGroupedSources(gsKey);
      if (cached) existingSources = cached;
    } else if (groupedSourcesParam) {
      try { existingSources = JSON.parse(groupedSourcesParam); } catch {}
    }
    // Always fetch alternatives if there's a pending fallback (source unavailable)
    const hasFullInfo = !pendingFallback && existingSources.length > 1 &&
      existingSources.every(s => s.pic || s.latency !== undefined);
    if (hasFullInfo) return;

    const settings = settingsStore.getSettings();
    const sourcesForMode = isPremium ? settings.premiumSources : settings.sources;
    const allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];
    // Only search other sources (not the current one)
    const otherSources = allSources.filter((s: VideoSource) => s.id !== source);
    if (otherSources.length === 0) return;

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: title, sources: otherSources, page: 1 }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const found: SourceInfo[] = [];
        const normalizedTitle = traditionalToSimplified(title).toLowerCase().replace(/\s+/g, '');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'videos' && data.videos) {
                // Find exact title match (same normalization as direct play)
                const match = data.videos.find((v: {
                  vod_name?: string;
                  vod_id: string | number;
                  source: string;
                  sourceDisplayName?: string;
                  latency?: number;
                  vod_pic?: string;
                  type_name?: string;
                  vod_remarks?: string;
                }) => {
                  const rawName = traditionalToSimplified(v.vod_name || '').toLowerCase().replace(/\s+/g, '');
                  const cleanName = traditionalToSimplified(parseVideoTitle(v.vod_name || '').cleanTitle).toLowerCase().replace(/\s+/g, '');
                  return rawName === normalizedTitle || cleanName === normalizedTitle;
                });
                if (match) {
                  found.push({
                    id: match.vod_id,
                    source: match.source,
                    sourceName: match.sourceDisplayName || getSourceName(match.source),
                    latency: match.latency,
                    pic: match.vod_pic,
                    typeName: match.type_name,
                    remarks: match.vod_remarks,
                  });
                  // Update state incrementally
                  setDiscoveredSources([...found]);
                }
              }
            } catch { /* ignore parse errors */ }
          }
        }
      } catch {
        // Silently ignore - this is a background enhancement
      }
    })();

    return () => controller.abort();
  }, [groupedSourcesParam, gsKey, isPremium, pendingFallback, source, title]);

  // Track current source for switching
  const [currentSourceId, setCurrentSourceId] = useState(source);
  const playerTimeRef = useRef(0);

  useEffect(() => {
    setCurrentSourceId(source);
  }, [source]);

  // Track detected video resolution from the player
  const [detectedResolution, setDetectedResolution] = useState<VideoResolutionInfo | null>(null);

  // Probe resolution for all grouped sources (not just the playing one)
  const probeList = useMemo(() => {
    return groupedSources.map((item) => ({
      id: item.id,
      source: item.source,
      episodeIndex: currentEpisode,
    }));
  }, [groupedSources, currentEpisode]);
  const { resolutions: sourceResolutions } = useResolutionProbe(probeList);

  const handleResolutionDetected = useCallback((info: VideoResolutionInfo) => {
    setDetectedResolution(info);
    if (videoId && source) {
      setCachedResolution(source, videoId, {
        ...info,
        origin: 'played',
        episodeIndex: currentEpisode,
      });
    }
  }, [currentEpisode, source, videoId]);

  // Add initial history entry when video data is loaded
  useEffect(() => {
    if (videoData && playUrl && videoId && source) {
      // Map episodes to include index
      const mappedEpisodes = videoData.episodes?.map((ep, idx) => ({
        name: ep.name || `第${idx + 1}集`,
        url: ep.url,
        index: idx,
      })) || [];

      addToHistory(
        videoId,
        videoData.vod_name || title || '未知视频',
        playUrl,
        currentEpisode,
        source,
        0, // Initial playback position
        0, // Will be updated by VideoPlayer
        videoData.vod_pic,
        mappedEpisodes,
        { vod_actor: videoData.vod_actor, type_name: videoData.type_name, vod_area: videoData.vod_area }
      );
    }
  }, [videoData, playUrl, videoId, currentEpisode, source, title, addToHistory]);

  const handleEpisodeClick = useCallback((episode: { url: string }, index: number) => {
    setCurrentEpisode(index);
    setPlayUrl(episode.url);
    setVideoError('');

    // Update URL to reflect current episode
    const params = new URLSearchParams(searchParams.toString());
    params.set('episode', index.toString());
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setCurrentEpisode, setPlayUrl, setVideoError]);

  const handleToggleReverse = (reversed: boolean) => {
    setIsReversed(reversed);
    const settings = modeStore.getSettings();
    modeStore.saveSettings({
      ...settings,
      episodeReverseOrder: reversed
    });
  };

  // Handle auto-next episode
  const handleNextEpisode = useCallback(() => {
    const episodes = videoData?.episodes;
    if (!episodes) return;

    let nextIndex;
    if (!isReversed) {
      if (currentEpisode >= episodes.length - 1) return;
      nextIndex = currentEpisode + 1;
    } else {
      if (currentEpisode <= 0) return;
      nextIndex = currentEpisode - 1;
    }

    const nextEpisode = episodes[nextIndex];
    if (nextEpisode) {
      handleEpisodeClick(nextEpisode, nextIndex); // handleEpisodeClick relies on state setters, which are stable
    }
  }, [currentEpisode, handleEpisodeClick, isReversed, videoData]);

  if (missingRequiredParams) {
    return null;
  }

  return (
    <AppShell
      isPremium={isPremium}
      onReset={() => router.push(isPremium ? '/premium' : '/')}
      showSidebar={false}
      className="bg-bg bg-page bg-fixed"
    >
      <PageContainer className="pb-20 pt-4">
        {videoError && !videoData ? (
          <PlayerError
            error={videoError}
            onRetry={fetchVideoDetails}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-player lg:items-start">
            {/* Video Player Section */}
            <div className="space-y-6">
              <div className="sm:mx-0">
                {loading ? (
                  <PlayerLoading />
                ) : (
                  <VideoPlayer
                    playUrl={playUrl}
                    videoId={videoId || undefined}
                    currentEpisode={currentEpisode}
                    onBack={() => router.back()}
                    totalEpisodes={videoData?.episodes?.length || 0}
                    onNextEpisode={handleNextEpisode}
                    isReversed={isReversed}
                    isPremium={isPremium}
                    videoTitle={videoData?.vod_name || title || ''}
                    episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
                    externalTimeRef={playerTimeRef}
                    onResolutionDetected={handleResolutionDetected}
                  />
                )}
              </div>
              {!loading && (
                <div className="hidden lg:block">
                  <VideoMetadata
                    videoData={videoData}
                    source={source}
                    title={title}
                  />
                </div>
              )}

              {/* Favorite Button for current video */}
              {videoData && videoId && (
                <div className="flex items-center gap-4 mt-4">
                  <FavoriteButton
                    videoId={videoId}
                    source={source}
                    title={videoData.vod_name || title || '未知视频'}
                    poster={videoData.vod_pic}
                    type={videoData.type_name}
                    year={videoData.vod_year}
                    sourceMap={Object.fromEntries(
                      (groupedSources.length > 0 ? groupedSources : [{ id: videoId, source }]).map((item) => [item.source, item.id])
                    )}
                    size={20}
                    isPremium={isPremium}
                  />
                  <span className="text-sm text-text-secondary">
                    收藏这个视频
                  </span>
                </div>
              )}
            </div>

            {/* 右侧栏吸顶，偏移与顶栏总高度一致；详情加载完成后再渲染 */}
            {!loading && (
            <div>
              <div className="lg:sticky lg:top-navbar space-y-6">
                {/* Mobile Tabs */}
                <SegmentedControl
                  options={[
                    { label: '选集', value: 'episodes' },
                    { label: '简介', value: 'info' },
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                  className="lg:hidden mb-4"
                />

                {/* Info Tab Content - Mobile Only */}
                <div className={activeTab !== 'info' ? 'hidden' : 'block lg:hidden'}>
                  <VideoMetadata
                    videoData={videoData}
                    source={source}
                    title={title}
                  />
                </div>

                {/* Episode List with integrated source selector - Visible if desktop OR active mobile tab */}
                <div className={activeTab !== 'episodes' ? 'hidden lg:block' : 'block'}>
                  <EpisodeList
                    episodes={videoData?.episodes || null}
                    currentEpisode={currentEpisode}
                    isReversed={isReversed}
                    onEpisodeClick={handleEpisodeClick}
                    onToggleReverse={handleToggleReverse}
                    sources={groupedSources.length > 0 ? groupedSources : undefined}
                    currentSource={currentSourceId || source || ''}
                    currentResolution={detectedResolution}
                    sourceResolutions={sourceResolutions}
                    sourceSectionCollapsed={isSourceSectionCollapsed}
                    onSourceSectionCollapseChange={setIsSourceSectionCollapsed}
                    episodeSectionCollapsed={isEpisodeSectionCollapsed}
                    onEpisodeSectionCollapseChange={setIsEpisodeSectionCollapsed}
                    onSourceChange={(newSource) => {
                      const params = new URLSearchParams();
                      params.set('id', String(newSource.id));
                      params.set('source', newSource.source);
                      params.set('title', title || '');
                      // Preserve current episode index
                      params.set('episode', currentEpisode.toString());
                      // Preserve playback position for seamless source switch
                      if (playerTimeRef.current > 1) {
                        params.set('t', Math.floor(playerTimeRef.current).toString());
                      }
                      // Store all known sources using short gs key
                      const allSources = groupedSources.length > 0 ? groupedSources : [];
                      if (allSources.length > 1) {
                        const newKey = storeGroupedSources(allSources);
                        if (newKey) params.set('gs', newKey);
                      } else if (gsKey) {
                        params.set('gs', gsKey);
                      }
                      if (isPremium) {
                        params.set('premium', '1');
                      }
                      setCurrentSourceId(newSource.source);
                      router.replace(`/player?${params.toString()}`, { scroll: false });
                    }}
                  />
                </div>
              </div>
            </div>
            )}
            </div>
          </div>
        )}
      </PageContainer>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar isPremium={isPremium} />
    </AppShell>
  );
}

/** 播放窗口占位：详情加载期间仅在此区域展示加载标识 */
function PlayerLoading() {
  return (
    <div className="w-full aspect-video rounded-2xl border border-border bg-panel flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      <p className="text-sm text-white/70">正在加载视频详情…</p>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
