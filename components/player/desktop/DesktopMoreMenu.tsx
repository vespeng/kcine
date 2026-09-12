'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { usePlayerSettings } from '../hooks/usePlayerSettings';
import { settingsStore, AdFilterMode } from '@/lib/store/settings-store';

import { createPortal } from 'react-dom';

interface DesktopMoreMenuProps {
    showMoreMenu: boolean;
    isPremium?: boolean;
    isProxied?: boolean;
    onToggleMoreMenu: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onCopyLink: (type?: 'original' | 'proxy') => void;
    webFullscreenSize: 'full' | 'large' | 'focused';
    onCycleWebFullscreenSize: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    isRotated?: boolean;
}

export function DesktopMoreMenu({
    showMoreMenu,
    isPremium = false,
    isProxied = false,
    onToggleMoreMenu,
    onMouseEnter,
    onMouseLeave,
    onCopyLink,
    webFullscreenSize,
    onCycleWebFullscreenSize,
    containerRef,
    isRotated = false
}: DesktopMoreMenuProps) {
    const {
        autoNextEpisode,
        autoSkipIntro,
        skipIntroSeconds,
        autoSkipOutro,
        skipOutroSeconds,
        showModeIndicator,
        adFilter,
        setAutoNextEpisode,
        setAutoSkipIntro,
        setSkipIntroSeconds,
        setAutoSkipOutro,
        setSkipOutroSeconds,
        setShowModeIndicator,
        setAdFilter,
        adFilterMode,
        setAdFilterMode,
        fullscreenType,
        setFullscreenType,
        danmakuEnabled,
        setDanmakuEnabled,
        danmakuApiUrl,
        danmakuOpacity,
        setDanmakuOpacity,
        danmakuFontSize,
        setDanmakuFontSize,
        danmakuDisplayArea,
        setDanmakuDisplayArea,
    } = usePlayerSettings(isPremium);

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0, maxHeight: 'none', openUpward: false, align: 'right' as 'left' | 'right' });
    const [isAdFilterOpen, setAdFilterOpen] = React.useState(false);

    const AD_FILTER_LABELS: Record<string, string> = {
        off: '关闭',
        keyword: '关键词',
        heuristic: '智能(Beta)',
        aggressive: '激进'
    };
    const WEB_FULLSCREEN_SIZE_LABELS: Record<'full' | 'large' | 'focused', string> = {
        full: '铺满窗口',
        large: '大窗模式',
        focused: '聚焦影院',
    };

    const [isFullscreen, setIsFullscreen] = React.useState(false);

    React.useEffect(() => {
        const updateFullscreen = () => {
            // Check both native fullscreen and window fullscreen (CSS-based)
            const nativeFullscreen = !!document.fullscreenElement;
            const windowFullscreen = containerRef.current?.closest('.is-web-fullscreen') !== null;
            setIsFullscreen(nativeFullscreen || windowFullscreen);
        };
        document.addEventListener('fullscreenchange', updateFullscreen);
        // Also check periodically for window fullscreen changes (CSS class based)
        const interval = setInterval(updateFullscreen, 500);
        updateFullscreen();
        return () => {
            document.removeEventListener('fullscreenchange', updateFullscreen);
            clearInterval(interval);
        };
    }, [containerRef]);

    // Dual Positioning Strategy
    const calculateMenuPosition = React.useCallback(() => {
        if (!buttonRef.current || !containerRef.current) return;

        if (!isRotated && !isFullscreen) {
            // Normal Mode: Non-rotated, non-fullscreen
            // Use Viewport Coordinates but position relative to button
            // And use Body Portal to escape container clipping
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            const spaceBelow = viewportHeight - buttonRect.bottom - 10;
            const spaceAbove = buttonRect.top - 10;

            const estimatedMenuHeight = 450;
            const actualMenuHeight = menuRef.current?.offsetHeight || estimatedMenuHeight;

            const openUpward = spaceBelow < Math.min(actualMenuHeight, 300) && spaceAbove > spaceBelow;
            const maxHeight = openUpward
                ? Math.min(spaceAbove, actualMenuHeight)
                : Math.min(spaceBelow, viewportHeight * 0.7);

            // Smart Horizontal Alignment:
            // If button is on the left half of screen, align menu's left edge to button's left.
            // If button is on the right half of screen, align menu's right edge to button's right.
            const isLeftHalf = buttonRect.left < viewportWidth / 2;
            const align = isLeftHalf ? 'left' : 'right';

            let left = isLeftHalf ? buttonRect.left : buttonRect.right;

            // Boundary clamping
            if (isLeftHalf) {
                left = Math.max(left, 10);
            } else {
                left = Math.min(left, viewportWidth - 10);
            }

            setMenuPosition({
                top: openUpward
                    ? buttonRect.top - 10
                    : buttonRect.bottom + 10,
                left: left,
                maxHeight: `${maxHeight}px`,
                openUpward: openUpward,
                align: align
            });
        } else if (isFullscreen && !isRotated) {
            // Fullscreen Mode (not rotated): Use container-relative coordinates
            // Portal goes to containerRef to stay visible within fullscreen element
            let top = 0;
            let left = 0;
            let el: HTMLElement | null = buttonRef.current;

            while (el && el !== containerRef.current) {
                top += el.offsetTop;
                left += el.offsetLeft;
                el = el.offsetParent as HTMLElement;
            }

            const buttonHeight = buttonRef.current.offsetHeight;
            const buttonWidth = buttonRef.current.offsetWidth;
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            const spaceBelow = containerHeight - (top + buttonHeight) - 10;
            const spaceAbove = top - 10;

            const estimatedMenuHeight = 450;
            const actualMenuHeight = menuRef.current?.offsetHeight || estimatedMenuHeight;

            const openUpward = spaceBelow < Math.min(actualMenuHeight, 300) && spaceAbove > spaceBelow;
            const maxHeight = openUpward
                ? Math.min(spaceAbove, actualMenuHeight)
                : Math.min(spaceBelow, containerHeight * 0.7);

            const isLeftHalf = left < containerWidth / 2;
            const align = isLeftHalf ? 'left' : 'right';

            setMenuPosition({
                top: openUpward
                    ? top - 10
                    : top + buttonHeight + 10,
                left: isLeftHalf ? left : left + buttonWidth,
                maxHeight: `${maxHeight}px`,
                openUpward: openUpward,
                align: align
            });
        } else {
            // Rotated Mode: Use Container Coordinates (offset loop) and Portal to Container
            let top = 0;
            let left = 0;
            let el: HTMLElement | null = buttonRef.current;

            while (el && el !== containerRef.current) {
                top += el.offsetTop;
                left += el.offsetLeft;
                el = el.offsetParent as HTMLElement;
            }

            const buttonWidth = buttonRef.current.offsetWidth;
            const buttonHeight = buttonRef.current.offsetHeight;
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            // In rotated mode (90deg CW):
            // Landscape Vertical Axis = Container X Axis (left in code)
            // Landscape Horizontal Axis = Container Y Axis (top in code)

            // Visual available space in landscape:
            // Top of landscape is Container Left (x=0)
            // Bottom of landscape is Container Right (x=H_cont)
            const spaceToLandscapeTop = left;
            const spaceToLandscapeBottom = containerWidth - (left + buttonWidth);

            const estimatedMenuHeight = 450;
            const actualMenuHeight = menuRef.current?.offsetHeight || estimatedMenuHeight;

            const openUpward = spaceToLandscapeBottom < Math.min(actualMenuHeight, 300) && spaceToLandscapeTop > spaceToLandscapeBottom;
            const maxHeight = openUpward
                ? Math.min(spaceToLandscapeTop - 10, actualMenuHeight)
                : Math.min(spaceToLandscapeBottom - 10, containerHeight * 0.7);

            // Horizontal alignment (Landscape):
            // Landscape Right = Container Top (y=0)
            // Landscape Left = Container Bottom (y=H_cont)
            const isLandscapeRightHalf = top < containerHeight / 2;
            const align = isLandscapeRightHalf ? 'left' : 'right';

            setMenuPosition({
                top: top, // Fixed horizontal container coordinate
                left: left, // Fixed vertical container coordinate
                maxHeight: `${maxHeight}px`,
                openUpward: openUpward,
                align: align
            });
        }
    }, [containerRef, isRotated, isFullscreen]);



    // Auto-close menu on scroll
    React.useEffect(() => {
        if (!showMoreMenu) return;
        const handleScroll = () => {
            if (showMoreMenu) {
                onToggleMoreMenu();
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showMoreMenu, onToggleMoreMenu]);

    React.useEffect(() => {
        if (showMoreMenu) {
            calculateMenuPosition();
            const timer = setTimeout(calculateMenuPosition, 50);
            return () => clearTimeout(timer);
        }
    }, [showMoreMenu, calculateMenuPosition, isRotated]);

    const handleToggle = () => {
        if (!showMoreMenu) {
            calculateMenuPosition();
        }
        onToggleMoreMenu();
    };

    const MenuContent = (
        <div
            ref={menuRef}
            className={`absolute z-max bg-surface backdrop-blur-glass rounded-2xl border border-border shadow-overlay p-1.5 sm:p-2 w-fit ${isRotated ? 'min-w-menu-md' : 'min-w-menu-lg sm:min-w-menu-xl'} animate-scale-in overflow-y-auto`}
            style={{
                ...(isRotated ? {
                    // In Rotated Mode:
                    // menuPosition.left is Container X (Landscape Vertical)
                    // menuPosition.top is Container Y (Landscape Horizontal)

                    // Vertical Anchoring (Above/Below Button)
                    ...(menuPosition.openUpward ? {
                        right: `calc(100% - ${menuPosition.left}px + 10px)`,
                        left: 'auto'
                    } : {
                        left: `${menuPosition.left + buttonRef.current?.offsetWidth! + 10}px`,
                        right: 'auto'
                    }),

                    // Horizontal Anchoring (Left/Right to Button)
                    top: `${menuPosition.top}px`,
                    transform: menuPosition.align === 'right' ? 'translateY(-100%)' : 'none',
                } : {
                    // Normal Mode
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    transform: menuPosition.align === 'right' ? 'translateX(-100%)' : 'none',
                }),
                maxHeight: menuPosition.maxHeight,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            {/* Copy Link Options */}
            {isProxied ? (
                <>
                    <button
                        onClick={() => onCopyLink('original')}
                        className={`w-full ${isRotated ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm'} text-left text-text hover:bg-primary/15 rounded-2xl transition-colors flex items-center gap-2 group-hover:gap-3 cursor-pointer`}
                    >
                        <Icons.Link size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                        <span>复制原链接</span>
                    </button>
                    <button
                        onClick={() => onCopyLink('proxy')}
                        className={`w-full ${isRotated ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm'} text-left text-text hover:bg-primary/15 rounded-2xl transition-colors flex items-center gap-2 mt-0.5 cursor-pointer`}
                    >
                        <Icons.Link size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                        <span>复制代理链接</span>
                    </button>
                </>
            ) : (
                <button
                    onClick={() => onCopyLink('original')}
                    className={`w-full ${isRotated ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm'} text-left text-text hover:bg-primary/15 rounded-2xl transition-colors flex items-center gap-2 group-hover:gap-3 cursor-pointer`}
                >
                    <Icons.Link size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>复制链接</span>
                </button>
            )}

            {/* Divider */}
            <div className="h-px bg-border my-1.5 sm:my-2" />

            {/* Fullscreen Mode Selector */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center justify-between gap-4`}>
                <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <Icons.Settings size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>全屏方式</span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => {
                            if (fullscreenType === 'auto') setFullscreenType('native');
                            else if (fullscreenType === 'native') setFullscreenType('window');
                            else setFullscreenType('auto');
                        }}
                        className={`flex items-center gap-1 bg-surface border border-border text-text rounded-2xl outline-none hover:border-primary hover:bg-primary/5 transition-all cursor-pointer whitespace-nowrap ${isRotated ? 'px-1.5 py-0.5 text-3xs' : 'px-2 sm:px-2.5 py-1 sm:py-1.5 text-2xs sm:text-xs'}`}
                    >
                        <span>
                            {fullscreenType === 'auto' ? '自动 (Auto)' : fullscreenType === 'native' ? '系统全屏' : '网页全屏'}
                        </span>
                        <Icons.Maximize size={isRotated ? 10 : 12} className="text-text-secondary" />
                    </button>
                </div>
            </div>

            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center justify-between gap-4`}>
                <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <Icons.Target size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>网页全屏尺寸</span>
                </div>
                <button
                    onClick={onCycleWebFullscreenSize}
                    className={`flex items-center gap-1 bg-surface border border-border text-text rounded-2xl outline-none hover:border-primary hover:bg-primary/5 transition-all cursor-pointer whitespace-nowrap ${isRotated ? 'px-1.5 py-0.5 text-3xs' : 'px-2 sm:px-2.5 py-1 sm:py-1.5 text-2xs sm:text-xs'}`}
                >
                    <span>{WEB_FULLSCREEN_SIZE_LABELS[webFullscreenSize]}</span>
                    <Icons.ChevronDown size={isRotated ? 10 : 12} className="text-text-secondary" />
                </button>
            </div>

            {/* Show Mode Indicator Switch */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center justify-between gap-4`}>
                <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <Icons.Zap size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>模式指示器</span>
                </div>
                <button
                    onClick={() => setShowModeIndicator(!showModeIndicator)}
                    className={`relative rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${showModeIndicator
                        ? 'bg-primary shadow-primary-glow-sm'
                        : 'bg-white/5 hover:bg-white/10'
                        } ${isRotated ? 'w-6 h-3.5' : 'w-8 h-icon sm:w-10 sm:h-6'}`}
                    aria-checked={showModeIndicator}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-300 shadow-dropdown ${isRotated ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5'} ${showModeIndicator ? (isRotated ? 'translate-x-2.5' : 'translate-x-3.5 sm:translate-x-4.5') : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Ad Filter Mode Selector */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text">
                    <Icons.ShieldAlert size={16} className="sm:w-icon sm:h-icon" />
                    <span>广告过滤</span>
                </div>
                {/* Custom Ad Filter Mode Selector */}
                <div className="relative">
                    <button
                        onClick={() => setAdFilterOpen(!isAdFilterOpen)}
                        className="flex items-center gap-1 sm:gap-1.5 bg-surface border border-border text-text text-2xs sm:text-xs rounded-2xl px-2 sm:px-2.5 py-1 sm:py-1.5 outline-none hover:border-primary hover:bg-primary/5 transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span>{AD_FILTER_LABELS[adFilterMode] || '关闭'}</span>
                        <Icons.ChevronDown size={12} className={`text-text-secondary transition-transform duration-300 ${isAdFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAdFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setAdFilterOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-28 sm:w-32 bg-surface backdrop-blur-glass border border-border rounded-2xl shadow-overlay p-1 overflow-hidden z-20 flex flex-col animate-scale-in">
                                {Object.entries(AD_FILTER_LABELS).map(([mode, label]) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setAdFilterMode(mode as AdFilterMode);
                                            setAdFilterOpen(false);
                                        }}
                                        className={`text-left text-2xs sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl hover:bg-primary/15 transition-colors w-full flex items-center justify-between group ${adFilterMode === mode ? 'text-primary font-medium bg-primary/5' : 'text-text'
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {adFilterMode === mode && <Icons.Check size={10} className="sm:w-3 sm:h-3 text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-1.5 sm:my-2" />

            {/* Danmaku Toggle */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center justify-between gap-4`}>
                <div className={`flex items-center gap-2 ${!danmakuApiUrl ? 'text-text-secondary' : 'text-text'} ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <Icons.Danmaku size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>弹幕</span>
                    {!danmakuApiUrl && (
                        <span className={`${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'} text-text-secondary`}>(未配置)</span>
                    )}
                </div>
                <button
                    onClick={() => danmakuApiUrl && setDanmakuEnabled(!danmakuEnabled)}
                    disabled={!danmakuApiUrl}
                    className={`relative rounded-full transition-all duration-300 flex-shrink-0 border border-white/20 ${!danmakuApiUrl
                        ? 'bg-white/5 opacity-40 cursor-not-allowed'
                        : danmakuEnabled
                            ? 'bg-primary shadow-primary-glow-sm cursor-pointer'
                            : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                        } ${isRotated ? 'w-6 h-3.5' : 'w-8 h-icon sm:w-10 sm:h-6'}`}
                    aria-checked={danmakuEnabled}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-300 shadow-dropdown ${isRotated ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5'} ${danmakuEnabled && danmakuApiUrl ? (isRotated ? 'translate-x-2.5' : 'translate-x-3.5 sm:translate-x-4.5') : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Danmaku Sub-Settings (shown when enabled and configured) */}
            {danmakuEnabled && danmakuApiUrl && (
                <div className={`${isRotated ? 'px-2 pb-1.5' : 'px-3 pb-2 sm:px-4 sm:pb-2.5'} space-y-2.5`}>
                    {/* Opacity Slider */}
                    <div className={`${isRotated ? 'ml-4' : 'ml-6 sm:ml-7'}`}>
                        <div className={`flex items-center justify-between mb-1 ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'} text-text-secondary`}>
                            <span>透明度</span>
                            <span>{Math.round(danmakuOpacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={Math.round(danmakuOpacity * 100)}
                            onChange={(e) => setDanmakuOpacity(parseInt(e.target.value) / 100)}
                            className={`w-full accent-primary ${isRotated ? 'h-1' : 'h-1.5'}`}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Font Size Buttons */}
                    <div className={`${isRotated ? 'ml-4' : 'ml-6 sm:ml-7'}`}>
                        <div className={`mb-1 ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'} text-text-secondary`}>字号</div>
                        <div className="flex gap-1 flex-wrap">
                            {[14, 18, 20, 24, 28].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setDanmakuFontSize(size)}
                                    className={`rounded-2xl border font-medium transition-all duration-200 cursor-pointer ${isRotated ? 'px-1.5 py-0.5 text-3xs' : 'px-2 py-0.5 text-2xs sm:text-xs'} ${danmakuFontSize === size
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-surface border-border text-text hover:bg-primary/10'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Display Area Buttons */}
                    <div className={`${isRotated ? 'ml-4' : 'ml-6 sm:ml-7'}`}>
                        <div className={`mb-1 ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'} text-text-secondary`}>显示区域</div>
                        <div className="flex gap-1 flex-wrap">
                            {([
                                { value: 0.25, label: '1/4屏' },
                                { value: 0.5, label: '半屏' },
                                { value: 0.75, label: '3/4屏' },
                                { value: 1.0, label: '全屏' },
                            ] as const).map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setDanmakuDisplayArea(value)}
                                    className={`rounded-2xl border font-medium transition-all duration-200 cursor-pointer ${isRotated ? 'px-1.5 py-0.5 text-3xs' : 'px-2 py-0.5 text-2xs sm:text-xs'} ${danmakuDisplayArea === value
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-surface border-border text-text hover:bg-primary/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Next Episode Switch */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center justify-between gap-4`}>
                <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <Icons.SkipForward size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                    <span>自动下一集</span>
                </div>
                <button
                    onClick={() => setAutoNextEpisode(!autoNextEpisode)}
                    className={`relative rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoNextEpisode
                        ? 'bg-primary shadow-primary-glow-sm'
                        : 'bg-white/5 hover:bg-white/10'
                        } ${isRotated ? 'w-6 h-3.5' : 'w-8 h-icon sm:w-10 sm:h-6'}`}
                    aria-checked={autoNextEpisode}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-300 shadow-dropdown ${isRotated ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5'} ${autoNextEpisode ? (isRotated ? 'translate-x-2.5' : 'translate-x-3.5 sm:translate-x-4.5') : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Skip Intro Switch */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                        <Icons.FastForward size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                        <span>跳过片头</span>
                    </div>
                    <button
                        onClick={() => setAutoSkipIntro(!autoSkipIntro)}
                        className={`relative rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoSkipIntro
                            ? 'bg-primary shadow-primary-glow-sm'
                            : 'bg-white/5 hover:bg-white/10'
                            } ${isRotated ? 'w-6 h-3.5' : 'w-8 h-icon sm:w-10 sm:h-6'}`}
                        aria-checked={autoSkipIntro}
                        role="switch"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-300 shadow-dropdown ${isRotated ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5'} ${autoSkipIntro ? (isRotated ? 'translate-x-2.5' : 'translate-x-3.5 sm:translate-x-4.5') : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
                {/* Expandable Input */}
                {autoSkipIntro && (
                    <div className={`mt-2 flex items-center gap-1.5 ${isRotated ? 'ml-4' : 'ml-6 sm:ml-7'}`}>
                        <span className={`text-text-secondary ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'}`}>时长:</span>
                        <input
                            type="number"
                            min="0"
                            max="600"
                            value={skipIntroSeconds}
                            onChange={(e) => setSkipIntroSeconds(parseInt(e.target.value) || 0)}
                            className={`text-center bg-surface border border-border rounded-2xl text-text focus:outline-none focus:border-primary no-spinner ${isRotated ? 'w-10 px-1 py-0 text-2xs' : 'w-12 sm:w-16 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm'}`}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`text-text-secondary ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'}`}>秒</span>
                    </div>
                )}
            </div>

            {/* Skip Outro Switch */}
            <div className={`${isRotated ? 'px-2 py-1.5' : 'px-3 py-2 sm:px-4 sm:py-2.5'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className={`flex items-center gap-2 text-text ${isRotated ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                        <Icons.Rewind size={isRotated ? 14 : 16} className="sm:w-icon sm:h-icon" />
                        <span>跳过片尾</span>
                    </div>
                    <button
                        onClick={() => setAutoSkipOutro(!autoSkipOutro)}
                        className={`relative rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoSkipOutro
                            ? 'bg-primary shadow-primary-glow-sm'
                            : 'bg-white/5 hover:bg-white/10'
                            } ${isRotated ? 'w-6 h-3.5' : 'w-8 h-icon sm:w-10 sm:h-6'}`}
                        aria-checked={autoSkipOutro}
                        role="switch"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-300 shadow-dropdown ${isRotated ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5'} ${autoSkipOutro ? (isRotated ? 'translate-x-2.5' : 'translate-x-3.5 sm:translate-x-4.5') : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
                {/* Expandable Input */}
                {autoSkipOutro && (
                    <div className={`mt-2 flex items-center gap-1.5 ${isRotated ? 'ml-4' : 'ml-6 sm:ml-7'}`}>
                        <span className={`text-text-secondary ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'}`}>剩余:</span>
                        <input
                            type="number"
                            min="0"
                            max="600"
                            value={skipOutroSeconds}
                            onChange={(e) => setSkipOutroSeconds(parseInt(e.target.value) || 0)}
                            className={`text-center bg-surface border border-border rounded-2xl text-text focus:outline-none focus:border-primary no-spinner ${isRotated ? 'w-10 px-1 py-0 text-2xs' : 'w-12 sm:w-16 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm'}`}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`text-text-secondary ${isRotated ? 'text-3xs' : 'text-2xs sm:text-xs'}`}>秒</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="更多选项"
                title="更多选项"
            >
                <Icons.MoreHorizontal className="text-white/80 group-hover:text-white w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* More Menu Dropdown (Portal) */}
            {/* More Menu Dropdown (Portal) */}
            {showMoreMenu && typeof document !== 'undefined' && createPortal(MenuContent, ((isRotated || isFullscreen) && containerRef.current) ? containerRef.current : document.body)}
        </div>
    );
}
