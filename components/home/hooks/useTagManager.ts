import { useState, useEffect, useRef } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Tag } from '../SortableTag';

const DEFAULT_TAG = { id: 'popular', label: '热门', value: '热门' };

const STORAGE_KEY_PREFIX = 'kcine_custom_tags_';

const ensureDefaultTag = (tags: Tag[]) => {
    if (tags.some((tag) => tag.id === DEFAULT_TAG.id || tag.value === DEFAULT_TAG.value)) {
        return tags.map((tag) =>
            tag.id === DEFAULT_TAG.id || tag.value === DEFAULT_TAG.value
                ? { ...DEFAULT_TAG, ...tag, id: DEFAULT_TAG.id, value: DEFAULT_TAG.value }
                : tag
        );
    }

    return [DEFAULT_TAG, ...tags];
};

export function useTagManager() {
    const [contentType, setContentType] = useState<'movie' | 'tv'>(() => {
        if (typeof window === 'undefined') return 'movie';
        const saved = localStorage.getItem('kcine_default_content_type');
        return saved === 'tv' ? 'tv' : 'movie';
    });
    const [selectedTag, setSelectedTag] = useState(DEFAULT_TAG.id);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const [showTagManager, setShowTagManager] = useState(false);
    const [justAddedTag, setJustAddedTag] = useState(false);
    const isFirstLoadRef = useRef(true);

    // Persist content type preference
    useEffect(() => {
        localStorage.setItem('kcine_default_content_type', contentType);
    }, [contentType]);

    const storageKey = `${STORAGE_KEY_PREFIX}${contentType}`;

    // Load custom tags or fetch from Douban
    useEffect(() => {
        const loadTags = async () => {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsedTags = JSON.parse(saved);
                    setTags(Array.isArray(parsedTags) ? ensureDefaultTag(parsedTags) : [DEFAULT_TAG]);
                    return;
                } catch (e) {
                    console.error('Failed to parse saved tags', e);
                }
            }

            // If no saved tags, fetch from Douban
            // Only show loading indicator on initial load; on content type switches,
            // keep existing tags visible to avoid a jarring empty gap.
            if (isFirstLoadRef.current) {
                setIsLoadingTags(true);
            }
            try {
                const response = await fetch(`/api/douban/tags?type=${contentType}`);
                const data = await response.json();
                if (data.tags && Array.isArray(data.tags)) {
                    const mappedTags = data.tags.map((label: string) => ({
                        id: label === '热门' ? 'popular' : `tag_${label}`,
                        label,
                        value: label,
                    }));

                    const finalTags = ensureDefaultTag(mappedTags);
                    setTags(finalTags);
                    // Cache to localStorage so subsequent content type switches are instant
                    localStorage.setItem(storageKey, JSON.stringify(finalTags));
                } else {
                    setTags([DEFAULT_TAG]);
                }
            } catch (error) {
                console.error('Fetch tags error:', error);
                setTags([DEFAULT_TAG]);
            } finally {
                setIsLoadingTags(false);
            }
        };

        loadTags();
        isFirstLoadRef.current = false;
        setSelectedTag(DEFAULT_TAG.id);
    }, [contentType, storageKey]);

    const saveTags = (newTags: Tag[]) => {
        setTags(newTags);
        localStorage.setItem(storageKey, JSON.stringify(newTags));
    };

    const handleAddTag = () => {
        if (!newTagInput.trim()) return;
        const newTag = {
            id: `custom_${Date.now()}`,
            label: newTagInput.trim(),
            value: newTagInput.trim(),
        };
        saveTags([...tags, newTag]);
        setNewTagInput('');
        setJustAddedTag(true);
    };

    const handleDeleteTag = (tagId: string) => {
        if (tagId === DEFAULT_TAG.id) return;

        saveTags(tags.filter(t => t.id !== tagId));
        if (selectedTag === tagId) {
            setSelectedTag(DEFAULT_TAG.id);
        }
    };

    const handleRestoreDefaults = async () => {
        localStorage.removeItem(storageKey);
        // Refresh by re-fetching
        setIsLoadingTags(true);
        try {
            const response = await fetch(`/api/douban/tags?type=${contentType}`);
            const data = await response.json();
            if (data.tags && Array.isArray(data.tags)) {
                const mappedTags = data.tags.map((label: string) => ({
                    id: label === '热门' ? 'popular' : `tag_${label}`,
                    label,
                    value: label,
                }));
                const finalTags = ensureDefaultTag(mappedTags);
                setTags(finalTags);
                localStorage.setItem(storageKey, JSON.stringify(finalTags));
            } else {
                setTags([DEFAULT_TAG]);
            }
        } catch {
            setTags([DEFAULT_TAG]);
        } finally {
            setIsLoadingTags(false);
        }
        setSelectedTag(DEFAULT_TAG.id);
        setShowTagManager(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tags.findIndex((tag) => tag.id === active.id);
            const newIndex = tags.findIndex((tag) => tag.id === over.id);
            saveTags(arrayMove(tags, oldIndex, newIndex));
        }
    };

    return {
        tags,
        selectedTag,
        contentType,
        newTagInput,
        showTagManager,
        justAddedTag,
        isLoadingTags,
        setContentType,
        setSelectedTag,
        setNewTagInput,
        setShowTagManager,
        setJustAddedTag,
        handleAddTag,
        handleDeleteTag,
        handleRestoreDefaults,
        handleDragEnd,
    };
}
