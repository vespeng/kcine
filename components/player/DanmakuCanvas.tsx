'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { DanmakuComment } from '@/lib/types/danmaku';
import { settingsStore } from '@/lib/store/settings-store';
import {
  clampDanmakuY,
  haveDanmakuCanvasMetricsChanged,
  resolveDanmakuCanvasMetrics,
  scaleDanmakuCoordinate,
  type DanmakuCanvasMetrics,
} from '@/lib/player/danmaku-canvas-utils';

interface DanmakuCanvasProps {
  comments: DanmakuComment[];
  currentTime: number;
  isPlaying: boolean;
  duration: number;
}

interface ActiveDanmaku {
  comment: DanmakuComment & { _expiry?: number };
  x: number;
  y: number;
  speed: number;
  width: number;
  lane: number;
}

const SCROLL_DURATION = 8; // seconds for a comment to cross the screen
const LANE_HEIGHT_FACTOR = 1.4; // multiplied by font size for lane height
const TOP_BOTTOM_DURATION = 4; // seconds for top/bottom comments to stay visible
const MAX_LANES = 20;
const DEFAULT_DANMAKU_SETTINGS_SNAPSHOT = '0.7|20|0.5';

interface DanmakuSettingsSnapshot {
  opacity: number;
  fontSize: number;
  displayArea: number;
}

function readCssPixelValue(value: string): number | undefined {
  if (!value.endsWith('px')) return undefined;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readCanvasMetrics(canvas: HTMLCanvasElement): DanmakuCanvasMetrics | null {
  const style = window.getComputedStyle(canvas);
  const rect = canvas.getBoundingClientRect();

  return resolveDanmakuCanvasMetrics({
    computedWidth: readCssPixelValue(style.width),
    computedHeight: readCssPixelValue(style.height),
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
    offsetWidth: canvas.offsetWidth,
    offsetHeight: canvas.offsetHeight,
    boundingWidth: rect.width,
    boundingHeight: rect.height,
    devicePixelRatio: window.devicePixelRatio,
  });
}

function getDanmakuSettingsSnapshot(): string {
  const settings = settingsStore.getSettings();
  return `${settings.danmakuOpacity}|${settings.danmakuFontSize}|${settings.danmakuDisplayArea}`;
}

function subscribeToDanmakuSettings(listener: () => void): () => void {
  return settingsStore.subscribe(listener);
}

function parseDanmakuSettingsSnapshot(snapshot: string): DanmakuSettingsSnapshot {
  const [rawOpacity, rawFontSize, rawDisplayArea] = snapshot.split('|').map(Number);

  return {
    opacity: Number.isFinite(rawOpacity) ? rawOpacity : 0.7,
    fontSize: Number.isFinite(rawFontSize) ? rawFontSize : 20,
    displayArea: Number.isFinite(rawDisplayArea) ? rawDisplayArea : 0.5,
  };
}

export function DanmakuCanvas({ comments, currentTime, isPlaying }: DanmakuCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<ActiveDanmaku[]>([]);
  const lastTimeRef = useRef(currentTime);
  const lastRafTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef(-1);
  const laneSlotsRef = useRef<number[]>(new Array(MAX_LANES).fill(0)); // tracks when each lane becomes free
  const metricsRef = useRef<DanmakuCanvasMetrics | null>(null);

  const settingsSnapshot = React.useSyncExternalStore(
    subscribeToDanmakuSettings,
    getDanmakuSettingsSnapshot,
    () => DEFAULT_DANMAKU_SETTINGS_SNAPSHOT,
  );
  const { opacity, fontSize, displayArea } = React.useMemo(
    () => parseDanmakuSettingsSnapshot(settingsSnapshot),
    [settingsSnapshot],
  );

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const next = readCanvasMetrics(canvas);
    if (!next) return null;

    const previous = metricsRef.current;
    if (!haveDanmakuCanvasMetricsChanged(previous, next)) {
      return next;
    }

    canvas.width = next.bitmapWidth;
    canvas.height = next.bitmapHeight;

    const dimensionsChanged = Boolean(
      previous &&
      (Math.abs(previous.width - next.width) > 0.5 || Math.abs(previous.height - next.height) > 0.5)
    );

    if (previous && dimensionsChanged) {
      const effectiveHeight = next.height * displayArea;

      activeRef.current = activeRef.current.map((danmaku) => {
        const type = danmaku.comment.type || 'scroll';
        const y = clampDanmakuY(
          scaleDanmakuCoordinate(danmaku.y, previous.height, next.height),
          fontSize,
          effectiveHeight,
        );

        if (type === 'scroll') {
          return {
            ...danmaku,
            x: scaleDanmakuCoordinate(danmaku.x, previous.width, next.width),
            y,
            speed: (next.width + danmaku.width) / SCROLL_DURATION,
          };
        }

        return {
          ...danmaku,
          x: (next.width - danmaku.width) / 2,
          y,
        };
      });

      laneSlotsRef.current = new Array(MAX_LANES).fill(0);
    }

    metricsRef.current = next;
    return next;
  }, [displayArea, fontSize]);

  // Handle canvas resize. Use layout dimensions rather than transformed bounding
  // dimensions, otherwise CSS-rotated iOS fullscreen can stretch the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number | null = null;
    let timeoutIds: number[] = [];

    const clearScheduledResize = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
      timeoutIds = [];
    };

    const scheduleResize = () => {
      syncCanvasSize();
      clearScheduledResize();

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncCanvasSize();
      });
      timeoutIds = [
        window.setTimeout(syncCanvasSize, 120),
        window.setTimeout(syncCanvasSize, 360),
      ];
    };

    scheduleResize();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleResize) : null;
    observer?.observe(canvas);

    const visualViewport = window.visualViewport;
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    visualViewport?.addEventListener('resize', scheduleResize);
    visualViewport?.addEventListener('scroll', scheduleResize);

    return () => {
      clearScheduledResize();
      observer?.disconnect();
      window.removeEventListener('resize', scheduleResize);
      window.removeEventListener('orientationchange', scheduleResize);
      visualViewport?.removeEventListener('resize', scheduleResize);
      visualViewport?.removeEventListener('scroll', scheduleResize);
    };
  }, [syncCanvasSize]);

  // Clear on seek (when currentTime jumps significantly)
  useEffect(() => {
    const timeDiff = Math.abs(currentTime - lastTimeRef.current);
    if (timeDiff > 2) {
      activeRef.current = [];
      // Set to currentTime so only comments from the new position forward are spawned
      lastSpawnTimeRef.current = currentTime;
      laneSlotsRef.current = new Array(MAX_LANES).fill(0);
    }
    lastTimeRef.current = currentTime;
  }, [currentTime]);

  // Spawn new comments based on currentTime
  const spawnComments = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !comments.length) return;

    const metrics = metricsRef.current ?? syncCanvasSize();
    if (!metrics) return;

    const canvasWidth = metrics.width;
    const effectiveHeight = metrics.height * displayArea;
    const laneHeight = fontSize * LANE_HEIGHT_FACTOR;

    // Find comments in the time window [lastSpawn, time]
    const windowStart = lastSpawnTimeRef.current;
    const windowEnd = time;

    if (windowEnd <= windowStart) return;

    // Binary search for start index
    let lo = 0, hi = comments.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (comments[mid].time < windowStart) lo = mid + 1;
      else hi = mid;
    }

    // Spawn comments in range
    for (let i = lo; i < comments.length && comments[i].time <= windowEnd; i++) {
      const c = comments[i];
      const type = c.type || 'scroll';

      // Measure text width
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(c.text).width;

      if (type === 'scroll') {
        // Find available lane
        const speed = (canvasWidth + textWidth) / SCROLL_DURATION;
        let bestLane = -1;
        for (let lane = 0; lane < MAX_LANES; lane++) {
          const yPos = lane * laneHeight + fontSize;
          if (yPos > effectiveHeight - fontSize) break;
          if (laneSlotsRef.current[lane] <= time) {
            bestLane = lane;
            break;
          }
        }
        if (bestLane === -1) continue; // All lanes busy, drop comment

        // Calculate when this lane will be free again
        // (when the trailing edge of this comment has moved enough for a new one)
        const timeToPassStartPoint = textWidth / speed + 0.5; // add gap
        laneSlotsRef.current[bestLane] = time + timeToPassStartPoint;

        activeRef.current.push({
          comment: c,
          x: canvasWidth,
          y: bestLane * laneHeight + fontSize,
          speed,
          width: textWidth,
          lane: bestLane,
        });
      } else {
        // Top or bottom: find center lane
        const maxLanes = Math.floor(effectiveHeight / laneHeight / 2); // only use top/bottom half
        let bestLane = -1;
        for (let lane = 0; lane < Math.min(maxLanes, MAX_LANES); lane++) {
          const laneKey = type === 'top' ? lane : MAX_LANES - 1 - lane;
          if (laneSlotsRef.current[laneKey] <= time) {
            bestLane = lane;
            laneSlotsRef.current[laneKey] = time + TOP_BOTTOM_DURATION;
            break;
          }
        }
        if (bestLane === -1) continue;

        const y = type === 'top'
          ? bestLane * laneHeight + fontSize
          : effectiveHeight - bestLane * laneHeight - fontSize * 0.4;

        activeRef.current.push({
          comment: { ...c, _expiry: time + TOP_BOTTOM_DURATION },
          x: (canvasWidth - textWidth) / 2,
          y,
          speed: 0,
          width: textWidth,
          lane: bestLane,
        });
      }
    }

    lastSpawnTimeRef.current = windowEnd;
  }, [comments, displayArea, fontSize, syncCanvasSize]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = (rafTime: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const metrics = metricsRef.current ?? syncCanvasSize();
      if (!metrics) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        // When paused, still draw active comments frozen in place
        ctx.save();
        ctx.scale(metrics.dpr, metrics.dpr);
        ctx.globalAlpha = opacity;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';

        for (const d of activeRef.current) {
          ctx.fillStyle = d.comment.color || '#ffffff';
          ctx.strokeStyle = 'rgba(0,0,0,0.8)';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.strokeText(d.comment.text, d.x, d.y);
          ctx.fillText(d.comment.text, d.x, d.y);
        }

        ctx.restore();
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate time delta for animation
      const deltaMs = lastRafTimeRef.current ? rafTime - lastRafTimeRef.current : 16;
      lastRafTimeRef.current = rafTime;
      const deltaSec = deltaMs / 1000;

      // Spawn new comments
      spawnComments(currentTime);

      // Update & filter active comments
      const newActive: ActiveDanmaku[] = [];
      for (const d of activeRef.current) {
        const type = d.comment.type || 'scroll';

        if (type === 'scroll') {
          d.x -= d.speed * deltaSec;
          if (d.x + d.width > 0) {
            newActive.push(d);
          }
        } else {
          // Top/bottom: remove when expired
          const expiry = d.comment._expiry || 0;
          if (currentTime < expiry) {
            newActive.push(d);
          }
        }
      }
      activeRef.current = newActive;

      // Draw
      ctx.save();
      ctx.scale(metrics.dpr, metrics.dpr);
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textBaseline = 'middle';

      for (const d of activeRef.current) {
        ctx.fillStyle = d.comment.color || '#ffffff';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.strokeText(d.comment.text, d.x, d.y);
        ctx.fillText(d.comment.text, d.x, d.y);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRafTimeRef.current = 0;
    };
  }, [isPlaying, currentTime, opacity, fontSize, spawnComments, syncCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-danmaku pointer-events-none w-full h-full"
    />
  );
}
