import { useCallback, useRef } from 'react';
import { useLongPress } from './useLongPress';
import { useSwipeGesture, type SwipeGestureState } from './useSwipeGesture';
import {
  useHorizontalSwipeSeek,
  type HorizontalSwipeSeekState,
} from './useHorizontalSwipeSeek';

interface MobileGesturesHandler {
  onVolumeChange: (volume: number) => void;
  onBrightnessChange: (brightness: number) => void;
  getCurrentVolume: () => number;
  getCurrentBrightness: () => number;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  onSeekCommit: (deltaSeconds: number) => void;
  /** Called when a gesture (long-press/swipe/seek) activates, so pending single-tap actions can be cancelled */
  onGestureActivate: () => void;
}

interface MobileGesturesOptions {
  disabled?: boolean;
}

interface MobileGesturesResult {
  swipeState: SwipeGestureState;
  seekState: HorizontalSwipeSeekState;
  isLongPressSpeed: boolean;
  handleTouchStart: (e: React.TouchEvent<HTMLVideoElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLVideoElement>) => void;
  handleTouchEnd: () => void;
}

type GestureMode = 'idle' | 'longPress' | 'swipe' | 'seek';

/**
 * Unified gesture coordinator for mobile video player
 *
 * Gesture priority and conflict resolution:
 * 1. Touch start → Init long-press timer, vertical swipe and horizontal swipe-to-seek detection
 * 2. If vertical movement exceeds threshold before long-press triggers → Activate swipe mode (volume/brightness)
 * 3. If horizontal movement dominates (|dx| > |dy|) and exceeds threshold → Activate seek mode (swipe to seek)
 * 4. If long-press triggers before significant movement → Lock to long-press mode, ignore swipes
 * 5. Long-press active → Swipes are completely disabled until touch ends
 *
 * This ensures:
 * - Long press shows ONLY 2x speed indicator (no volume/brightness/seek UI)
 * - Vertical swipe shows ONLY volume/brightness indicator (no 2x speed/seek UI)
 * - Horizontal swipe shows ONLY seek preview (no volume/brightness/2x speed UI)
 * - No overlapping or conflicting gestures
 */
export function useMobileGestures(
  handlers: MobileGesturesHandler,
  options: MobileGesturesOptions = {}
): MobileGesturesResult {
  const { disabled = false } = options;

  // Gesture mode tracking
  const modeRef = useRef<GestureMode>('idle');
  const isLongPressSpeedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const activate = useCallback((mode: Exclude<GestureMode, 'idle'>) => {
    modeRef.current = mode;
    handlers.onGestureActivate();
  }, [handlers]);

  // Long press gesture
  const longPress = useLongPress(
    {
      onLongPressStart: () => {
        // Only activate if not already in a swipe mode
        if (modeRef.current === 'idle') {
          activate('longPress');
          isLongPressSpeedRef.current = true;
          handlers.onLongPressStart();
          // Cancel swipes if they were initialized but not triggered
          swipe.cancel();
          seek.cancel();
        }
      },
      onLongPressEnd: () => {
        isLongPressSpeedRef.current = false;
        handlers.onLongPressEnd();
      },
    },
    { delay: 300 }
  );

  // Vertical swipe gesture (volume/brightness)
  const swipe = useSwipeGesture(
    {
      onVolumeChange: handlers.onVolumeChange,
      onBrightnessChange: handlers.onBrightnessChange,
      getCurrentVolume: handlers.getCurrentVolume,
      getCurrentBrightness: handlers.getCurrentBrightness,
    },
    { threshold: 30, sensitivity: 0.005 }
  );

  // Horizontal swipe-to-seek gesture
  const seek = useHorizontalSwipeSeek(
    {
      getCurrentTime: handlers.getCurrentTime,
      getDuration: handlers.getDuration,
      onSeekCommit: handlers.onSeekCommit,
    },
    { threshold: 20, secondsPerPixel: 0.25 }
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
    if (disabled || !e.touches[0]) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();

    // Reset mode
    modeRef.current = 'idle';

    // Record start position for orientation detection
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;

    // Initialize all gestures
    longPress.start();
    swipe.init(touch.clientX, touch.clientY, rect.width);
    seek.init(touch.clientX);
  }, [disabled, longPress, swipe, seek]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
    if (disabled || !e.touches[0]) return;

    const touch = e.touches[0];

    // If already in long-press mode, ignore movement (don't cancel)
    if (modeRef.current === 'longPress') {
      return;
    }

    // Horizontal seek in progress
    if (modeRef.current === 'seek') {
      seek.move(touch.clientX);
      return;
    }

    // Vertical swipe in progress
    if (modeRef.current === 'swipe') {
      swipe.move(touch.clientY);
      return;
    }

    // Still idle: decide orientation by dominant axis
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal dominant → try seek
      if (seek.move(touch.clientX) && modeRef.current === 'idle') {
        activate('seek');
        longPress.cancel();
        swipe.cancel();
      }
      return;
    }

    // Vertical dominant → try swipe (volume/brightness)
    const swipeActivated = swipe.move(touch.clientY);
    if (swipeActivated && modeRef.current === 'idle') {
      activate('swipe');
      longPress.cancel();
      seek.cancel();
    }
  }, [disabled, longPress, swipe, seek, activate]);

  const handleTouchEnd = useCallback(() => {
    // Commit or end all gestures
    longPress.end();
    swipe.end();
    seek.end();

    // Reset mode after a short delay to allow state updates
    setTimeout(() => {
      modeRef.current = 'idle';
    }, 50);
  }, [longPress, swipe, seek]);

  return {
    swipeState: swipe.state,
    seekState: seek.state,
    isLongPressSpeed: isLongPressSpeedRef.current,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
