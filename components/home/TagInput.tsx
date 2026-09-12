'use client';

interface TagInputProps {
    newTagInput: string;
    onNewTagInputChange: (value: string) => void;
    onAddTag: () => void;
}

export function TagInput({
    newTagInput,
    onNewTagInputChange,
    onAddTag,
}: TagInputProps) {
    return (
        <div className="mb-6 flex gap-2 flex-wrap">
            <input
                type="text"
                value={newTagInput}
                onChange={(e) => onNewTagInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
                placeholder="添加自定义标签..."
                className="flex-1 bg-surface backdrop-blur-xl border border-border text-text px-4 py-2 focus:outline-none focus:border-primary transition-colors rounded-2xl"
            />
            <button
                onClick={onAddTag}
                className="px-6 py-2 bg-primary text-white font-semibold hover:opacity-90 transition-opacity rounded-2xl cursor-pointer"
            >
                添加
            </button>
        </div>
    );
}
