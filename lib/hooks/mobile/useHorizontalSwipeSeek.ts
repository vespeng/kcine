import { useCallback, useState, useRef } from 'react';

interface HorizontalSwipeSeekHandler {
  /** Current playback time in seconds */
  getCurrentTime: () => number;
  /** Video duration in seconds (0 if unknown) */
  getDuration: () => number;
  /** Called on touch end with the accumulated seek delta (positive = forward, negative = backward) */
  onSeekCommit: (deltaSeconds: number) => void;
}

export interface HorizontalSwipeSeekState {
  isSeeking: boolean;
  /** Accumulated seek delta in seconds (positive = forward) */
  deltaSeconds: number;
}

interface UseHorizontalSwipeSeekOptions {
  /** Minimum horizontal displacement (px) to trigger a seek, default 20 */
  threshold?: number;
  /** Seconds per pixel of horizontal movement, default 0.25 */
  secondsPerPixel?: number;
}

/**
 * Hook for handling horizontal swipe-to-seek gestures on mobile devices
 * (same interaction pattern as mainstream video apps)
 *
 * Features:
 * - Horizontal drag previews the seek delta without touching the video until release
 * - Seeks commit on touch end, clamped to [0, duration]
 * - Must be used with a gesture coordinator to avoid conflicts with
 *   vertical swipe (volume/brightness) and long-press (2x speed)
 */
export function useHorizontalSwipeSeek(
  {
    getCurrentTime,
    getDuration,
    onSeekCommit,
  }: HorizontalSwipeSeekHandler,
  options: UseHorizontalSwipeSeekOptions = {}
) {
  const { threshold = 20, secondsPerPixel = 0.25 } = options;

  const [state, setState] = useState<HorizontalSwipeSeekState>({
    isSeeking: false,
    deltaSeconds: 0,
  });

  const startXRef = useRef<number>(0);
  const isActiveRef = useRef(false);
  const isTriggeredRef = useRef(false);
  const deltaSecondsRef = useRef(0);

  /** Clamp delta so the target time stays within [0, duration] */
  const clampDelta = useCallback((rawDelta: number) => {
    const currentTime = getCurrentTime();
    const duration = getDuration();

    let delta = rawDelta;
    if (duration > 0) {
      delta = Math.min(delta, duration - currentTime);
      delta = Math.max(delta, -currentTime);
    }
    return delta;
  }, [getCurrentTime, getDuration]);

  const init = useCallback((clientX: number) => {
    startXRef.current = clientX;
    deltaSecondsRef.current = 0;
    isTriggeredRef.current = false;
    isActiveRef.current = true;
  }, []);

  const move = useCallback((clientX: number) => {
    if (!isActiveRef.current) return false;

    const deltaX = clientX - startXRef.current;

    if (!isTriggeredRef.current && Math.abs(deltaX) < threshold) {
      return false;
    }

    if (!isTriggeredRef.current) {
      isTriggeredRef.current = true;
    }

    deltaSecondsRef.current = clampDelta(deltaX * secondsPerPixel);

    setState({
      isSeeking: true,
      deltaSeconds: deltaSecondsRef.current,
    });

    return true;
  }, [threshold, secondsPerPixel, clampDelta]);

  const end = useCallback(() => {
    const wasTriggered = isActiveRef.current && isTriggeredRef.current;
    isActiveRef.current = false;
    isTriggeredRef.current = false;
    setState({
      isSeeking: false,
      deltaSeconds: 0,
    });
    if (wasTriggered) {
      onSeekCommit(deltaSecondsRef.current);
    }
    return wasTriggered;
  }, [onSeekCommit]);

  const cancel = useCallback(() => {
    isActiveRef.current = false;
    isTriggeredRef.current = false;
    deltaSecondsRef.current = 0;
    setState({
      isSeeking: false,
      deltaSeconds: 0,
    });
  }, []);

  return {
    state,
    init,
    move,
    end,
    cancel,
  };
}
