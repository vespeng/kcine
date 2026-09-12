'use client';

import { Icons } from '@/components/ui/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Tag {
    id: string;
    label: string;
    value: string;
}

interface SortableTagProps {
    tag: Tag;
    selectedTag: string;
    showTagManager: boolean;
    onTagSelect: (id: string) => void;
    onTagDelete: (id: string) => void;
}

export function SortableTag({
    tag,
    selectedTag,
    showTagManager,
    onTagSelect,
    onTagDelete,
}: SortableTagProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tag.id, disabled: !showTagManager });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative flex-shrink-0"
        >
            <div className={`${showTagManager && !isDragging ? 'animate-jiggle' : ''}`}>
                <button
                    type="button"
                    onClick={() => onTagSelect(tag.id)}
                    className={`
            px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full cursor-pointer select-none
            ${selectedTag === tag.id
                            ? 'bg-primary text-white shadow-md scale-105'
                            : 'bg-surface backdrop-blur-xl text-text border border-border hover:border-primary hover:scale-105'
                        }
          `}
                >
                    {tag.label}
                </button>
                {showTagManager && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTagDelete(tag.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white flex items-center justify-center hover:bg-danger-dark transition-colors rounded-full cursor-pointer z-20 shadow-sm"
                    >
                        <Icons.X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
