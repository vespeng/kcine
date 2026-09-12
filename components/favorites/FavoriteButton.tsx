/**
 * FavoriteButton - Reusable favorite toggle button
 * Heart icon that fills when favorited, with animation
 */

'use client';

import { memo, useCallback, useState, useEffect } from 'react';
import { useFavorites } from '@/lib/store/favorites-store';
import { Icons } from '@/components/ui/Icon';

interface FavoriteButtonProps {
    videoId: string | number;
    source: string;
    title: string;
    poster?: string;
    sourceName?: string;
    type?: string;
    year?: string;
    remarks?: string;
    sourceMap?: Record<string, string | number>;
    className?: string;
    size?: number;
    showTooltip?: boolean;
    isPremium?: boolean;
}

export const FavoriteButton = memo<FavoriteButtonProps>(({
    videoId,
    source,
    title,
    poster,
    sourceName,
    type,
    year,
    remarks,
    sourceMap,
    className = '',
    size = 20,
    showTooltip = true,
    isPremium = false,
}) => {
    const { isFavorite, toggleFavorite } = useFavorites(isPremium);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isFav, setIsFav] = useState(false);

    // Sync with store on mount and when dependencies change
    useEffect(() => {
        setIsFav(isFavorite(videoId, source));
    }, [videoId, source, isFavorite]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true);
        const newState = toggleFavorite({
            videoId,
            source,
            title,
            poster,
            sourceName,
            type,
            year,
            remarks,
            sourceMap,
        });
        setIsFav(newState);

        setTimeout(() => setIsAnimating(false), 300);
    }, [videoId, source, title, poster, sourceName, type, year, remarks, sourceMap, toggleFavorite]);

    return (
        <button
            onClick={handleClick}
            className={`
        flex items-center justify-center
        p-2 rounded-full
        bg-surface backdrop-blur
        border border-border
        hover:scale-110 active:scale-95
        transition-all duration-200 ease-out
        cursor-pointer
        ${isAnimating ? 'scale-125' : ''}
        ${className}
      `}
            aria-label={isFav ? '取消收藏' : '收藏'}
            title={showTooltip ? (isFav ? '取消收藏' : '收藏') : undefined}
        >
            {isFav ? (
                <span
                    className={`flex drop-shadow-danger-glow transition-transform duration-200 ${isAnimating ? 'scale-120' : 'scale-100'}`}
                >
                    <Icons.HeartFilled
                        size={size}
                        className="text-danger"
                    />
                </span>
            ) : (
                <Icons.Heart
                    size={size}
                    className="text-text-secondary hover:text-danger-light transition-colors"
                />
            )}
        </button>
    );
});

FavoriteButton.displayName = 'FavoriteButton';
