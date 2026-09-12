import { Icons } from '@/components/ui/Icon';
import { DragEndEvent } from '@dnd-kit/core';
import { TagInput } from './TagInput';
import { TagList } from './TagList';
import { Tag } from './SortableTag';

interface RecommendTagConfig {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

interface TagManagerProps {
  tags: Tag[];
  selectedTag: string;
  showTagManager: boolean;
  newTagInput: string;
  justAddedTag: boolean;
  onTagSelect: (tagId: string) => void;
  onTagDelete: (tagId: string) => void;
  onToggleManager: () => void;
  onRestoreDefaults: () => void;
  onNewTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onJustAddedTagHandled: () => void;
  isLoadingTags?: boolean;
  contentType?: 'movie' | 'tv';
  onContentTypeChange?: (type: 'movie' | 'tv') => void;
  recommendTag?: RecommendTagConfig;
}

export function TagManager({
  tags,
  selectedTag,
  showTagManager,
  newTagInput,
  justAddedTag,
  onTagSelect,
  onTagDelete,
  onToggleManager,
  onRestoreDefaults,
  onNewTagInputChange,
  onAddTag,
  onDragEnd,
  onJustAddedTagHandled,
  isLoadingTags,
  contentType,
  onContentTypeChange,
  recommendTag,
}: TagManagerProps) {
  return (
    <>
      {/* Management Controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onToggleManager}
          className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Icons.Tag size={16} />
          {showTagManager ? '完成' : '管理标签'}
        </button>
        {showTagManager && (
          <button
            onClick={onRestoreDefaults}
            className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Icons.RefreshCw size={16} />
            恢复默认
          </button>
        )}
      </div>

      {/* Add Custom Tag */}
      {showTagManager && (
        <TagInput
          newTagInput={newTagInput}
          onNewTagInputChange={onNewTagInputChange}
          onAddTag={onAddTag}
        />
      )}

      {/* Tag Filter */}
      {isLoadingTags ? (
        <div className="flex items-center gap-2 py-4">
          <Icons.RefreshCw size={16} className="animate-spin text-primary" />
          <span className="text-sm text-text-secondary">正在加载标签...</span>
        </div>
      ) : (
        <TagList
          tags={tags}
          selectedTag={selectedTag}
          showTagManager={showTagManager}
          justAddedTag={justAddedTag}
          onTagSelect={onTagSelect}
          onTagDelete={onTagDelete}
          onDragEnd={onDragEnd}
          onJustAddedTagHandled={onJustAddedTagHandled}
          contentType={contentType}
          onContentTypeChange={onContentTypeChange}
          recommendTag={recommendTag}
        />
      )}
    </>
  );
}

