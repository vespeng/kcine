'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { settingsStore } from '@/lib/store/settings-store';
import { userSourcesStore } from '@/lib/store/user-sources-store';
import { traditionalToSimplified } from '@/lib/utils/chinese-convert';
import { isNormalVideoResource, parseVideoTitle } from '@/lib/utils/video';
import type { VideoSource } from '@/lib/types';

export type DirectPlayStatus = 'idle' | 'loading' | 'notfound';

interface DirectPlayMovie {
  title: string;
}

interface RawVideo {
  vod_id: string | number;
  vod_name?: string;
  type_name?: string;
  vod_remarks?: string;
  source: string;
}

export function useDirectPlay() {
  const router = useRouter();
  const [status, setStatus] = useState<DirectPlayStatus>('idle');
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight search when the hook is unmounted.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const resetDirectPlay = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  const handleDirectPlay = useCallback(async (movie: DirectPlayMovie) => {
    const title = movie.title?.trim();
    if (!title) return;

    // Resolve enabled sources (system + personal), matching the home search.
    const settings = settingsStore.getSettings();
    const enabledSources = settings.sources.filter((source) => source.enabled);
    const userSources = userSourcesStore.getSources().filter((source) => source.enabled !== false);
    const allSources: VideoSource[] = [...enabledSources];
    for (const userSource of userSources) {
      if (!allSources.find((source) => source.id === userSource.id)) {
        allSources.push(userSource);
      }
    }

    if (allSources.length === 0) {
      setStatus('notfound');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');

    try {
      const response = await fetch('/api/search-parallel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: title, sources: allSources, page: 1 }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setStatus('notfound');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
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
            if (data.type === 'videos' && Array.isArray(data.videos)) {
              for (const video of data.videos as RawVideo[]) {
                if (controller.signal.aborted) return;
                const rawName = traditionalToSimplified(video.vod_name || '').toLowerCase().replace(/\s+/g, '');
                const cleanName = traditionalToSimplified(parseVideoTitle(video.vod_name || '').cleanTitle).toLowerCase().replace(/\s+/g, '');
                if (rawName !== normalizedTitle && cleanName !== normalizedTitle) continue;
                if (!isNormalVideoResource(video)) continue;

                // Enter the play page as soon as a playable resource is found.
                // Remaining same-name sources are merged by the player page's
                // background source discovery.
                const params = new URLSearchParams({
                  id: String(video.vod_id),
                  source: video.source,
                  title,
                });
                router.push(`/player?${params.toString()}`);
                controller.abort();
                return;
              }
            }
          } catch {
            // Ignore malformed stream chunks.
          }
        }
      }

      if (controller.signal.aborted) return;

      setStatus('notfound');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setStatus('notfound');
    }
  }, [router]);

  return { status, handleDirectPlay, resetDirectPlay };
}
