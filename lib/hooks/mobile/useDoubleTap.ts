import { useCallback, useRef } from 'react';

interface DoubleTapHandler {
    onDoubleTap: () => void;
    onSingleTap: () => void;
}

const DOUBLE_TAP_INTERVAL_MS = 300;

/**
 * Hook for handling tap gestures on mobile devices
 * - Single tap: toggle controls visibility
 * - Double tap: toggle play/pause
 */
export function useDoubleTap({
    onDoubleTap,
    onSingleTap,
}: DoubleTapHandler) {
    const lastTapTimeRef = useRef<number>(0);
    const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearPendingSingleTap = useCallback(() => {
        if (singleTapTimeoutRef.current) {
            clearTimeout(singleTapTimeoutRef.current);
            singleTapTimeoutRef.current = null;
        }
    }, []);

    const handleTap = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
        const currentTime = Date.now();
        const videoElement = e.currentTarget;

        if (!videoElement) return;

        const timeDiff = currentTime - lastTapTimeRef.current;

        clearPendingSingleTap();

        // Double tap detected (within 300ms)
        if (timeDiff < DOUBLE_TAP_INTERVAL_MS && lastTapTimeRef.current > 0) {
            e.preventDefault();
            lastTapTimeRef.current = 0;
            onDoubleTap();
            return;
        }

        // Possible single tap - wait to see if there's a double tap
        lastTapTimeRef.current = currentTime;
        singleTapTimeoutRef.current = setTimeout(() => {
            // After 300ms, no double tap detected, execute single tap action
            onSingleTap();
            singleTapTimeoutRef.current = null;
        }, DOUBLE_TAP_INTERVAL_MS);
    }, [clearPendingSingleTap, onDoubleTap, onSingleTap]);

    return { handleTap, cancelPendingTap: clearPendingSingleTap };
}
