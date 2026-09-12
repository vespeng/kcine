'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTag, Tag } from './SortableTag';
import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/ui/Icon';

interface RecommendTagConfig {
    label: string;
    isSelected: boolean;
    onSelect: () => void;
}

interface TagListProps {
    tags: Tag[];
    selectedTag: string;
    showTagManager: boolean;
    justAddedTag: boolean;
    onTagSelect: (tagId: string) => void;
    onTagDelete: (tagId: string) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onJustAddedTagHandled: () => void;
    contentType?: 'movie' | 'tv';
    onContentTypeChange?: (type: 'movie' | 'tv') => void;
    recommendTag?: RecommendTagConfig;
}

export function TagList({
    tags,
    selectedTag,
    showTagManager,
    justAddedTag,
    onTagSelect,
    onTagDelete,
    onDragEnd,
    onJustAddedTagHandled,
    contentType,
    onContentTypeChange,
    recommendTag,
}: TagListProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Auto-scroll to end when new tag is added
    useEffect(() => {
        if (justAddedTag && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollWidth,
                behavior: 'smooth',
            });
            onJustAddedTagHandled();
        }
    }, [justAddedTag, onJustAddedTagHandled]);

    // Handle horizontal scroll with mouse wheel
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Check if it's a vertical scroll (mostly deltaY) and negligible horizontal scroll
            if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        // Add passive: false to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        onDragEnd(event);
    };

    const activeTag = tags.find((t) => t.id === activeId);

    const isRecommendActive = !!recommendTag?.isSelected;
    const hasTypeRow = !!(contentType && onContentTypeChange) || !!recommendTag;
    const showContentTags = !isRecommendActive;

    const chipButtonClass = (active: boolean) => `
        px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none flex items-center gap-1.5
        ${active
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
        }
    `;

    const labelClass = 'text-sm font-medium text-text-secondary select-none';

    return (
        <>
            {/* Type Row: Movie / TV / Recommend — non-draggable, sits above content tags */}
            {hasTypeRow && (
                <div className={`${showContentTags ? 'mb-4' : 'mb-8'} flex items-center gap-3 flex-wrap pt-2 px-1`}>
                    <span className={labelClass}>分类</span>
                    {contentType && onContentTypeChange && (
                        <>
                            <button
                                type="button"
                                onClick={() => onContentTypeChange('movie')}
                                className={chipButtonClass(contentType === 'movie' && !isRecommendActive)}
                            >
                                电影
                            </button>
                            <button
                                type="button"
                                onClick={() => onContentTypeChange('tv')}
                                className={chipButtonClass(contentType === 'tv' && !isRecommendActive)}
                            >
                                剧集
                            </button>
                        </>
                    )}
                    {recommendTag && (
                        <button
                            type="button"
                            onClick={recommendTag.onSelect}
                            disabled={showTagManager}
                            className={`${chipButtonClass(isRecommendActive)} ${
                                showTagManager ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                            }`}
                        >
                            {recommendTag.label}
                        </button>
                    )}
                </div>
            )}

            {/* Content Tags Row — hidden when "推荐" is active */}
            {showContentTags && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div
                        ref={scrollContainerRef}
                        className={`mb-8 flex items-center gap-3 pb-3 pt-2 px-1 scrollbar-hide ${
                            showTagManager
                                ? 'flex-wrap overflow-visible'
                                : 'overflow-x-auto'
                        }`}
                    >
                        <span className={`${labelClass} flex-shrink-0`}>标签</span>
                        <SortableContext
                            items={tags.map((t) => t.id)}
                            strategy={showTagManager ? rectSortingStrategy : horizontalListSortingStrategy}
                        >
                            {tags.map((tag) => (
                                <SortableTag
                                    key={tag.id}
                                    tag={tag}
                                    selectedTag={selectedTag}
                                    showTagManager={showTagManager}
                                    onTagSelect={onTagSelect}
                                    onTagDelete={onTagDelete}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    <DragOverlay>
                        {activeId && activeTag ? (
                            <div className="relative flex-shrink-0 animate-jiggle">
                                <button className="px-4 py-1.5 text-xs font-medium whitespace-nowrap rounded-full bg-primary text-white shadow-xl scale-110 cursor-grabbing border border-transparent">
                                    {activeTag.label}
                                </button>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </>
    );
}
