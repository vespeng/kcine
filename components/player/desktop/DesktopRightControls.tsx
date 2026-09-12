import React from 'react';
import { Icons } from '@/components/ui/Icon';



interface DesktopRightControlsProps {
    isNativeFullscreen: boolean;
    isWebFullscreen: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    isCastAvailable: boolean;
    onToggleNativeFullscreen: () => void;
    onToggleWebFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onShowCastMenu: () => void;
}

export function DesktopRightControls({
    isNativeFullscreen,
    isWebFullscreen,
    isPiPSupported,
    isAirPlaySupported,
    isCastAvailable,
    onToggleNativeFullscreen,
    onToggleWebFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onShowCastMenu
}: DesktopRightControlsProps) {
    return (
        <div className="player-controls-right relative z-50 flex shrink-0 items-center gap-3">
            {/* Picture-in-Picture */}
            {
                isPiPSupported && (
                    <button
                        onClick={onTogglePictureInPicture}
                        className="relative z-50 flex items-center justify-center min-w-10 h-10 bg-white/10 border border-white/20 rounded-2xl text-white transition-all duration-200 select-none touch-manipulation hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 shrink-0"
                        aria-label="画中画"
                        title="画中画"
                    >
                        <Icons.PictureInPicture size={20} />
                    </button>
                )
            }

            {/* AirPlay */}
            {
                isAirPlaySupported && (
                    <button
                        onClick={onShowAirPlayMenu}
                        className="relative z-50 flex items-center justify-center min-w-10 h-10 bg-white/10 border border-white/20 rounded-2xl text-white transition-all duration-200 select-none touch-manipulation hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 shrink-0"
                        aria-label="隔空播放"
                        title="隔空播放"
                    >
                        <Icons.Airplay size={20} />
                    </button>
                )
            }

            {/* Google Cast */}
            {
                isCastAvailable && (
                    <button
                        onClick={onShowCastMenu}
                        className="relative z-50 flex items-center justify-center min-w-10 h-10 bg-white/10 border border-white/20 rounded-2xl text-white transition-all duration-200 select-none touch-manipulation hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 shrink-0"
                        aria-label="投屏"
                        title="投屏"
                    >
                        <Icons.Cast size={20} />
                    </button>
                )
            }

            {/* Web Fullscreen */}
            <button
                onClick={onToggleWebFullscreen}
                className="relative z-50 flex items-center justify-center min-w-10 h-10 bg-white/10 border border-white/20 rounded-2xl text-white transition-all duration-200 select-none touch-manipulation hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 shrink-0"
                aria-label={isWebFullscreen ? '退出网页全屏' : '网页全屏'}
                title={isWebFullscreen ? '退出网页全屏 (W)' : '网页全屏 (W)'}
            >
                {isWebFullscreen
                    ? <Icons.WebFullscreenExit size={20} className="text-primary" />
                    : <Icons.WebFullscreen size={20} />}
            </button>

            {/* Native Fullscreen */}
            <button
                onClick={onToggleNativeFullscreen}
                className="relative z-50 flex items-center justify-center min-w-10 h-10 bg-white/10 border border-white/20 rounded-2xl text-white transition-all duration-200 select-none touch-manipulation hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 shrink-0"
                aria-label={isNativeFullscreen ? '退出系统全屏' : '系统全屏'}
                title={isNativeFullscreen ? '退出系统全屏 (F)' : '系统全屏 (F)'}
            >
                {isNativeFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
            </button>
        </div >
    );
}
